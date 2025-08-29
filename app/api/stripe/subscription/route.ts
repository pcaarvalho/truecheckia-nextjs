import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getSubscription, 
  cancelSubscription, 
  reactivateSubscription,
  createBillingPortalSession 
} from '@/lib/stripe/client';
import { withErrorHandler, authenticateRequest, createResponse, AppError, ERROR_CODES, validateRequest } from '@/lib/middleware';
import { z } from 'zod';

const subscriptionActionSchema = z.object({
  action: z.enum(['cancel', 'reactivate', 'billing_portal']),
});

// GET - Get current user subscription
async function getSubscriptionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // If user has no Stripe subscription, return basic info
  if (!user.stripeSubscriptionId) {
    return createResponse({
      plan: user.plan,
      credits: user.credits,
      creditsResetAt: user.creditsResetAt,
      hasActiveSubscription: false,
    });
  }

  // Get subscription details from Stripe
  const stripeSubscription = await getSubscription(user.stripeSubscriptionId);
  
  return createResponse({
    plan: user.plan,
    credits: user.credits,
    creditsResetAt: user.creditsResetAt,
    hasActiveSubscription: true,
    subscription: {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      priceId: stripeSubscription.items.data[0]?.price.id,
      interval: stripeSubscription.items.data[0]?.price.recurring?.interval,
      amount: stripeSubscription.items.data[0]?.price.unit_amount,
      currency: stripeSubscription.items.data[0]?.price.currency,
    },
  });
}

// PATCH - Update subscription (cancel/reactivate)
async function updateSubscriptionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);

  const { action } = await validateRequest(request, subscriptionActionSchema);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!user.stripeSubscriptionId) {
    throw new AppError('No active subscription found', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  let stripeSubscription;

  switch (action) {
    case 'cancel':
      stripeSubscription = await cancelSubscription(user.stripeSubscriptionId);
      
      // Update user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCancelAtPeriodEnd: true,
        },
      });

      return createResponse({
        message: 'Subscription will be canceled at the end of the current period',
        subscription: {
          cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        },
      });

    case 'reactivate':
      stripeSubscription = await reactivateSubscription(user.stripeSubscriptionId);
      
      // Update user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCancelAtPeriodEnd: false,
        },
      });

      return createResponse({
        message: 'Subscription has been reactivated',
        subscription: {
          cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        },
      });

    case 'billing_portal':
      if (!user.stripeCustomerId) {
        throw new AppError('No customer ID found', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const portalSession = await createBillingPortalSession({
        customerId: user.stripeCustomerId,
        returnUrl: `${baseUrl}/dashboard`,
      });

      return createResponse({
        url: portalSession.url,
      });

    default:
      throw new AppError('Invalid action', 400, ERROR_CODES.VALIDATION_ERROR);
  }
}

// DELETE - Cancel subscription immediately
async function deleteSubscriptionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!user.stripeSubscriptionId) {
    throw new AppError('No active subscription found', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Cancel subscription immediately
  const { stripe } = await import('@/lib/stripe/client');
  await stripe.subscriptions.cancel(user.stripeSubscriptionId);

  // Update user to free plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
      credits: 10, // Free plan credits
      creditsResetAt: new Date(),
    },
  });

  // Update subscription record
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: user.stripeSubscriptionId },
    data: {
      status: 'canceled',
    },
  });

  return createResponse({
    message: 'Subscription has been canceled immediately',
  });
}

export const GET = withErrorHandler(getSubscriptionHandler);
export const PATCH = withErrorHandler(updateSubscriptionHandler);
export const DELETE = withErrorHandler(deleteSubscriptionHandler);