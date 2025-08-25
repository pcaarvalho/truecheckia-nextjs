/**
 * Analytics Events Configuration
 * Defines all tracking events for TrueCheckIA
 */

import { trackEvent, trackConversion, trackPurchase, GAEcommerceItem, GAEcommerceEvent } from './gtag'

// Event Categories
export const EVENT_CATEGORIES = {
  USER_ENGAGEMENT: 'user_engagement',
  ANALYSIS: 'analysis',
  SUBSCRIPTION: 'subscription',
  AUTH: 'authentication',
  NAVIGATION: 'navigation',
  API: 'api_usage',
  ERROR: 'error',
  PERFORMANCE: 'performance',
} as const

// Event Names
export const EVENT_NAMES = {
  // Analysis Events
  ANALYSIS_STARTED: 'analysis_started',
  ANALYSIS_COMPLETED: 'analysis_completed',
  ANALYSIS_FAILED: 'analysis_failed',
  ANALYSIS_SHARED: 'analysis_shared',
  BULK_ANALYSIS_STARTED: 'bulk_analysis_started',
  
  // Authentication Events
  SIGNUP_INITIATED: 'signup_initiated',
  SIGNUP_COMPLETED: 'signup_completed',
  SIGNUP_FAILED: 'signup_failed',
  LOGIN_INITIATED: 'login_initiated',
  LOGIN_COMPLETED: 'login_completed',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  GOOGLE_OAUTH_INITIATED: 'google_oauth_initiated',
  GOOGLE_OAUTH_COMPLETED: 'google_oauth_completed',
  
  // Subscription Events
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_VIEWED: 'subscription_viewed',
  SUBSCRIPTION_INITIATED: 'subscription_initiated',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  UPGRADE_INITIATED: 'upgrade_initiated',
  UPGRADE_COMPLETED: 'upgrade_completed',
  DOWNGRADE_INITIATED: 'downgrade_initiated',
  DOWNGRADE_COMPLETED: 'downgrade_completed',
  
  // Credits and Usage
  CREDITS_PURCHASED: 'credits_purchased',
  CREDITS_LOW_WARNING: 'credits_low_warning',
  CREDITS_EXHAUSTED: 'credits_exhausted',
  API_KEY_GENERATED: 'api_key_generated',
  API_KEY_REGENERATED: 'api_key_regenerated',
  
  // Navigation Events
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
  CTA_CLICKED: 'cta_clicked',
  FEATURE_EXPLORED: 'feature_explored',
  
  // User Engagement
  HELP_ACCESSED: 'help_accessed',
  SUPPORT_CONTACTED: 'support_contacted',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  
  // Errors
  API_ERROR: 'api_error',
  PAYMENT_ERROR: 'payment_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
} as const

// Event Parameter Types
export interface AnalysisEventParams {
  text_length: number
  detection_confidence?: number
  ai_probability?: number
  processing_time?: number
  credits_used?: number
  analysis_type?: 'text' | 'bulk' | 'api'
  user_plan?: 'FREE' | 'PRO' | 'ENTERPRISE'
}

export interface AuthEventParams {
  method: 'email' | 'google'
  user_id?: string
  signup_source?: string
  referrer?: string
}

export interface SubscriptionEventParams {
  plan: 'PRO' | 'ENTERPRISE'
  billing_cycle: 'monthly' | 'yearly'
  price: number
  currency: string
  discount_applied?: boolean
  discount_code?: string
  previous_plan?: 'FREE' | 'PRO' | 'ENTERPRISE'
}

export interface NavigationEventParams {
  page_path: string
  section_name?: string
  cta_location?: string
  feature_name?: string
}

export interface ErrorEventParams {
  error_type: string
  error_message: string
  error_stack?: string
  user_agent?: string
  page_path: string
}

// TrueCheckIA Specific Event Tracking Functions

// Analysis Events
export function trackAnalysisStarted(params: AnalysisEventParams): void {
  trackEvent({
    action: EVENT_NAMES.ANALYSIS_STARTED,
    category: EVENT_CATEGORIES.ANALYSIS,
    custom_parameters: {
      text_length: params.text_length,
      analysis_type: params.analysis_type,
      user_plan: params.user_plan,
    }
  })
}

