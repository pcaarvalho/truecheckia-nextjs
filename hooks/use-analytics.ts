'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import * as gtag from '@/lib/analytics/gtag'

// Enhanced analytics hook with Google Analytics integration
export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      
      gtag.trackPageView({
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return {
    // User identification
    identifyUser: (userId: string, properties?: gtag.GAUserProperties) => {
      gtag.setUserProperties({ user_id: userId, ...properties })
    },

    // Analysis tracking
    trackAnalysis: {
      started: (textLength: number) => {
        gtag.trackEvent({
          action: 'analysis_started',
          category: 'engagement',
          label: 'ai_detection',
          value: textLength,
        })
      },
      completed: (aiScore: number, textLength: number) => {
        gtag.trackEvent({
          action: 'analysis_completed',
          category: 'engagement',
          label: 'ai_detection',
          value: aiScore,
          custom_parameters: {
            text_length: textLength,
            ai_score: aiScore,
          }
        })
      },
      failed: (error: string) => {
        gtag.trackException(`Analysis failed: ${error}`, false)
      }
    },

    // Authentication tracking
    trackAuth: {
      signupStarted: (method: string = 'email') => {
        gtag.trackEvent({
          action: 'signup_started',
          category: 'engagement',
          label: method,
        })
      },
      signupCompleted: (method: string = 'email') => {
        gtag.trackSignUp(method)
      },
      loginCompleted: (method: string = 'email') => {
        gtag.trackLogin(method)
      }
    },

    // Subscription tracking
    trackSubscription: {
      viewed: (plan: string) => {
        gtag.trackViewItem({
          item_id: plan,
          item_name: `${plan} Plan`,
          item_category: 'subscription',
          price: plan === 'PRO' ? 12 : 0,
        })
      },
      started: () => {
        gtag.trackEvent({
          action: 'checkout_started',
          category: 'ecommerce',
        })
      },
      initiated: (params: { plan: string; price: number }) => {
        gtag.trackBeginCheckout({
          currency: 'USD',
          value: params.price,
          items: [{
            item_id: params.plan,
            item_name: `${params.plan} Plan`,
            item_category: 'subscription',
            price: params.price,
            quantity: 1,
          }]
        })
      },
      completed: (plan: string, price: number, transactionId?: string) => {
        gtag.trackPurchase({
          transaction_id: transactionId || `${Date.now()}`,
          currency: 'USD',
          value: price,
          items: [{
            item_id: plan,
            item_name: `${plan} Plan`,
            item_category: 'subscription',
            price: price,
            quantity: 1,
          }]
        })
      }
    },

    // Feature usage tracking
    trackFeature: (featureName: string, properties?: any) => {
      gtag.trackEvent({
        action: 'feature_used',
        category: 'engagement',
        label: featureName,
        custom_parameters: properties,
      })
    },

    // CTA tracking
    trackCTA: (text: string, location: string) => {
      gtag.trackEvent({
        action: 'cta_clicked',
        category: 'engagement',
        label: text,
        custom_parameters: { location },
      })
    },

    // Error tracking
    trackError: (description: string, fatal: boolean = false) => {
      gtag.trackException(description, fatal)
    },

    // Support tracking
    trackSupport: (action: string) => {
      gtag.trackEvent({
        action: 'support_action',
        category: 'engagement',
        label: action,
      })
    },

    // Credits tracking
    trackCredits: {
      lowWarning: (creditsRemaining: number) => {
        gtag.trackEvent({
          action: 'low_credits_warning',
          category: 'engagement',
          value: creditsRemaining,
        })
      },
      apiKeyGenerated: () => {
        gtag.trackEvent({
          action: 'api_key_generated',
          category: 'engagement',
        })
      }
    },

    // Custom event tracking
    trackCustomEvent: (eventName: string, properties?: any) => {
      gtag.trackEvent({
        action: eventName,
        category: 'custom',
        custom_parameters: properties,
      })
    }
  }
}

export default useAnalytics