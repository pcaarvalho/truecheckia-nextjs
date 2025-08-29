/**
 * Mixpanel Integration
 * Advanced product analytics and user journey tracking
 */

export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'XXXXXXXXXX'

interface MixpanelEvent {
  event_name: string
  properties?: Record<string, any>
}

interface MixpanelUserProfile {
  $email?: string
  $name?: string
  $created?: Date
  $last_login?: Date
  $phone?: string
  plan?: string
  credits_remaining?: number
  total_analyses?: number
  signup_method?: string
  [key: string]: any
}

// Initialize Mixpanel
export function initMixpanel(): void {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN || MIXPANEL_TOKEN === 'XXXXXXXXXX') return

  // Mixpanel initialization script
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = `
    (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
    
    mixpanel.init('${MIXPANEL_TOKEN}', {
      debug: ${process.env.NODE_ENV === 'development'},
      track_pageview: false,
      persistence: 'localStorage',
      ip: false,
      property_blacklist: ['$current_url', '$initial_referrer', '$referrer'],
      ignore_dnt: false,
      secure_cookie: true,
      cross_subdomain_cookie: false,
      api_host: 'https://api.mixpanel.com'
    });
  `
  
  document.head.appendChild(script)
}

// Track events
export function trackMixpanelEvent(event: MixpanelEvent): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.track(event.event_name, {
    ...event.properties,
    timestamp: new Date().toISOString(),
    $source: 'web',
    product: 'truecheckia'
  })
}

// Identify users
export function identifyMixpanelUser(userId: string, properties?: MixpanelUserProfile): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.identify(userId)
  
  if (properties) {
    setMixpanelUserProfile(properties)
  }
}

// Set user profile properties
export function setMixpanelUserProfile(properties: MixpanelUserProfile): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  // Set profile properties
  window.mixpanel.people.set({
    ...properties,
    $last_seen: new Date().toISOString(),
  })
}

// Increment user properties
export function incrementMixpanelUserProperty(property: string, value: number = 1): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.people.increment(property, value)
}

// Track revenue
export function trackMixpanelRevenue(amount: number, properties?: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.people.track_charge(amount, {
    ...properties,
    $time: new Date().toISOString(),
  })
}

// Set user properties once
export function setMixpanelUserPropertiesOnce(properties: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.people.set_once(properties)
}

// TrueCheckIA specific Mixpanel events

// User Journey Events
export function trackMixpanelPageView(pageName: string, properties?: Record<string, any>): void {
  trackMixpanelEvent({
    event_name: 'Page Viewed',
    properties: {
      page_name: pageName,
      page_path: window.location.pathname,
      page_url: window.location.href,
      ...properties
    }
  })
}

export function trackMixpanelSignup(method: string, source?: string): void {
  trackMixpanelEvent({
    event_name: 'Account Created',
    properties: {
      signup_method: method,
      signup_source: source,
      plan: 'FREE'
    }
  })
}

export function trackMixpanelLogin(method: string): void {
  trackMixpanelEvent({
    event_name: 'Logged In',
    properties: {
      login_method: method
    }
  })
}

// Analysis Events
export function trackMixpanelAnalysisStarted(textLength: number, analysisType: string = 'text'): void {
  trackMixpanelEvent({
    event_name: 'Analysis Started',
    properties: {
      text_length: textLength,
      analysis_type: analysisType
    }
  })
}

export function trackMixpanelAnalysisCompleted(params: {
  textLength: number
  confidence: number
  aiProbability: number
  processingTime: number
  creditsUsed: number
  analysisType?: string
  result?: 'ai_generated' | 'human_written' | 'mixed'
}): void {
  trackMixpanelEvent({
    event_name: 'Analysis Completed',
    properties: {
      text_length: params.textLength,
      confidence_score: params.confidence,
      ai_probability: params.aiProbability,
      processing_time: params.processingTime,
      credits_used: params.creditsUsed,
      analysis_type: params.analysisType || 'text',
      analysis_result: params.result
    }
  })

  // Increment user analysis count
  incrementMixpanelUserProperty('total_analyses')
}

export function trackMixpanelAnalysisShared(shareMethod: string): void {
  trackMixpanelEvent({
    event_name: 'Analysis Shared',
    properties: {
      share_method: shareMethod
    }
  })
}

// Subscription Events
export function trackMixpanelSubscriptionViewed(plan: string): void {
  trackMixpanelEvent({
    event_name: 'Subscription Plan Viewed',
    properties: {
      plan: plan
    }
  })
}

