/**
 * LinkedIn Insight Tag Integration
 * Provides B2B tracking and conversion tracking
 */

export const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || 'XXXXXXXXXX'

interface LinkedInEvent {
  conversion_id: string
  value?: number
  currency?: string
  event_id?: string
}

interface LinkedInCustomEvent {
  event_name: string
  properties?: Record<string, any>
}

// Initialize LinkedIn Insight Tag
export function initLinkedInInsight(): void {
  if (typeof window === 'undefined' || !LINKEDIN_PARTNER_ID || LINKEDIN_PARTNER_ID === 'XXXXXXXXXX') return

  // LinkedIn Insight Tag script
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = `
    _linkedin_partner_id = "${LINKEDIN_PARTNER_ID}";
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    
    (function(l) {
      if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  `
  
  document.head.appendChild(script)

  // Add noscript fallback
  const noscript = document.createElement('noscript')
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none" alt="" 
         src="https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif" />
  `
  document.body.appendChild(noscript)
}

// Track page views
export function trackLinkedInPageView(): void {
  if (typeof window === 'undefined' || !window.lintrk) return
  
  window.lintrk('track', { conversion_id: 'page_view' })
}

// Track conversions
export function trackLinkedInConversion(event: LinkedInEvent): void {
  if (typeof window === 'undefined' || !window.lintrk) return

  const conversionData: any = {
    conversion_id: event.conversion_id
  }

  if (event.value !== undefined) {
    conversionData.value = event.value
  }
  
  if (event.currency) {
    conversionData.currency = event.currency
  }

  if (event.event_id) {
    conversionData.event_id = event.event_id
  }

  window.lintrk('track', conversionData)
}

// Track custom events
export function trackLinkedInCustomEvent(event: LinkedInCustomEvent): void {
  if (typeof window === 'undefined' || !window.lintrk) return

  window.lintrk('track', {
    conversion_id: event.event_name,
    ...event.properties
  })
}

// TrueCheckIA specific LinkedIn events
export function trackLinkedInSignup(method: string = 'email'): void {
  trackLinkedInConversion({
    conversion_id: 'signup_completed',
    value: 0,
    currency: 'USD'
  })

  // Also track as custom event with more details
  trackLinkedInCustomEvent({
    event_name: 'user_registration',
    properties: {
      signup_method: method,
      product: 'truecheckia',
      category: 'b2b_saas'
    }
  })
}

export function trackLinkedInSubscription(plan: string, value: number, billingCycle: string): void {
  trackLinkedInConversion({
    conversion_id: 'subscription_purchased',
    value: value,
    currency: 'USD'
  })

  // Track custom event with subscription details
  trackLinkedInCustomEvent({
    event_name: 'subscription_conversion',
    properties: {
      plan: plan,
      billing_cycle: billingCycle,
      value: value,
      product: 'truecheckia',
      category: 'ai_tools'
    }
  })
}

export function trackLinkedInDemo(demoType: string = 'analysis'): void {
  trackLinkedInCustomEvent({
    event_name: 'demo_completed',
    properties: {
      demo_type: demoType,
      product: 'truecheckia',
      stage: 'evaluation'
    }
  })
}

export function trackLinkedInAPIInterest(): void {
  trackLinkedInCustomEvent({
    event_name: 'api_interest',
    properties: {
      feature: 'api_access',
      product: 'truecheckia',
      stage: 'consideration'
    }
  })
}

export function trackLinkedInEnterpriseInquiry(): void {
  trackLinkedInConversion({
    conversion_id: 'enterprise_inquiry',
    value: 1200, // Estimated annual value
    currency: 'USD'
  })

  trackLinkedInCustomEvent({
    event_name: 'enterprise_contact',
    properties: {
      plan: 'enterprise',
      product: 'truecheckia',
      lead_quality: 'high'
    }
  })
}

export function trackLinkedInContentEngagement(contentType: string, actionType: string): void {
  trackLinkedInCustomEvent({
    event_name: 'content_engagement',
    properties: {
      content_type: contentType,
      action_type: actionType,
      product: 'truecheckia'
    }
  })
}

export function trackLinkedInFeatureUsage(featureName: string): void {
  trackLinkedInCustomEvent({
    event_name: 'feature_usage',
    properties: {
      feature: featureName,
      product: 'truecheckia',
      user_segment: 'active'
    }
  })
}

// B2B specific tracking
export function trackLinkedInLeadMagnet(leadType: string): void {
  trackLinkedInCustomEvent({
    event_name: 'lead_magnet_download',
    properties: {
      lead_type: leadType,
      product: 'truecheckia',
      funnel_stage: 'awareness'
    }
  })
}

export function trackLinkedInWebinar(webinarTopic: string, action: 'registered' | 'attended'): void {
  trackLinkedInCustomEvent({
    event_name: `webinar_${action}`,
    properties: {
      webinar_topic: webinarTopic,
      product: 'truecheckia',
      engagement_level: action === 'attended' ? 'high' : 'medium'
    }
  })
}

export function trackLinkedInCaseStudy(industry: string): void {
  trackLinkedInCustomEvent({
    event_name: 'case_study_viewed',
    properties: {
      industry: industry,
      product: 'truecheckia',
      content_type: 'social_proof'
    }
  })
}

// Advanced audience targeting
export function setLinkedInCompanyData(companyData: {
  company?: string
  industry?: string
  job_title?: string
  seniority?: string
  company_size?: string
}): void {
  if (typeof window === 'undefined' || !window.lintrk) return

  // LinkedIn automatically collects this data, but we can enhance it
  trackLinkedInCustomEvent({
    event_name: 'profile_data',
    properties: {
      ...companyData,
      timestamp: new Date().toISOString()
    }
  })
}

// Account-based marketing (ABM) tracking
export function trackLinkedInABMAccount(accountName: string, accountValue: number): void {
  trackLinkedInCustomEvent({
    event_name: 'abm_account_engagement',
    properties: {
      account_name: accountName,
      account_value: accountValue,
      product: 'truecheckia',
      strategy: 'abm'
    }
  })
}

// Consent management
export function grantLinkedInConsent(): void {
  if (typeof window === 'undefined') return
  
  initLinkedInInsight()
}

export function revokeLinkedInConsent(): void {
  if (typeof window === 'undefined' || !window.lintrk) return
  
  // LinkedIn doesn't have direct consent revoke
  // Typically you would stop loading the tag
  window.lintrk = () => {}
}

// Global LinkedIn Insight declaration
declare global {
  interface Window {
    lintrk: (...args: any[]) => void
    _linkedin_partner_id: string
    _linkedin_data_partner_ids: string[]
  }
}