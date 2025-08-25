import { NextResponse } from 'next/server';
import { PLAN_CONFIGS, STRIPE_PRICES } from '@/lib/stripe/client';

export async function GET() {
  try {
    const { stripe } = await import('@/lib/stripe/client');
    
    // Filter out custom pricing and get valid price IDs
    const validPriceIds = Object.values(STRIPE_PRICES).filter(id => id !== 'custom');
    
    // Get price details from Stripe
    const prices = await Promise.all(
      validPriceIds.map(async (id) => {
        try {
          return await stripe.prices.retrieve(id);
        } catch (error) {
          console.error(`Failed to retrieve price ${id}:`, error);
          return null;
        }
      })
    ).then(prices => prices.filter(p => p !== null));

    // Format pricing data
    const pricingData = {
      PRO: {
        ...PLAN_CONFIGS.PRO,
        pricing: {
          monthly: {
            priceId: STRIPE_PRICES.PRO_MONTHLY,
            amount: prices.find(p => p.id === STRIPE_PRICES.PRO_MONTHLY)?.unit_amount || 0,
            currency: prices.find(p => p.id === STRIPE_PRICES.PRO_MONTHLY)?.currency || 'usd',
          },
          yearly: {
            priceId: STRIPE_PRICES.PRO_YEARLY,
            amount: prices.find(p => p.id === STRIPE_PRICES.PRO_YEARLY)?.unit_amount || 0,
            currency: prices.find(p => p.id === STRIPE_PRICES.PRO_YEARLY)?.currency || 'usd',
          },
        },
      },
      ENTERPRISE: {
        ...PLAN_CONFIGS.ENTERPRISE,
        pricing: {
          monthly: {
            priceId: STRIPE_PRICES.ENTERPRISE_MONTHLY,
            amount: prices.find(p => p.id === STRIPE_PRICES.ENTERPRISE_MONTHLY)?.unit_amount || 0,
            currency: prices.find(p => p.id === STRIPE_PRICES.ENTERPRISE_MONTHLY)?.currency || 'usd',
          },
          yearly: {
            priceId: STRIPE_PRICES.ENTERPRISE_YEARLY,
            amount: prices.find(p => p.id === STRIPE_PRICES.ENTERPRISE_YEARLY)?.unit_amount || 0,
            currency: prices.find(p => p.id === STRIPE_PRICES.ENTERPRISE_YEARLY)?.currency || 'usd',
          },
        },
      },
    };

    return NextResponse.json(pricingData);
  } catch (error) {
    console.error('Get prices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}