export function trackMixpanelSubscriptionStarted(plan: string, billingCycle: string): void {
  trackMixpanelEvent({
    event_name: 'Subscription Started',
    properties: {
      plan: plan,
      billing_cycle: billingCycle
    }
  })
}

export function trackMixpanelSubscriptionCompleted(params: {
  plan: string
  billingCycle: string
  price: number
  transactionId: string
  previousPlan?: string
}): void {
  trackMixpanelEvent({
    event_name: 'Subscription Completed',
    properties: {
      plan: params.plan,
      billing_cycle: params.billingCycle,
      price: params.price,
      transaction_id: params.transactionId,
      previous_plan: params.previousPlan
    }
  })

  // Track revenue
  trackMixpanelRevenue(params.price, {
    plan: params.plan,
    billing_cycle: params.billingCycle
  })

  // Update user profile
  setMixpanelUserProfile({
    plan: params.plan,
    subscription_status: 'active',
    last_payment: new Date()
  })
}

// Feature Usage Events
export function trackMixpanelFeatureUsed(featureName: string, properties?: Record<string, any>): void {
  trackMixpanelEvent({
    event_name: 'Feature Used',
    properties: {
      feature_name: featureName,
      ...properties
    }
  })
}

export function trackMixpanelAPIKeyGenerated(): void {
  trackMixpanelEvent({
    event_name: 'API Key Generated',
    properties: {
      feature: 'api_access'
    }
  })
}

export function trackMixpanelBulkAnalysisUpload(fileCount: number, totalSize: number): void {
  trackMixpanelEvent({
    event_name: 'Bulk Analysis Uploaded',
    properties: {
      file_count: fileCount,
      total_file_size: totalSize
    }
  })
}

// User Engagement Events
export function trackMixpanelTutorialStarted(tutorialName: string): void {
  trackMixpanelEvent({
    event_name: 'Tutorial Started',
    properties: {
      tutorial_name: tutorialName
    }
  })
}

export function trackMixpanelTutorialCompleted(tutorialName: string): void {
  trackMixpanelEvent({
    event_name: 'Tutorial Completed',
    properties: {
      tutorial_name: tutorialName
    }
  })
}

export function trackMixpanelSupportContacted(method: string, issue?: string): void {
  trackMixpanelEvent({
    event_name: 'Support Contacted',
    properties: {
      contact_method: method,
      issue_type: issue
    }
  })
}

export function trackMixpanelFeedbackSubmitted(rating: number, category?: string): void {
  trackMixpanelEvent({
    event_name: 'Feedback Submitted',
    properties: {
      rating: rating,
      feedback_category: category
    }
  })
}

// Error Events
export function trackMixpanelError(errorType: string, errorMessage: string, context?: Record<string, any>): void {
  trackMixpanelEvent({
    event_name: 'Error Occurred',
    properties: {
      error_type: errorType,
      error_message: errorMessage,
      page_path: window.location.pathname,
      ...context
    }
  })
}

// Funnel Events
export function trackMixpanelFunnelStep(funnelName: string, stepName: string, stepIndex: number): void {
  trackMixpanelEvent({
    event_name: `${funnelName} - ${stepName}`,
    properties: {
      funnel_name: funnelName,
      step_name: stepName,
      step_index: stepIndex
    }
  })
}

// A/B Test Events
export function trackMixpanelABTest(testName: string, variant: string): void {
  trackMixpanelEvent({
    event_name: 'A/B Test Viewed',
    properties: {
      test_name: testName,
      variant: variant
    }
  })

  // Set as super property for all future events
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.register({
      [`ab_test_${testName}`]: variant
    })
  }
}

// Cohort Analysis
export function setMixpanelCohort(cohortName: string, cohortValue: string): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.register({
    [`cohort_${cohortName}`]: cohortValue
  })
}

// Group Analytics (for company/organization tracking)
export function setMixpanelGroup(groupKey: string, groupId: string): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.set_group(groupKey, groupId)
}

// Consent management
export function optInMixpanelTracking(): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.opt_in_tracking()
}

export function optOutMixpanelTracking(): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.opt_out_tracking()
}

export function resetMixpanelUser(): void {
  if (typeof window === 'undefined' || !window.mixpanel) return

  window.mixpanel.reset()
}

// Global Mixpanel declaration
declare global {
  interface Window {
    mixpanel: any
  }
}