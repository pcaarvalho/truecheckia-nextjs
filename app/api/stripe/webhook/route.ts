import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const email = session.metadata?.email || session.customer_email
    const plan = session.metadata?.plan
    const isPublicCheckout = session.metadata?.isPublicCheckout === 'true'

    console.log('Checkout metadata:', {
      userId,
      email,
      plan,
      isPublicCheckout,
      customerId: session.customer,
      subscriptionId: session.subscription
    })

    if (!email || !plan) {
      console.error('Missing required metadata in checkout session')
      return
    }

    // For public checkout with pending userId, find or create user by email
    let user
    if (userId === 'pending' || !userId) {
      user = await prisma.user.findUnique({
        where: { email }
      })

      // If user doesn't exist and it's a public checkout, create a placeholder user
      if (!user && isPublicCheckout) {
        console.log('Creating placeholder user for public checkout')
        const credits = plan === 'PRO' ? 1000 : 10000 // PRO or ENTERPRISE credits
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0], // Use email prefix as temporary name
            password: '', // Will be set when they register
            plan: plan as any,
            credits,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            emailVerified: false, // They'll need to verify when registering
            role: 'USER',
          }
        })
        console.log('Created placeholder user:', user.id)
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
    }

    if (!user) {
      console.error('User not found for checkout session:', { userId, email })
      return
    }

    // Update user with subscription details if not already set
    if (!user.stripeSubscriptionId || user.stripeSubscriptionId !== session.subscription) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan: plan as any,
          credits: plan === 'PRO' ? 1000 : 10000,
        }
      })
    }

    // Get the subscription from Stripe and handle it
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      // Update the subscription with the correct user ID
      subscription.metadata = {
        ...subscription.metadata,
        userId: user.id,
        email,
        plan
      }
      await handleSubscriptionChange(subscription)
    }

    console.log(`Checkout completed for user ${user.id} (email: ${email})`)
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    let userId = subscription.metadata?.userId
    const email = subscription.metadata?.email

    // If no userId, try to find user by customer ID or email
    if (!userId || userId === 'pending') {
      let user
      if (email) {
        user = await prisma.user.findUnique({ where: { email } })
      }
      
      if (!user && subscription.customer) {
        user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string }
        })
      }
      
      if (!user) {
        console.error('No user found for subscription:', { userId, email, customerId: subscription.customer })
        return
      }
      
      userId = user.id
    }

    // Determine plan based on price ID
    const priceId = subscription.items.data[0]?.price.id
    let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'
    let credits = 10 // Default FREE credits

    // Map price IDs to plans using environment variables
    const proPriceMonthly = process.env.STRIPE_PRO_PRICE_MONTHLY || 'price_1RyeYEPfgG67ZB4m6XR7GC81'
    const proPriceYearly = process.env.STRIPE_PRO_PRICE_YEARLY || 'price_1RyeYFPfgG67ZB4miaVlYOGJ'
    
    if (priceId === proPriceMonthly || priceId === proPriceYearly) {
      plan = 'PRO'
      credits = 1000 // PRO credits
    }

    // Update user subscription data
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
        creditsResetAt: new Date(), // Reset credits immediately
      },
    })

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId || '',
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
      update: {
        stripePriceId: priceId || '',
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    })

    console.log(`Subscription updated for user ${userId}: ${plan} plan`)
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    let userId = subscription.metadata?.userId
    const email = subscription.metadata?.email

    // If no userId, try to find user by customer ID or email
    if (!userId || userId === 'pending') {
      let user
      if (email) {
        user = await prisma.user.findUnique({ where: { email } })
      }
      
      if (!user && subscription.customer) {
        user = await prisma.user.findFirst({
          where: { stripeCustomerId: subscription.customer as string }
        })
      }
      
      if (!user) {
        console.error('No user found for subscription deletion:', { userId, email, customerId: subscription.customer })
        return
      }
      
      userId = user.id
    }

    // Downgrade user to FREE plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'FREE',
        credits: 10, // Reset to FREE credits
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
        stripeCancelAtPeriodEnd: false,
        creditsResetAt: new Date(),
      },
    })

    // Update subscription record status
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        updatedAt: new Date(),
      },
    })

    console.log(`Subscription canceled for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscription = (invoice as any).subscription
    if (!subscription) return

    // Get subscription details
    const subscriptionObj = await stripe.subscriptions.retrieve(subscription as string)
    
    // Reset credits for the billing period
    const userId = subscriptionObj.metadata?.userId
    const email = subscriptionObj.metadata?.email
    
    let user
    if (userId && userId !== 'pending') {
      user = await prisma.user.findUnique({ where: { id: userId } })
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } })
    } else if (subscriptionObj.customer) {
      user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscriptionObj.customer as string }
      })
    }
    
    if (user) {
      // Reset credits based on plan
      const priceId = subscriptionObj.items.data[0]?.price.id
      const proPriceMonthly = process.env.STRIPE_PRO_PRICE_MONTHLY || 'price_1RyeYEPfgG67ZB4m6XR7GC81'
      const proPriceYearly = process.env.STRIPE_PRO_PRICE_YEARLY || 'price_1RyeYFPfgG67ZB4miaVlYOGJ'
      
      let credits = 10 // Default
      if (priceId === proPriceMonthly || priceId === proPriceYearly) {
        credits = 1000 // PRO credits
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          credits,
          creditsResetAt: new Date()
        }
      })
      
      console.log(`Credits reset for user ${user.id}: ${credits} credits`)
    }
    
    await handleSubscriptionChange(subscriptionObj)

    console.log(`Payment succeeded for subscription ${subscription}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscription = (invoice as any).subscription
    if (!subscription) return

    console.log(`Payment failed for subscription ${subscription}`)
    // You might want to send an email notification here
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}