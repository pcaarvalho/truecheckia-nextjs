import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBillingPortalSession } from '@/lib/stripe/client';
import { withErrorHandler, authenticateRequest, createResponse, createErrorResponse, AppError, ERROR_CODES } from '@/lib/middleware';

/**
 * Stripe Billing Portal API Endpoint
 * 
 * Allows users to manage their subscription, payment methods, and billing history
 * through Stripe's hosted billing portal.
 * 
 * Features:
 * - Update payment methods
 * - View billing history and invoices
 * - Update billing address
 * - Cancel or reactivate subscription
 * - Download invoices
 * 
 * Security: Requires authentication and validates user has Stripe customer ID
 */

async function createPortalSessionHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      plan: true,
      stripeSubscriptionId: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!user.stripeCustomerId) {
    throw new AppError(
      'No billing account found. Please subscribe to a plan first.', 
      400, 
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Get return URL from request or use default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const returnUrl = `${baseUrl}/dashboard/billing`;

  try {
    // Create billing portal session
    const portalSession = await createBillingPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    });

    console.log(`Billing portal session created for user ${userId}: ${portalSession.id}`);

    return createResponse({
      url: portalSession.url,
      sessionId: portalSession.id,
    });

  } catch (error) {
    console.error('Failed to create billing portal session:', error);
    
    throw new AppError(
      `Failed to create billing portal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      ERROR_CODES.INTERNAL_ERROR
    );
  }
}

export const POST = withErrorHandler(createPortalSessionHandler);

/**
 * Get billing information for the current user
 * Returns subscription details, billing history, and portal access status
 */
async function getBillingInfoHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCancelAtPeriodEnd: true,
      credits: true,
      creditsResetAt: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  // Get subscription details if user has one
  let subscriptionDetails = null;
  if (user.stripeSubscriptionId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: user.stripeSubscriptionId },
        select: {
          status: true,
          stripePriceId: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          createdAt: true
        }
      });

      subscriptionDetails = subscription;
    } catch (error) {
      console.warn('Failed to fetch subscription details:', error);
      // Don't throw - just return null subscription details
    }
  }

  // Calculate billing information
  const billingInfo = {
    user: {
      email: user.email,
      plan: user.plan,
      credits: user.credits,
      creditsResetAt: user.creditsResetAt,
      memberSince: user.createdAt
    },
    subscription: subscriptionDetails,
    billing: {
      hasStripeCustomer: !!user.stripeCustomerId,
      hasActiveSubscription: !!user.stripeSubscriptionId,
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
      willCancelAtPeriodEnd: user.stripeCancelAtPeriodEnd,
      canAccessPortal: !!user.stripeCustomerId
    }
  };

  return createResponse(billingInfo);
}

export const GET = withErrorHandler(getBillingInfoHandler);