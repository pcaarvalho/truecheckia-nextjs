'use client'

/**
 * Conversion Tracking Hook
 * Tracks key conversion events across all platforms
 */

import { useCallback } from 'react'
import { trackConversion as trackGAConversion } from '@/lib/analytics/gtag'
import { trackFacebookConversionAPI } from '@/lib/analytics/facebook-pixel'
import { trackLinkedInConversion } from '@/lib/analytics/linkedin-insight'
import { trackMixpanelRevenue, trackMixpanelEvent } from '@/lib/analytics/mixpanel'

interface ConversionEventData {
  conversionName: string
  value?: number
  currency?: string
  transactionId?: string
  userId?: string
  userEmail?: string
  customProperties?: Record<string, any>
}

interface SubscriptionConversionData extends ConversionEventData {
  plan: 'PRO' | 'ENTERPRISE'
  billingCycle: 'monthly' | 'yearly'
  previousPlan?: 'FREE' | 'PRO' | 'ENTERPRISE'
  discountCode?: string
  discountAmount?: number
}

interface AnalysisConversionData extends ConversionEventData {
  textLength: number
  confidence: number
  processingTime: number
  analysisType: 'text' | 'bulk' | 'api'
}

export function useConversion() {
  // Generic conversion tracking
  const trackConversion = useCallback((data: ConversionEventData) => {
    const { conversionName, value, currency = 'USD', transactionId, customProperties } = data

    // GA4 Conversion
    trackGAConversion(conversionName, value, currency)

    // Facebook Conversion
    trackFacebookConversionAPI({
      event: conversionName,
      parameters: {
        value,
        currency,
        content_ids: transactionId ? [transactionId] : undefined,
        ...customProperties,
      }
    })

    // LinkedIn Conversion
    trackLinkedInConversion({
      conversion_id: conversionName,
      value,
      currency,
      event_id: transactionId,
    })

    // Mixpanel Event
    trackMixpanelEvent({
      event_name: `Conversion - ${conversionName}`,
      properties: {
        conversion_name: conversionName,
        value,
        currency,
        transaction_id: transactionId,
        ...customProperties,
      }
    })

    // Track revenue in Mixpanel if value provided
    if (value && value > 0) {
      trackMixpanelRevenue(value, {
        conversion_name: conversionName,
        transaction_id: transactionId,
        ...customProperties,
      })
    }
  }, [])

  // Specific conversion tracking functions

  // User signup conversion
  const trackSignupConversion = useCallback((userData: {
    userId: string
    email: string
    signupMethod: 'email' | 'google'
    source?: string
    referrer?: string
  }) => {
    trackConversion({
      conversionName: 'signup_completed',
      value: 0, // Free signup
      userId: userData.userId,
      userEmail: userData.email,
      customProperties: {
        signup_method: userData.signupMethod,
        signup_source: userData.source,
        referrer: userData.referrer,
      }
    })
  }, [trackConversion])

  // Subscription conversion
  const trackSubscriptionConversion = useCallback((data: SubscriptionConversionData) => {
    trackConversion({
      conversionName: 'subscription_completed',
      value: data.value,
      currency: data.currency,
      transactionId: data.transactionId,
      userId: data.userId,
      userEmail: data.userEmail,
      customProperties: {
        plan: data.plan,
        billing_cycle: data.billingCycle,
        previous_plan: data.previousPlan,
        discount_code: data.discountCode,
        discount_amount: data.discountAmount,
        annual_value: data.billingCycle === 'yearly' ? data.value : (data.value || 0) * 12,
        ...data.customProperties,
      }
    })

    // Track upgrade/downgrade specifically
    if (data.previousPlan) {
      const isUpgrade = (
        (data.previousPlan === 'PRO' && data.plan === 'ENTERPRISE') ||
        (data.previousPlan === 'FREE')
      )
      
      trackConversion({
        conversionName: isUpgrade ? 'subscription_upgrade' : 'subscription_downgrade',
        value: data.value,
        currency: data.currency,
        transactionId: data.transactionId,
        customProperties: {
          from_plan: data.previousPlan,
          to_plan: data.plan,
          ...data.customProperties,
        }
      })
    }
  }, [trackConversion])

  // Analysis conversion (for engagement tracking)
  const trackAnalysisConversion = useCallback((data: AnalysisConversionData) => {
    trackConversion({
      conversionName: 'analysis_completed',
      value: 1, // Credit value equivalent
      userId: data.userId,
      customProperties: {
        text_length: data.textLength,
        confidence: data.confidence,
        processing_time: data.processingTime,
        analysis_type: data.analysisType,
        ...data.customProperties,
      }
    })

    // Track high-confidence analysis as quality conversion
    if (data.confidence >= 0.8) {
      trackConversion({
        conversionName: 'high_quality_analysis',
        value: 2, // Higher value for quality analysis
        customProperties: {
          confidence: data.confidence,
          analysis_type: data.analysisType,
        }
      })
    }
  }, [trackConversion])

  // API usage conversion
  const trackAPIConversion = useCallback((userData: {
    userId: string
    email?: string
    plan: string
  }) => {
    trackConversion({
      conversionName: 'api_key_generated',
      value: 10, // Estimated API user value
      userId: userData.userId,
      userEmail: userData.email,
      customProperties: {
        user_plan: userData.plan,
        feature: 'api_access',
        engagement_level: 'high',
      }
    })
  }, [trackConversion])

  // Trial conversion
  const trackTrialConversion = useCallback((userData: {
    userId: string
    email?: string
    plan: 'PRO' | 'ENTERPRISE'
    trialDays: number
  }) => {
    trackConversion({
      conversionName: 'trial_started',
      value: userData.plan === 'PRO' ? 12 : 100, // Monthly subscription value
      userId: userData.userId,
      userEmail: userData.email,
      customProperties: {
        trial_plan: userData.plan,
        trial_days: userData.trialDays,
        predicted_ltv: userData.plan === 'PRO' ? 144 : 1200, // Annual LTV
      }
    })
  }, [trackConversion])

  // Contact/Lead conversion
  const trackLeadConversion = useCallback((leadData: {
    email?: string
    source: string
    leadType: 'contact_form' | 'demo_request' | 'enterprise_inquiry' | 'support_ticket'
    value?: number
  }) => {
    const conversionValues = {
      contact_form: 5,
      demo_request: 50,
      enterprise_inquiry: 500,
      support_ticket: 2,
    }

    trackConversion({
      conversionName: 'lead_generated',
      value: leadData.value || conversionValues[leadData.leadType],
      userEmail: leadData.email,
      customProperties: {
        lead_type: leadData.leadType,
        lead_source: leadData.source,
        lead_quality: leadData.leadType === 'enterprise_inquiry' ? 'high' : 'medium',
      }
    })
  }, [trackConversion])

  // Re-engagement conversion
  const trackReEngagementConversion = useCallback((userData: {
    userId: string
    email?: string
    daysSinceLastActive: number
    reEngagementTrigger: string
  }) => {
    trackConversion({
      conversionName: 'user_reengaged',
      value: 5,
      userId: userData.userId,
      userEmail: userData.email,
      customProperties: {
        days_inactive: userData.daysSinceLastActive,
        reengagement_trigger: userData.reEngagementTrigger,
        user_segment: userData.daysSinceLastActive > 30 ? 'churned' : 'at_risk',
      }
    })
  }, [trackConversion])

  // Feature adoption conversion
  const trackFeatureAdoptionConversion = useCallback((featureData: {
    userId: string
    featureName: string
    userPlan: string
    timeToAdopt: number // in days
    isFirstUse: boolean
  }) => {
    trackConversion({
      conversionName: 'feature_adopted',
      value: 3,
      userId: featureData.userId,
      customProperties: {
        feature_name: featureData.featureName,
        user_plan: featureData.userPlan,
        time_to_adopt: featureData.timeToAdopt,
        is_first_use: featureData.isFirstUse,
        adoption_rate: featureData.timeToAdopt <= 7 ? 'fast' : 'slow',
      }
    })
  }, [trackConversion])

  // Referral conversion
  const trackReferralConversion = useCallback((referralData: {
    referrerId: string
    referredUserId: string
    referralCode?: string
    conversionType: 'signup' | 'subscription'
    value?: number
  }) => {
    trackConversion({
      conversionName: 'referral_conversion',
      value: referralData.value || (referralData.conversionType === 'signup' ? 10 : 50),
      userId: referralData.referrerId,
      customProperties: {
        referred_user_id: referralData.referredUserId,
        referral_code: referralData.referralCode,
        conversion_type: referralData.conversionType,
        referral_stage: referralData.conversionType,
      }
    })
  }, [trackConversion])

  return {
    trackConversion,
    trackSignupConversion,
    trackSubscriptionConversion,
    trackAnalysisConversion,
    trackAPIConversion,
    trackTrialConversion,
    trackLeadConversion,
    trackReEngagementConversion,
    trackFeatureAdoptionConversion,
    trackReferralConversion,
  }
}

export default useConversion