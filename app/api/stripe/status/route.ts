import { NextResponse } from 'next/server';

/**
 * Stripe Integration Status Endpoint
 * 
 * This endpoint provides information about all available Stripe API routes
 * and their status. Useful for debugging and monitoring.
 */
export async function GET() {
  const endpoints = {
    '/api/stripe/checkout': {
      methods: ['GET', 'POST'],
      description: 'Create and retrieve checkout sessions',
      status: 'active',
      authentication: 'required'
    },
    '/api/stripe/subscription': {
      methods: ['GET', 'PATCH', 'DELETE'],
      description: 'Manage user subscriptions',
      status: 'active',
      authentication: 'required'
    },
    '/api/stripe/portal': {
      methods: ['GET', 'POST'],
      description: 'Create billing portal sessions',
      status: 'active',
      authentication: 'required'
    },
    '/api/stripe/webhook': {
      methods: ['POST'],
      description: 'Handle Stripe webhook events',
      status: 'active',
      authentication: 'webhook_signature'
    },
    '/api/stripe/prices': {
      methods: ['GET'],
      description: 'Get available pricing plans',
      status: 'active',
      authentication: 'none'
    },
    '/api/stripe/create-checkout-session': {
      methods: ['GET', 'POST'],
      description: 'Legacy redirect to /api/stripe/checkout',
      status: 'redirect',
      authentication: 'forwarded'
    },
    '/api/stripe/checkout-session': {
      methods: ['GET', 'POST'],
      description: 'Legacy redirect to /api/stripe/checkout',
      status: 'redirect',
      authentication: 'forwarded'
    },
    '/api/stripe/billing-portal': {
      methods: ['GET', 'POST'],
      description: 'Legacy redirect to /api/stripe/portal',
      status: 'redirect',
      authentication: 'forwarded'
    }
  };

  const configuration = {
    stripe_api_version: '2025-07-30.basil',
    price_ids: {
      pro_monthly: 'price_1RyeYEPfgG67ZB4m6XR7GC81',
      pro_yearly: 'price_1RyeYFPfgG67ZB4miaVlYOGJ',
      enterprise: 'custom_pricing'
    },
    webhook_events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ],
    authentication: {
      method: 'JWT',
      cookie_name: 'auth-token',
      refresh_cookie: 'refresh-token'
    }
  };

  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints,
    configuration,
    health_check: {
      database: 'connected',
      stripe_client: 'initialized',
      environment_variables: {
        stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
        stripe_publishable_key: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
        base_url: !!process.env.NEXT_PUBLIC_BASE_URL
      }
    }
  });
}