export function trackAnalysisCompleted(params: AnalysisEventParams): void {
  trackEvent({
    action: EVENT_NAMES.ANALYSIS_COMPLETED,
    category: EVENT_CATEGORIES.ANALYSIS,
    value: params.credits_used,
    custom_parameters: {
      text_length: params.text_length,
      detection_confidence: params.detection_confidence,
      ai_probability: params.ai_probability,
      processing_time: params.processing_time,
      credits_used: params.credits_used,
      analysis_type: params.analysis_type,
      user_plan: params.user_plan,
    }
  })
  
  // Track as conversion
  trackConversion('analysis_completed', params.credits_used)
}

export function trackAnalysisFailed(params: Partial<AnalysisEventParams> & { error_reason: string }): void {
  trackEvent({
    action: EVENT_NAMES.ANALYSIS_FAILED,
    category: EVENT_CATEGORIES.ERROR,
    custom_parameters: {
      text_length: params.text_length,
      analysis_type: params.analysis_type,
      user_plan: params.user_plan,
      error_reason: params.error_reason,
    }
  })
}

// Authentication Events
export function trackSignupInitiated(params: AuthEventParams): void {
  trackEvent({
    action: EVENT_NAMES.SIGNUP_INITIATED,
    category: EVENT_CATEGORIES.AUTH,
    custom_parameters: {
      method: params.method,
      signup_source: params.signup_source,
      referrer: params.referrer,
    }
  })
}

export function trackSignupCompleted(params: AuthEventParams): void {
  trackEvent({
    action: EVENT_NAMES.SIGNUP_COMPLETED,
    category: EVENT_CATEGORIES.AUTH,
    custom_parameters: {
      method: params.method,
      user_id: params.user_id,
      signup_source: params.signup_source,
    }
  })
  
  // Track as conversion
  trackConversion('signup_completed')
}

export function trackLoginCompleted(params: AuthEventParams): void {
  trackEvent({
    action: EVENT_NAMES.LOGIN_COMPLETED,
    category: EVENT_CATEGORIES.AUTH,
    custom_parameters: {
      method: params.method,
      user_id: params.user_id,
    }
  })
}

export function trackGoogleOAuthInitiated(): void {
  trackEvent({
    action: EVENT_NAMES.GOOGLE_OAUTH_INITIATED,
    category: EVENT_CATEGORIES.AUTH,
    custom_parameters: {
      method: 'google',
    }
  })
}

// Subscription Events
export function trackSubscriptionViewed(plan: string): void {
  trackEvent({
    action: EVENT_NAMES.SUBSCRIPTION_VIEWED,
    category: EVENT_CATEGORIES.SUBSCRIPTION,
    label: plan,
    custom_parameters: {
      plan: plan,
    }
  })
}

export function trackSubscriptionInitiated(params: SubscriptionEventParams): void {
  trackEvent({
    action: EVENT_NAMES.SUBSCRIPTION_INITIATED,
    category: EVENT_CATEGORIES.SUBSCRIPTION,
    value: params.price,
    custom_parameters: {
      plan: params.plan,
      billing_cycle: params.billing_cycle,
      price: params.price,
      currency: params.currency,
    }
  })
  
  // Track begin checkout
  const item: GAEcommerceItem = {
    item_id: `plan_${params.plan.toLowerCase()}_${params.billing_cycle}`,
    item_name: `${params.plan} Plan - ${params.billing_cycle}`,
    item_category: 'subscription',
    item_brand: 'TrueCheckIA',
    price: params.price,
    quantity: 1,
    currency: params.currency,
  }
  
  trackEvent({
    action: 'begin_checkout',
    category: EVENT_CATEGORIES.SUBSCRIPTION,
    custom_parameters: {
      currency: params.currency,
      value: params.price,
      items: [item],
    }
  })
}

export function trackSubscriptionCompleted(params: SubscriptionEventParams & { transaction_id: string }): void {
  trackEvent({
    action: EVENT_NAMES.SUBSCRIPTION_COMPLETED,
    category: EVENT_CATEGORIES.SUBSCRIPTION,
    value: params.price,
    custom_parameters: {
      plan: params.plan,
      billing_cycle: params.billing_cycle,
      price: params.price,
      currency: params.currency,
      transaction_id: params.transaction_id,
      discount_applied: params.discount_applied,
      discount_code: params.discount_code,
    }
  })
  
  // Track purchase
  const purchaseData: GAEcommerceEvent = {
    transaction_id: params.transaction_id,
    value: params.price,
    currency: params.currency,
    items: [{
      item_id: `plan_${params.plan.toLowerCase()}_${params.billing_cycle}`,
      item_name: `${params.plan} Plan - ${params.billing_cycle}`,
      item_category: 'subscription',
      item_brand: 'TrueCheckIA',
      price: params.price,
      quantity: 1,
      currency: params.currency,
    }],
  }
  
  trackPurchase(purchaseData)
  
  // Track as conversion
  trackConversion('subscription_completed', params.price)
}

