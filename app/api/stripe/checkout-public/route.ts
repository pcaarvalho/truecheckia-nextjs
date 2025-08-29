import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, createCheckoutSession, createOrRetrieveCustomer, STRIPE_PRICES } from '@/lib/stripe/client';
import { withErrorHandler, createResponse, createErrorResponse, AppError, ERROR_CODES } from '@/lib/middleware';
import { z } from 'zod';

const publicCheckoutSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  email: z.string().email('Please provide a valid email address'),
});

async function createPublicCheckoutSessionHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { plan, interval, email } = publicCheckoutSchema.parse(body);

    console.log('Public checkout request:', { plan, interval, email });

    // Check if Enterprise plan - redirect to contact sales
    if (plan === 'ENTERPRISE') {
      throw new AppError('Enterprise plan requires custom pricing. Please contact sales.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Get price ID based on plan and interval (only PRO is supported via checkout)
    let priceId: string;
    if (plan === 'PRO') {
      priceId = interval === 'monthly' ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.PRO_YEARLY;
    } else {
      throw new AppError('Invalid plan for checkout', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    console.log('Using price ID:', priceId);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, we'll create a placeholder that will be activated when they register/login
    // If user exists, check if they already have an active subscription
    if (user && user.stripeSubscriptionId) {
      throw new AppError('User already has an active subscription', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Create or retrieve Stripe customer
    const customer = await createOrRetrieveCustomer({
      email,
      userId: user?.id || 'pending', // Use 'pending' if user doesn't exist yet
    });

    console.log('Customer created/retrieved:', customer.id);

    // If user exists, update with customer ID
    if (user && !user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // For public checkout, we need special success/cancel URLs
    const successUrl = user 
      ? `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}` 
      : `${baseUrl}/register?checkout=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`;
    
    const cancelUrl = `${baseUrl}/pricing?checkout=cancelled`;

    console.log('Creating checkout session with:', {
      priceId,
      customerId: customer.id,
      userId: user?.id || 'pending',
      plan,
      successUrl,
      cancelUrl,
      baseUrl
    });

    const checkoutSession = await createCheckoutSession({
      priceId,
      customerId: customer.id,
      userId: user?.id || 'pending',
      plan,
      successUrl,
      cancelUrl,
    });

    console.log('Checkout session created:', {
      id: checkoutSession.id,
      url: checkoutSession.url,
      hasUrl: !!checkoutSession.url
    });

    return createResponse({
      sessionId: checkoutSession.id,
      url: checkoutSession.url || null,
      requiresRegistration: !user,
    });

  } catch (error) {
    console.error('Public checkout error:', error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AppError(firstError.message, 400, ERROR_CODES.VALIDATION_ERROR);
    }
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('Failed to create checkout session', 500, ERROR_CODES.INTERNAL_ERROR);
  }
}

export const POST = withErrorHandler(createPublicCheckoutSessionHandler);

async function getPublicCheckoutSessionHandler(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    throw new AppError('Session ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  try {
    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    return createResponse({
      session: {
        id: checkoutSession.id,
        payment_status: checkoutSession.payment_status,
        customer_email: checkoutSession.customer_email,
        subscription: checkoutSession.subscription,
        metadata: checkoutSession.metadata,
      },
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new AppError('Failed to retrieve checkout session', 500, ERROR_CODES.INTERNAL_ERROR);
  }
}

export const GET = withErrorHandler(getPublicCheckoutSessionHandler);