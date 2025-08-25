import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession, createOrRetrieveCustomer, STRIPE_PRICES } from '@/lib/stripe/client';
import { withErrorHandler, authenticateRequest, createResponse, createErrorResponse, AppError, ERROR_CODES } from '../../../lib/middleware';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

async function createCheckoutSessionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const body = await request.json();
  const { plan, interval } = checkoutSchema.parse(body);

  // Check if Enterprise plan - redirect to contact sales
  if (plan === 'ENTERPRISE') {
    throw new AppError('Enterprise plan requires custom pricing. Please contact sales.', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Check if user already has an active subscription
  if (user.stripeSubscriptionId) {
    throw new AppError('User already has an active subscription', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Get price ID based on plan and interval (only PRO is supported via checkout)
  let priceId: string;
  if (plan === 'PRO') {
    priceId = interval === 'monthly' ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.PRO_YEARLY;
  } else {
    throw new AppError('Invalid plan for checkout', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Create or retrieve Stripe customer
  let customer;
  if (user.stripeCustomerId) {
    customer = { id: user.stripeCustomerId };
  } else {
    customer = await createOrRetrieveCustomer({
      email: user.email,
      userId: user.id,
    });

    // Update user with customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  // Create checkout session
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  console.log('Creating checkout session with:', {
    priceId,
    customerId: customer.id,
    userId: user.id,
    plan,
    baseUrl
  });

  const checkoutSession = await createCheckoutSession({
    priceId,
    customerId: customer.id,
    userId: user.id,
    plan,
    successUrl: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/dashboard?checkout=cancelled`,
  });

  console.log('Checkout session created:', {
    id: checkoutSession.id,
    url: checkoutSession.url,
    hasUrl: !!checkoutSession.url
  });

  return createResponse({
    sessionId: checkoutSession.id,
    url: checkoutSession.url || null,
  });
}

export const POST = withErrorHandler(createCheckoutSessionHandler);

async function getCheckoutSessionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  await authenticateRequest(request);

  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    throw new AppError('Session ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Retrieve checkout session from Stripe
  const { stripe } = await import('@/lib/stripe/client');
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  return createResponse({
    session: {
      id: checkoutSession.id,
      payment_status: checkoutSession.payment_status,
      customer_email: checkoutSession.customer_email,
      subscription: checkoutSession.subscription,
    },
  });
}

export const GET = withErrorHandler(getCheckoutSessionHandler);