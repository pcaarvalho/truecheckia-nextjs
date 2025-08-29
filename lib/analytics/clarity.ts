/**
 * Microsoft Clarity Integration
 * Provides heatmaps and session recordings
 */

export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'XXXXXXXXXX'

interface ClarityEvent {
  event: string
  properties?: Record<string, any>
}

// Initialize Microsoft Clarity
export function initClarity(): void {
  if (typeof window === 'undefined' || !CLARITY_PROJECT_ID || CLARITY_PROJECT_ID === 'XXXXXXXXXX') return

  // Clarity script injection
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = `
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
  `
  
  document.head.appendChild(script)
}

// Track custom events in Clarity
export function trackClarityEvent(event: ClarityEvent): void {
  if (typeof window === 'undefined' || !window.clarity) return

  if (event.properties) {
    window.clarity('event', event.event, event.properties)
  } else {
    window.clarity('event', event.event)
  }
}

// Set user ID in Clarity
export function setClarityUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.clarity) return

  window.clarity('identify', userId)
}

// Set custom session data
export function setClarityCustomData(key: string, value: string): void {
  if (typeof window === 'undefined' || !window.clarity) return

  window.clarity('set', key, value)
}

// Track page views in Clarity
export function trackClarityPageView(page: string): void {
  trackClarityEvent({
    event: 'page_view',
    properties: {
      page_path: page,
      timestamp: new Date().toISOString(),
    }
  })
}

// TrueCheckIA specific Clarity events
export function trackClarityAnalysis(analysisType: string, confidence: number): void {
  trackClarityEvent({
    event: 'analysis_completed',
    properties: {
      analysis_type: analysisType,
      confidence_score: confidence,
      timestamp: new Date().toISOString(),
    }
  })
}

export function trackClaritySubscription(plan: string, price: number): void {
  trackClarityEvent({
    event: 'subscription_completed',
    properties: {
      plan: plan,
      price: price,
      timestamp: new Date().toISOString(),
    }
  })
}

export function trackClarityError(errorType: string, errorMessage: string): void {
  trackClarityEvent({
    event: 'error_occurred',
    properties: {
      error_type: errorType,
      error_message: errorMessage,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    }
  })
}

// Clarity consent management
export function startClarityWithConsent(): void {
  if (typeof window === 'undefined') return
  
  initClarity()
}

export function stopClarityTracking(): void {
  if (typeof window === 'undefined' || !window.clarity) return
  
  // Clarity doesn't have a direct stop method, but we can stop sending events
  window.clarity = () => {}
}

// Global clarity declaration
declare global {
  interface Window {
    clarity: (...args: any[]) => void
  }
}