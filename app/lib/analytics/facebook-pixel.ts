/**
 * Facebook Pixel Integration
 * Provides conversion tracking and custom audiences
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'XXXXXXXXXX'

interface FacebookEvent {
  event: string
  parameters?: Record<string, any>
  eventID?: string
}

interface FacebookPurchaseEvent {
  value: number
  currency: string
  content_ids?: string[]
  content_type?: string
  content_name?: string
  content_category?: string
  num_items?: number
}

// Initialize Facebook Pixel
export function initFacebookPixel(): void {
  if (typeof window === 'undefined' || !FB_PIXEL_ID || FB_PIXEL_ID === 'XXXXXXXXXX') return

  // Facebook Pixel base code
  const script = document.createElement('script')
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', '${FB_PIXEL_ID}');
    fbq('track', 'PageView');
  `
  
  document.head.appendChild(script)

  // Add noscript fallback
  const noscript = document.createElement('noscript')
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none" 
         src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />
  `
  document.body.appendChild(noscript)
}

// Track custom events
export function trackFacebookEvent(event: FacebookEvent): void {
  if (typeof window === 'undefined' || !window.fbq) return

  if (event.parameters) {
    window.fbq('track', event.event, event.parameters, { eventID: event.eventID })
  } else {
    window.fbq('track', event.event)
  }
}

// Track standard events
export function trackFacebookPageView(): void {
  if (typeof window === 'undefined' || !window.fbq) return
  
  window.fbq('track', 'PageView')
}

export function trackFacebookViewContent(contentName: string, contentCategory?: string, value?: number): void {
  trackFacebookEvent({
    event: 'ViewContent',
    parameters: {
      content_name: contentName,
      content_category: contentCategory,
      value: value,
      currency: 'USD',
    }
  })
}

export function trackFacebookLead(value?: number): void {
  trackFacebookEvent({
    event: 'Lead',
    parameters: {
      value: value,
      currency: 'USD',
    }
  })
}

export function trackFacebookCompleteRegistration(): void {
  trackFacebookEvent({
    event: 'CompleteRegistration',
    parameters: {
      status: 'completed',
    }
  })
}

export function trackFacebookPurchase(purchaseData: FacebookPurchaseEvent): void {
  trackFacebookEvent({
    event: 'Purchase',
    parameters: {
      value: purchaseData.value,
      currency: purchaseData.currency,
      content_ids: purchaseData.content_ids,
      content_type: purchaseData.content_type,
      content_name: purchaseData.content_name,
      content_category: purchaseData.content_category,
      num_items: purchaseData.num_items,
    }
  })
}

export function trackFacebookInitiateCheckout(value: number, contentIds?: string[]): void {
  trackFacebookEvent({
    event: 'InitiateCheckout',
    parameters: {
      value: value,
      currency: 'USD',
      content_ids: contentIds,
    }
  })
}

export function trackFacebookSearch(searchString: string): void {
  trackFacebookEvent({
    event: 'Search',
    parameters: {
      search_string: searchString,
    }
  })
}

export function trackFacebookContact(): void {
  trackFacebookEvent({
    event: 'Contact',
  })
}

// TrueCheckIA specific Facebook events
export function trackFacebookAnalysisCompleted(confidence: number, textLength: number): void {
  trackFacebookEvent({
    event: 'AnalysisCompleted',
    parameters: {
      custom_confidence: confidence,
      custom_text_length: textLength,
      value: 1, // Credit used
      currency: 'USD',
    }
  })
}

export function trackFacebookSubscriptionStarted(plan: string): void {
  trackFacebookEvent({
    event: 'StartTrial',
    parameters: {
      predicted_ltv: plan === 'PRO' ? 144 : 1200, // Annual value
      custom_plan: plan,
    }
  })
}

export function trackFacebookSubscriptionCompleted(plan: string, value: number): void {
  trackFacebookPurchase({
    value: value,
    currency: 'USD',
    content_ids: [`subscription_${plan.toLowerCase()}`],
    content_type: 'subscription',
    content_name: `${plan} Subscription`,
    content_category: 'subscription',
    num_items: 1,
  })
}

export function trackFacebookAPIKeyGenerated(): void {
  trackFacebookEvent({
    event: 'CustomizeProduct',
    parameters: {
      custom_feature: 'api_access',
    }
  })
}

// Conversion API events (for server-side tracking)
export function trackFacebookConversionAPI(event: FacebookEvent, userData?: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}): void {
  // This would typically be handled server-side
  // For now, we'll just track client-side
  trackFacebookEvent(event)
}

// Advanced matching
export function setFacebookAdvancedMatching(userData: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}): void {
  if (typeof window === 'undefined' || !window.fbq) return

  const hashedData: Record<string, string> = {}
  
  // In a real implementation, you would hash these values
  // For now, we'll pass them as-is (Facebook will hash them)
  if (userData.email) hashedData.em = userData.email
  if (userData.phone) hashedData.ph = userData.phone
  if (userData.firstName) hashedData.fn = userData.firstName
  if (userData.lastName) hashedData.ln = userData.lastName
  if (userData.city) hashedData.ct = userData.city
  if (userData.state) hashedData.st = userData.state
  if (userData.zip) hashedData.zp = userData.zip
  if (userData.country) hashedData.country = userData.country

  window.fbq('init', FB_PIXEL_ID, hashedData)
}

// Consent management
export function grantFacebookConsent(): void {
  if (typeof window === 'undefined') return
  
  initFacebookPixel()
}

export function revokeFacebookConsent(): void {
  if (typeof window === 'undefined' || !window.fbq) return
  
  // Facebook doesn't have a direct consent revoke method
  // You would typically stop loading the pixel or clear data
  window.fbq = () => {}
}

// Global Facebook Pixel declaration
declare global {
  interface Window {
    fbq: (...args: any[]) => void
    _fbq: any
  }
}