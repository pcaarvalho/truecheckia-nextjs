'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  plan: 'PRO' | 'ENTERPRISE';
  interval?: 'monthly' | 'yearly';
  email?: string;
  isAuthenticated?: boolean;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CheckoutButton({
  plan,
  interval = 'monthly',
  email,
  isAuthenticated = false,
  buttonText,
  variant = 'default',
  size = 'lg',
  className = ''
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If Enterprise plan, redirect to contact page
      if (plan === 'ENTERPRISE') {
        router.push('/contact');
        return;
      }

      // Determine which API endpoint to use
      const endpoint = isAuthenticated 
        ? '/api/stripe/checkout'
        : '/api/stripe/checkout-public';

      // Prepare request body
      const body = isAuthenticated
        ? { plan, interval }
        : { plan, interval, email: email || prompt('Please enter your email:') };

      // For public checkout, we need an email
      if (!isAuthenticated && !body.email) {
        setError('Email is required for checkout');
        setIsLoading(false);
        return;
      }

      // Create checkout session
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && localStorage.getItem('accessToken') 
            ? { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            : {})
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      // The API returns { success: true, data: { url, sessionId } }
      const checkoutUrl = data.data?.url || data.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  // Determine button text
  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (plan === 'ENTERPRISE') return 'Contact Sales';
    if (isLoading) return '';
    return isAuthenticated ? 'Upgrade to Pro' : 'Start Pro Trial';
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`w-full ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          getButtonText()
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </>
  );
}