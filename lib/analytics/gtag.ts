/**
 * Google Analytics 4 (GA4) Configuration and Utilities
 * Provides comprehensive tracking for TrueCheckIA
 */

export const GA_MEASUREMENT_ID = 'G-9QD8DCH6PV'

// GA4 Event Types
export interface GAEvent {
  action: string
  category?: string
  label?: string
  value?: number
  user_id?: string
  custom_parameters?: Record<string, any>
}

export interface GAUserProperties {
  user_id?: string
  subscription_plan?: 'FREE' | 'PRO' | 'ENTERPRISE'
  user_role?: 'USER' | 'ADMIN'
  signup_method?: 'email' | 'google'
  credits_remaining?: number
  analysis_count?: number
}

export interface GAPageView {
  page_title: string
  page_location: string
  page_path: string
  content_group1?: string
  content_group2?: string
  custom_parameters?: Record<string, any>
}

export interface GAEcommerceItem {
  item_id: string
  item_name: string
  item_category?: string
  item_brand?: string
  price?: number
  quantity?: number
  currency?: string
}

export interface GAEcommerceEvent {
  currency: string
  value: number
  transaction_id?: string
  items: GAEcommerceItem[]
}

// Initialize Google Analytics
export function initGA(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return

  // Initialize dataLayer and gtag if they don't exist
  if (!window.dataLayer) {
    window.dataLayer = []
  }
  
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
  }

  // Configure GA4
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    anonymize_ip: true,
    cookie_flags: 'secure;samesite=strict',
    cookie_expires: 63072000, // 2 years
    send_page_view: false, // We'll handle this manually
  })
}

// Track page views
export function trackPageView(pageView: GAPageView): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_title: pageView.page_title,
    page_location: pageView.page_location,
    page_path: pageView.page_path,
    content_group1: pageView.content_group1,
    content_group2: pageView.content_group2,
    ...pageView.custom_parameters,
  })
}

// Track custom events
export function trackEvent(event: GAEvent): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    user_id: event.user_id,
    ...event.custom_parameters,
  })
}

// Set user properties
export function setUserProperties(properties: GAUserProperties): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: properties.user_id,
    custom_map: {
      subscription_plan: 'subscription_plan',
      user_role: 'user_role',
      signup_method: 'signup_method',
      credits_remaining: 'credits_remaining',
      analysis_count: 'analysis_count',
    },
  })

  // Set individual user properties
  Object.entries(properties).forEach(([key, value]) => {
    if (value !== undefined && window.gtag) {
      window.gtag('set', { [key]: value })
    }
  })
}

// Track conversions
export function trackConversion(conversionName: string, value?: number, currency: string = 'USD'): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'conversion', {
    send_to: `${GA_MEASUREMENT_ID}/${conversionName}`,
    value: value,
    currency: currency,
  })
}

// Enhanced Ecommerce Events
export function trackPurchase(purchaseData: GAEcommerceEvent): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'purchase', {
    transaction_id: purchaseData.transaction_id,
    value: purchaseData.value,
    currency: purchaseData.currency,
    items: purchaseData.items,
  })
}

export function trackBeginCheckout(checkoutData: Omit<GAEcommerceEvent, 'transaction_id'>): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'begin_checkout', {
    currency: checkoutData.currency,
    value: checkoutData.value,
    items: checkoutData.items,
  })
}

export function trackAddToCart(item: GAEcommerceItem): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'add_to_cart', {
    currency: item.currency || 'USD',
    value: item.price || 0,
    items: [item],
  })
}

export function trackViewItem(item: GAEcommerceItem): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'view_item', {
    currency: item.currency || 'USD',
    value: item.price || 0,
    items: [item],
  })
}

// User engagement tracking
export function trackSignUp(method: string = 'email'): void {
  trackEvent({
    action: 'sign_up',
    category: 'engagement',
    label: method,
    custom_parameters: {
      method: method,
    },
  })
}

export function trackLogin(method: string = 'email'): void {
  trackEvent({
    action: 'login',
    category: 'engagement',
    label: method,
    custom_parameters: {
      method: method,
    },
  })
}

export function trackShare(contentType: string, itemId?: string): void {
  trackEvent({
    action: 'share',
    category: 'engagement',
    label: contentType,
    custom_parameters: {
      content_type: contentType,
      item_id: itemId,
    },
  })
}

export function trackSearch(searchTerm: string, searchType?: string): void {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    custom_parameters: {
      search_term: searchTerm,
      search_type: searchType,
    },
  })
}

// Exception tracking
export function trackException(description: string, fatal: boolean = false): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'exception', {
    description: description,
    fatal: fatal,
  })
}

// Timing tracking
export function trackTiming(name: string, value: number, category?: string, label?: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', 'timing_complete', {
    name: name,
    value: value,
    event_category: category,
    event_label: label,
  })
}

// Consent management
export function grantConsent(): void {
  if (typeof window === 'undefined') return

  // Initialize dataLayer and gtag if they don't exist
  if (!window.dataLayer) {
    window.dataLayer = []
  }
  
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
  }

  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  })
}

export function denyConsent(): void {
  if (typeof window === 'undefined') return

  // Initialize dataLayer and gtag if they don't exist
  if (!window.dataLayer) {
    window.dataLayer = []
  }
  
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
  }

  window.gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export function setDefaultConsent(granted: boolean = false): void {
  if (typeof window === 'undefined') return

  // Initialize dataLayer and gtag if they don't exist
  if (!window.dataLayer) {
    window.dataLayer = []
  }
  
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
  }

  const consentState = granted ? 'granted' : 'denied'

  window.gtag('consent', 'default', {
    analytics_storage: consentState,
    ad_storage: consentState,
    ad_user_data: consentState,
    ad_personalization: consentState,
    wait_for_update: 2000,
  })
}

// Global gtag declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}