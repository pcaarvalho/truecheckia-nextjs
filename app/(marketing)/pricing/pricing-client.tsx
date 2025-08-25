'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { useSubscription } from '@/hooks/use-subscription'
import { PricingCard } from '@/components/features/pricing/pricing-card'
import MarketingNav from '@/app/components/navigation/marketing-nav'

function PricingContent() {
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { createCheckoutSession, isCreatingCheckout } = useSubscription()
  
  const planParam = searchParams.get('plan')
  const intervalParam = searchParams.get('interval')
  
  // Normalize plan to uppercase for API compatibility
  const plan = planParam?.toUpperCase() as 'PRO' | 'ENTERPRISE' | null
  const interval = intervalParam as 'monthly' | 'annual' | null

  useEffect(() => {
    // Auto-trigger checkout if user is authenticated and parameters are present
    if (isAuthenticated && plan && interval && plan !== 'ENTERPRISE' && !isCreatingCheckout) {
      const billingInterval = interval === 'annual' ? 'yearly' : 'monthly'
      console.log('PricingPage: Auto-triggering checkout for:', {
        plan,
        interval: billingInterval,
      })
      createCheckoutSession({ plan, interval: billingInterval })
    }
  }, [isAuthenticated, plan, interval, isCreatingCheckout, createCheckoutSession])

  if (isCreatingCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Redirecting to checkout...</h2>
          <p className="text-muted-foreground">Please wait while we process your request.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <MarketingNav />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI content detection with our flexible pricing options
          </p>
        </div>
        
        <PricingCard />
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">TrueCheck-AI</span>
              </div>
              <p className="text-gray-400">
                Advanced AI content detection platform for businesses and educators.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TrueCheckIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PricingPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}