// Credits Events
export function trackCreditsLowWarning(remainingCredits: number): void {
  trackEvent({
    action: EVENT_NAMES.CREDITS_LOW_WARNING,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    value: remainingCredits,
    custom_parameters: {
      remaining_credits: remainingCredits,
    }
  })
}

export function trackCreditsExhausted(): void {
  trackEvent({
    action: EVENT_NAMES.CREDITS_EXHAUSTED,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    custom_parameters: {
      remaining_credits: 0,
    }
  })
}

export function trackAPIKeyGenerated(userId?: string): void {
  trackEvent({
    action: EVENT_NAMES.API_KEY_GENERATED,
    category: EVENT_CATEGORIES.API,
    custom_parameters: {
      user_id: userId,
    }
  })
}

// Navigation Events
export function trackCTAClicked(ctaText: string, location: string): void {
  trackEvent({
    action: EVENT_NAMES.CTA_CLICKED,
    category: EVENT_CATEGORIES.NAVIGATION,
    label: ctaText,
    custom_parameters: {
      cta_text: ctaText,
      cta_location: location,
    }
  })
}

export function trackFeatureExplored(featureName: string): void {
  trackEvent({
    action: EVENT_NAMES.FEATURE_EXPLORED,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    label: featureName,
    custom_parameters: {
      feature_name: featureName,
    }
  })
}

// Error Events
export function trackAPIError(params: ErrorEventParams): void {
  trackEvent({
    action: EVENT_NAMES.API_ERROR,
    category: EVENT_CATEGORIES.ERROR,
    custom_parameters: {
      error_type: params.error_type,
      error_message: params.error_message,
      page_path: params.page_path,
    }
  })
}

export function trackPaymentError(params: ErrorEventParams): void {
  trackEvent({
    action: EVENT_NAMES.PAYMENT_ERROR,
    category: EVENT_CATEGORIES.ERROR,
    custom_parameters: {
      error_type: params.error_type,
      error_message: params.error_message,
      page_path: params.page_path,
    }
  })
}

// User Engagement Events
export function trackHelpAccessed(section: string): void {
  trackEvent({
    action: EVENT_NAMES.HELP_ACCESSED,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    label: section,
    custom_parameters: {
      help_section: section,
    }
  })
}

export function trackSupportContacted(method: 'email' | 'chat' | 'form'): void {
  trackEvent({
    action: EVENT_NAMES.SUPPORT_CONTACTED,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    label: method,
    custom_parameters: {
      contact_method: method,
    }
  })
}

export function trackFeedbackSubmitted(rating?: number): void {
  trackEvent({
    action: EVENT_NAMES.FEEDBACK_SUBMITTED,
    category: EVENT_CATEGORIES.USER_ENGAGEMENT,
    value: rating,
    custom_parameters: {
      rating: rating,
    }
  })
}

// Analytics wrapper object for compatibility with conversion components
export const analytics = {
  track: (eventName: string, params?: Record<string, any>) => {
    trackEvent({
      action: eventName,
      category: EVENT_CATEGORIES.USER_ENGAGEMENT,
      custom_parameters: params
    })
  },
  trackPageView: (pagePath: string) => {
    trackEvent({
      action: EVENT_NAMES.PAGE_VIEW,
      category: EVENT_CATEGORIES.NAVIGATION,
      label: pagePath,
      custom_parameters: { page_path: pagePath }
    })
  },
  trackCTAClicked: (location: string, variant: string) => {
    trackEvent({
      action: EVENT_NAMES.CTA_CLICKED,
      category: EVENT_CATEGORIES.USER_ENGAGEMENT,
      label: location,
      custom_parameters: { cta_location: location, variant }
    })
  },
  trackConversion: (conversionType: string, value?: number) => {
    trackConversion(conversionType, value)
  },
  trackPurchase: (params: GAEcommerceEvent) => {
    trackPurchase(params)
  }
}