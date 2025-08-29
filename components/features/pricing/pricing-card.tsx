'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { usePricing } from '@/hooks/use-pricing';
import { formatPrice, calculateYearlySavings } from '@/lib/stripe/utils';
import { useAnalytics } from '@/hooks/use-analytics';
import { usePricingPageView } from '@/hooks/use-page-view';

interface PricingData {
  PRO: {
    name: string;
    credits: number;
    features: string[];
    pricing: {
      monthly: { priceId: string; amount: number; currency: string; };
      yearly: { priceId: string; amount: number; currency: string; };
    };
  };
  ENTERPRISE: {
    name: string;
    credits: number;
    features: string[];
    pricing: {
      monthly: { priceId: string; amount: number; currency: string; };
      yearly: { priceId: string; amount: number; currency: string; };
    };
  };
}

export function PricingCard() {
  const [isYearly, setIsYearly] = useState(false);
  const { createCheckoutSession, isCreatingCheckout, subscription, isFreePlan } = useSubscription();
  const { pricing, isLoading } = usePricing();
  const analytics = useAnalytics();
  
  // Track pricing page view
  usePricingPageView();

  if (isLoading || !pricing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Type assertion for pricing data
  const pricingData = pricing as unknown as PricingData;

  const plans = [
    {
      key: 'free' as const,
      name: 'Free',
      description: 'Perfect for trying out our AI detection',
      price: 0,
      credits: 10,
      features: [
        'Up to 10 analyses per month',
        'Basic AI detection',
        'Email support',
        'API access',
      ],
      buttonText: 'Current Plan',
      disabled: isFreePlan,
    },
    {
      key: 'PRO' as const,
      name: pricingData.PRO.name,
      description: 'Great for regular content creators',
      price: isYearly ? pricingData.PRO.pricing.yearly.amount : pricingData.PRO.pricing.monthly.amount,
      credits: pricingData.PRO.credits,
      features: pricingData.PRO.features,
      buttonText: subscription?.plan === 'PRO' ? 'Current Plan' : 'Upgrade to Pro',
      disabled: subscription?.plan === 'PRO',
      popular: true,
    },
    {
      key: 'ENTERPRISE' as const,
      name: pricingData.ENTERPRISE.name,
      description: 'For teams and businesses',
      price: isYearly ? pricingData.ENTERPRISE.pricing.yearly.amount : pricingData.ENTERPRISE.pricing.monthly.amount,
      credits: pricingData.ENTERPRISE.credits,
      features: pricingData.ENTERPRISE.features,
      buttonText: subscription?.plan === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade to Enterprise',
      disabled: subscription?.plan === 'ENTERPRISE',
    },
  ];

  const handleUpgrade = (planKey: 'PRO' | 'ENTERPRISE') => {
    const billingCycle = isYearly ? 'yearly' : 'monthly'
    const planData = pricingData[planKey]
    const price = isYearly ? planData.pricing.yearly.amount : planData.pricing.monthly.amount
    
    // Track subscription initiated
    analytics.trackSubscription.initiated({
      plan: planKey,
      billing_cycle: billingCycle,
      price: price,
      currency: 'USD',
      previous_plan: subscription?.plan || 'FREE'
    })
    
    console.log('PricingCard: Creating checkout session for:', {
      plan: planKey,
      interval: billingCycle,
    });
    createCheckoutSession({
      plan: planKey,
      interval: billingCycle,
    });
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={(checked) => {
            setIsYearly(checked)
            // Track billing cycle change
            analytics.trackCustomEvent('billing_cycle_changed', {
              billing_cycle: checked ? 'yearly' : 'monthly',
              page: 'pricing'
            })
          }}
        />
        <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        {isYearly && (
          <Badge variant="secondary" className="ml-2">
            Save up to {calculateYearlySavings(
              pricingData.PRO.pricing.monthly.amount,
              pricingData.PRO.pricing.yearly.amount
            )}%
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle 
                className="text-xl cursor-pointer" 
                onClick={() => {
                  // Track plan viewed
                  analytics.trackSubscription.viewed(plan.key)
                }}
              >
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {plan.key === 'free' ? 'Free' : formatPrice(plan.price)}
                </span>
                {plan.key !== 'free' && (
                  <span className="text-muted-foreground">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {plan.credits.toLocaleString()} analyses per month
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled || isCreatingCheckout}
                onClick={() => {
                  if (plan.key !== 'free') {
                    handleUpgrade(plan.key);
                  }
                }}
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}