import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SubscriptionData {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  credits: number;
  creditsResetAt: string;
  hasActiveSubscription: boolean;
  subscription?: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    priceId: string;
    interval: string;
    amount: number;
    currency: string;
  };
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  data?: {
    url: string;
    sessionId: string;
  };
}

export function useSubscription() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get subscription data
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/subscription', {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
  });

  // Create checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async ({ 
      plan, 
      interval 
    }: { 
      plan: 'PRO' | 'ENTERPRISE'; 
      interval: 'monthly' | 'yearly' 
    }): Promise<CheckoutSessionResponse> => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ plan, interval }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Checkout session creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error,
        });
        throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to create checkout session`);
      }

      const jsonResponse = await response.json();
      console.log('Checkout API response:', jsonResponse);
      
      // Handle different response formats
      if (jsonResponse.success === false) {
        throw new Error(jsonResponse.error || 'Failed to create checkout session');
      }
      
      // The API returns { success: true, data: { url, sessionId } }
      return jsonResponse.data || jsonResponse;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      console.log('Checkout session created:', data);
      
      // Handle both direct data and wrapped response formats
      const url = data.url || data.data?.url;
      
      if (url) {
        console.log('Redirecting to Stripe checkout:', url);
        window.location.href = url;
      } else {
        console.error('No URL returned from checkout session', data);
        toast.error('Failed to redirect to checkout. The session was created but no payment URL was provided.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription will be canceled at the end of the current period');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reactivate subscription
  const reactivateSubscription = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reactivate subscription');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription has been reactivated');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Open billing portal
  const openBillingPortal = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ action: 'billing_portal' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to open billing portal');
      }

      const jsonResponse = await response.json();
      // The API returns { success: true, data: { url } }
      const data = jsonResponse.data || jsonResponse;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No URL returned from billing portal');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete subscription immediately
  const deleteSubscription = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subscription');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription has been canceled immediately');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    // Data
    subscription,
    isLoadingSubscription,
    subscriptionError,

    // Actions
    createCheckoutSession: createCheckoutSession.mutate,
    isCreatingCheckout: createCheckoutSession.isPending,

    cancelSubscription: cancelSubscription.mutate,
    isCancelingSubscription: cancelSubscription.isPending,

    reactivateSubscription: reactivateSubscription.mutate,
    isReactivatingSubscription: reactivateSubscription.isPending,

    deleteSubscription: deleteSubscription.mutate,
    isDeletingSubscription: deleteSubscription.isPending,

    openBillingPortal,
    isLoading,

    // Computed values
    isFreePlan: subscription?.plan === 'FREE',
    isProPlan: subscription?.plan === 'PRO',
    isEnterprisePlan: subscription?.plan === 'ENTERPRISE',
    hasActiveSubscription: subscription?.hasActiveSubscription || false,
    canUpgrade: subscription?.plan === 'FREE' || subscription?.plan === 'PRO',
  };
}