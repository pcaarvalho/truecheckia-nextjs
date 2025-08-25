import { useQuery } from '@tanstack/react-query';

interface PricingData {
  PRO: {
    name: string;
    credits: number;
    features: string[];
    pricing: {
      monthly: {
        priceId: string;
        amount: number;
        currency: string;
      };
      yearly: {
        priceId: string;
        amount: number;
        currency: string;
      };
    };
  };
  ENTERPRISE: {
    name: string;
    credits: number;
    features: string[];
    pricing: {
      monthly: {
        priceId: string;
        amount: number;
        currency: string;
      };
      yearly: {
        priceId: string;
        amount: number;
        currency: string;
      };
    };
  };
}

export function usePricing() {
  const {
    data: pricing,
    isLoading,
    error,
  } = useQuery<PricingData>({
    queryKey: ['pricing'],
    queryFn: async () => {
      const response = await fetch('/api/stripe/prices');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    pricing,
    isLoading,
    error,
  };
}