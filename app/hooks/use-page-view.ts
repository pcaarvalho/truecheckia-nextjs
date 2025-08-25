'use client'

/**
 * Page View Tracking Hook
 * Automatically tracks page views with proper routing
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/app/lib/analytics/gtag'
import { trackMixpanelPageView } from '@/app/lib/analytics/mixpanel'
import { trackClarityEvent } from '@/app/lib/analytics/clarity'
import { trackFacebookPageView } from '@/app/lib/analytics/facebook-pixel'
import { trackLinkedInPageView } from '@/app/lib/analytics/linkedin-insight'

interface PageViewOptions {
  trackGA4?: boolean
  trackMixpanel?: boolean
  trackClarity?: boolean
  trackFacebook?: boolean
  trackLinkedIn?: boolean
  customProperties?: Record<string, any>
}

export function usePageView(options: PageViewOptions = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    trackGA4 = true,
    trackMixpanel = true,
    trackClarity = true,
    trackFacebook = true,
    trackLinkedIn = true,
    customProperties = {},
  } = options

  useEffect(() => {
    if (typeof window === 'undefined') return

    const pageTitle = document.title
    const pageLocation = window.location.href
    const pagePath = pathname
    const searchQuery = searchParams.toString()

    // Determine page category and content group
    const getPageCategory = (path: string): string => {
      if (path.startsWith('/dashboard')) return 'dashboard'
      if (path.startsWith('/analysis')) return 'analysis'
      if (path.startsWith('/pricing')) return 'pricing'
      if (path.startsWith('/login') || path.startsWith('/register')) return 'auth'
      if (path === '/') return 'homepage'
      return 'general'
    }

    const getContentGroup = (path: string): string => {
      if (path.startsWith('/dashboard')) return 'authenticated'
      if (path.startsWith('/login') || path.startsWith('/register')) return 'auth_flow'
      return 'marketing'
    }

    const pageCategory = getPageCategory(pagePath)
    const contentGroup = getContentGroup(pagePath)

    // GA4 Page View
    if (trackGA4) {
      trackPageView({
        page_title: pageTitle,
        page_location: pageLocation,
        page_path: pagePath,
        content_group1: contentGroup,
        content_group2: pageCategory,
        custom_parameters: {
          search_params: searchQuery,
          ...customProperties,
        }
      })
    }

    // Mixpanel Page View
    if (trackMixpanel) {
      trackMixpanelPageView(pageTitle, {
        page_path: pagePath,
        page_url: pageLocation,
        page_category: pageCategory,
        content_group: contentGroup,
        search_params: searchQuery,
        ...customProperties,
      })
    }

    // Clarity Page View
    if (trackClarity) {
      trackClarityEvent({
        event: 'page_view',
        properties: {
          page_path: pagePath,
          page_title: pageTitle,
          page_category: pageCategory,
          ...customProperties,
        }
      })
    }

    // Facebook Page View
    if (trackFacebook) {
      trackFacebookPageView()
    }

    // LinkedIn Page View
    if (trackLinkedIn) {
      trackLinkedInPageView()
    }

  }, [
    pathname, 
    searchParams, 
    trackGA4, 
    trackMixpanel, 
    trackClarity, 
    trackFacebook, 
    trackLinkedIn, 
    customProperties
  ])
}

// Specific page tracking hooks
export function useHomePageView() {
  usePageView({
    customProperties: {
      page_type: 'landing',
      conversion_goal: 'signup',
    }
  })
}

export function usePricingPageView() {
  usePageView({
    customProperties: {
      page_type: 'pricing',
      conversion_goal: 'subscription',
    }
  })
}

export function useAnalysisPageView() {
  usePageView({
    customProperties: {
      page_type: 'tool',
      conversion_goal: 'analysis_completion',
    }
  })
}

export function useDashboardPageView() {
  usePageView({
    customProperties: {
      page_type: 'dashboard',
      user_segment: 'authenticated',
    }
  })
}

export function useAuthPageView(authType: 'login' | 'register' | 'forgot-password' | 'reset-password') {
  usePageView({
    customProperties: {
      page_type: 'auth',
      auth_type: authType,
      conversion_goal: authType === 'register' ? 'signup' : 'login',
    }
  })
}