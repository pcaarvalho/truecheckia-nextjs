import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Product IDs from Stripe Dashboard
export const STRIPE_PRODUCTS = {
  PRO: 'prod_StALX0bj5Ayx94',
  ENTERPRISE: 'prod_StAL9bj35CWblw',
} as const;

// Price IDs from Stripe Dashboard - Updated 2025-08-21
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_MONTHLY || 'price_1RyeYEPfgG67ZB4m6XR7GC81', // $12/month
  PRO_YEARLY: process.env.STRIPE_PRO_PRICE_YEARLY || 'price_1RyeYFPfgG67ZB4miaVlYOGJ',  // $120/year
  ENTERPRISE_MONTHLY: 'custom', // Contact for pricing
  ENTERPRISE_YEARLY: 'custom',  // Contact for pricing
} as const;

// Plan configurations with updated pricing
export const PLAN_CONFIGS = {
  PRO: {
    name: 'Pro',
    credits: 1000,
    pricing: {
      monthly: { amount: 1200, currency: 'usd' }, // $12.00 in cents
      yearly: { amount: 12000, currency: 'usd' },  // $120.00 in cents
    },
    features: [
      'Up to 1,000 analyses per month',
      'Advanced AI detection',
      'Priority support',
      'Full API access',
      'Bulk analysis',
      'PDF reports',
      'Multi-language support',
      'Unlimited history'
    ],
    prices: {
      monthly: STRIPE_PRICES.PRO_MONTHLY,
      yearly: STRIPE_PRICES.PRO_YEARLY,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    credits: 10000,
    pricing: {
      monthly: { amount: 0, currency: 'usd' }, // Custom pricing
      yearly: { amount: 0, currency: 'usd' },  // Custom pricing
    },
    features: [
      'Up to 10,000 analyses per month',
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Team accounts',
      'Advanced analytics',
      'Priority processing'
    ],
    prices: {
      monthly: STRIPE_PRICES.ENTERPRISE_MONTHLY,
      yearly: STRIPE_PRICES.ENTERPRISE_YEARLY,
    },
  },
} as const;

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  plan,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId?: string;
  userId: string;
  plan: 'PRO' | 'ENTERPRISE';
  successUrl: string;
  cancelUrl: string;
}) {
  console.log('Creating Stripe checkout session with params:', {
    priceId,
    customerId,
    userId,
    plan,
    successUrl,
    cancelUrl,
  });

  // Validate required parameters
  if (!priceId || priceId === 'custom') {
    throw new Error(`Invalid price ID: ${priceId}`);
  }
  
  if (!successUrl || !cancelUrl) {
    throw new Error('Success URL and Cancel URL are required');
  }

  try {
    // Validate the price exists in Stripe first
    console.log('Validating price ID with Stripe:', priceId);
    const price = await stripe.prices.retrieve(priceId);
    console.log('Price validated:', { id: price.id, active: price.active, type: price.type });
    
    if (!price.active) {
      throw new Error(`Price ${priceId} is not active in Stripe`);
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer: customerId || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: customerId ? {
        address: 'auto',
        name: 'auto',
      } : undefined,
    } as any;

    console.log('Creating session with params:', JSON.stringify(sessionParams, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Stripe checkout session created successfully:', {
      id: session.id,
      url: session.url,
      hasUrl: !!session.url,
      mode: session.mode,
      payment_status: session.payment_status,
      customer: session.customer,
    });

    if (!session.url) {
      throw new Error('Checkout session created but URL is missing');
    }

    return session;
  } catch (error) {
    console.error('Stripe checkout session creation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      priceId,
      customerId,
      userId,
      plan,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error && error.message.includes('No such price')) {
      throw new Error(`Invalid Stripe price ID: ${priceId}. Please check your Stripe dashboard.`);
    }
    
    throw error;
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer({
  email,
  userId,
}: {
  email: string;
  userId: string;
}) {
  // Try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get plan from price ID - Updated for new price IDs
 */
export function getPlanFromPriceId(priceId: string): 'PRO' | 'ENTERPRISE' | null {
  if (priceId === STRIPE_PRICES.PRO_MONTHLY || priceId === STRIPE_PRICES.PRO_YEARLY) {
    return 'PRO';
  }
  // Enterprise uses custom pricing, not standard price IDs
  if (priceId === STRIPE_PRICES.ENTERPRISE_MONTHLY || priceId === STRIPE_PRICES.ENTERPRISE_YEARLY) {
    return 'ENTERPRISE';
  }
  return null;
}

/**
 * Get credits for plan
 */
export function getCreditsForPlan(plan: 'PRO' | 'ENTERPRISE'): number {
  return PLAN_CONFIGS[plan].credits;
}