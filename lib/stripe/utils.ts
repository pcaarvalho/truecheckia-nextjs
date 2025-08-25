/**
 * Format amount from Stripe (in cents) to display format
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

/**
 * Calculate yearly savings percentage
 */
export function calculateYearlySavings(monthlyAmount: number, yearlyAmount: number): number {
  const yearlyEquivalent = monthlyAmount * 12;
  const savings = yearlyEquivalent - yearlyAmount;
  return Math.round((savings / yearlyEquivalent) * 100);
}

/**
 * Format subscription interval
 */
export function formatInterval(interval: string): string {
  switch (interval) {
    case 'month':
      return 'monthly';
    case 'year':
      return 'yearly';
    default:
      return interval;
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: string): string {
  switch (plan) {
    case 'FREE':
      return 'Free';
    case 'PRO':
      return 'Pro';
    case 'ENTERPRISE':
      return 'Enterprise';
    default:
      return plan;
  }
}

/**
 * Get subscription status display
 */
export function getSubscriptionStatusDisplay(status: string): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'green' };
    case 'trialing':
      return { label: 'Trial', color: 'yellow' };
    case 'past_due':
      return { label: 'Past Due', color: 'red' };
    case 'canceled':
      return { label: 'Canceled', color: 'gray' };
    case 'unpaid':
      return { label: 'Unpaid', color: 'red' };
    case 'incomplete':
      return { label: 'Incomplete', color: 'yellow' };
    case 'incomplete_expired':
      return { label: 'Expired', color: 'gray' };
    case 'paused':
      return { label: 'Paused', color: 'yellow' };
    default:
      return { label: status, color: 'gray' };
  }
}

/**
 * Check if subscription is active and not canceled
 */
export function isSubscriptionActive(
  status: string,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date
): boolean {
  const isStatusActive = ['active', 'trialing'].includes(status);
  const isNotExpired = new Date() < currentPeriodEnd;
  
  return isStatusActive && isNotExpired;
}

/**
 * Check if subscription will expire soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: Date
): boolean {
  if (!cancelAtPeriodEnd) return false;
  
  const daysUntilExpiry = Math.ceil(
    (currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiry(currentPeriodEnd: Date): number {
  return Math.ceil(
    (currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calculate prorated amount for plan changes
 */
export function calculateProratedAmount(
  currentPrice: number,
  newPrice: number,
  daysUsed: number,
  totalDaysInPeriod: number
): number {
  const unusedDays = totalDaysInPeriod - daysUsed;
  const refund = (currentPrice * unusedDays) / totalDaysInPeriod;
  const newCharge = (newPrice * unusedDays) / totalDaysInPeriod;
  
  return Math.round((newCharge - refund) * 100) / 100;
}

/**
 * Format subscription renewal date
 */
export function formatRenewalDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(plan: string): string[] {
  switch (plan) {
    case 'FREE':
      return [
        'Up to 10 analyses per month',
        'Basic AI detection',
        'Email support',
        'API access (limited)',
        '30-day history'
      ];
    case 'PRO':
      return [
        'Up to 1,000 analyses per month',
        'Advanced AI detection',
        'Priority support',
        'Full API access',
        'Bulk analysis',
        'PDF reports',
        'Multi-language support',
        'Unlimited history'
      ];
    case 'ENTERPRISE':
      return [
        'Up to 10,000 analyses per month',
        'Everything in Pro',
        'White-label solution',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Team accounts',
        'Advanced analytics',
        'Priority processing'
      ];
    default:
      return [];
  }
}

/**
 * Get credit limit for plan
 */
export function getCreditLimit(plan: string): number {
  switch (plan) {
    case 'FREE':
      return 10;
    case 'PRO':
      return 1000;
    case 'ENTERPRISE':
      return 10000;
    default:
      return 10;
  }
}

/**
 * Format credit usage percentage
 */
export function formatCreditUsage(used: number, total: number): {
  percentage: number;
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (total === -1) {
    return {
      percentage: 0,
      label: 'Unlimited',
      color: 'green'
    };
  }

  const percentage = Math.round((used / total) * 100);
  
  let color: 'green' | 'yellow' | 'red' = 'green';
  if (percentage >= 80) {
    color = 'red';
  } else if (percentage >= 60) {
    color = 'yellow';
  }

  return {
    percentage,
    label: `${used}/${total}`,
    color
  };
}

/**
 * Get plan pricing info - New function for updated pricing
 */
export function getPlanPricing(plan: string): {
  monthly: number;
  yearly: number;
  currency: string;
} {
  switch (plan) {
    case 'PRO':
      return {
        monthly: 1200, // $12.00 in cents
        yearly: 12000, // $120.00 in cents
        currency: 'usd'
      };
    case 'ENTERPRISE':
      return {
        monthly: 0, // Custom pricing
        yearly: 0,  // Custom pricing
        currency: 'usd'
      };
    default:
      return {
        monthly: 0,
        yearly: 0,
        currency: 'usd'
      };
  }
}

/**
 * Validate Stripe price ID format
 */
export function isValidStripeId(id: string, type: 'price' | 'prod' | 'cus' | 'sub'): boolean {
  const prefixes = {
    price: 'price_',
    prod: 'prod_',
    cus: 'cus_',
    sub: 'sub_'
  };
  
  return id.startsWith(prefixes[type]) && id.length > prefixes[type].length;
}

/**
 * Get upgrade path for current plan
 */
export function getUpgradePath(currentPlan: string): string | null {
  switch (currentPlan) {
    case 'FREE':
      return 'PRO';
    case 'PRO':
      return 'ENTERPRISE';
    case 'ENTERPRISE':
      return null; // Already highest tier
    default:
      return null;
  }
}

/**
 * Calculate savings for yearly billing - Updated for new pricing
 */
export function getYearlySavings(monthlyPrice: number): {
  yearlyPrice: number;
  monthlyEquivalent: number;
  savingsAmount: number;
  savingsPercentage: number;
} {
  // For PRO plan: $12/month vs $120/year = $24 savings
  let yearlyPrice: number;
  if (monthlyPrice === 12) {
    yearlyPrice = 120; // PRO plan specific pricing
  } else {
    yearlyPrice = monthlyPrice * 10; // 2 months free (20% discount) for other plans
  }
  
  const monthlyEquivalent = yearlyPrice / 12;
  const savingsAmount = monthlyPrice - monthlyEquivalent;
  const savingsPercentage = Math.round((savingsAmount / monthlyPrice) * 100);
  
  return {
    yearlyPrice,
    monthlyEquivalent,
    savingsAmount,
    savingsPercentage
  };
}