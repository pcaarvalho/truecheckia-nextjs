import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const accessToken = request.cookies.get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token and get user
    let userPayload
    try {
      userPayload = verifyAccessToken(accessToken)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please create a subscription first.' },
        { status: 400 }
      )
    }

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    })

    return NextResponse.json({
      url: portalSession.url,
    })

  } catch (error) {
    console.error('Stripe portal session error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}