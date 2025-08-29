/**
 * Conversion Tracking Utilities
 * Advanced attribution tracking, funnel analysis, and conversion optimization
 */

import { analytics } from '@/lib/analytics/events';

export interface ConversionEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  revenue?: number;
  conversionValue?: number;
}

export interface AttributionData {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPage: string;
  timestamp: Date;
}

export interface FunnelStep {
  name: string;
  order: number;
  required: boolean;
  events: string[];
}

export interface UserJourney {
  userId?: string;
  sessionId: string;
  attribution: AttributionData;
  events: ConversionEvent[];
  conversionGoals: string[];
  totalRevenue: number;
  firstTouch: Date;
  lastTouch: Date;
  touchpoints: number;
}

class ConversionTracker {
  private journeys: Map<string, UserJourney> = new Map();
  private sessionId: string;
  private attribution: AttributionData | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.attribution = this.captureAttribution();
  }

  /**
   * Track a conversion event with full attribution
   */
  trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string,
    revenue?: number
  ): void {
    const event: ConversionEvent = {
      eventName,
      userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties,
      revenue,
      conversionValue: this.calculateConversionValue(eventName, properties, revenue)
    };

    // Track in analytics
    analytics.track(eventName, {
      ...properties,
      sessionId: this.sessionId,
      revenue,
      conversionValue: event.conversionValue,
      attribution: this.attribution
    });

    // Update user journey
    this.updateUserJourney(event);

    // Check for funnel progression
    this.checkFunnelProgression(event);

    // Store event locally
    this.storeEvent(event);
  }

  /**
   * Track page view with attribution
   */
  trackPageView(path: string, title?: string, userId?: string): void {
    this.trackEvent('page_view', {
      path,
      title,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    }, userId);
  }

  /**
   * Track conversion goal completion
   */
  trackConversion(
    goalName: string,
    value: number,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('conversion', {
      goalName,
      value,
      ...properties
    }, userId, value);

    // Mark goal as achieved in journey
    const journeyKey = userId || this.sessionId;
    const journey = this.journeys.get(journeyKey);
    if (journey && !journey.conversionGoals.includes(goalName)) {
      journey.conversionGoals.push(goalName);
      journey.totalRevenue += value;
    }
  }

  /**
   * Track email signup conversion
   */
  trackEmailSignup(
    email: string,
    source: string,
    userId?: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackConversion('email_signup', 0, {
      email,
      source,
      emailDomain: email.split('@')[1],
      ...properties
    }, userId);
  }

  /**
   * Track subscription conversion
   */
  trackSubscription(
    plan: string,
    amount: number,
    currency: string = 'USD',
    userId?: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackConversion('subscription', amount, {
      plan,
      currency,
      amount,
      ...properties
    }, userId);
  }

  /**
   * Track CTA clicks with context
   */
  trackCTAClick(
    ctaId: string,
    ctaText: string,
    location: string,
    userId?: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('cta_click', {
      ctaId,
      ctaText,
      location,
      ...properties
    }, userId);
  }

  /**
   * Track form submissions
   */
  trackFormSubmission(
    formName: string,
    formData: Record<string, any>,
    userId?: string
  ): void {
    this.trackEvent('form_submit', {
      formName,
      formFields: Object.keys(formData),
      ...formData
    }, userId);
  }

  /**
   * Track user engagement actions
   */
  trackEngagement(
    action: string,
    element: string,
    duration?: number,
    userId?: string
  ): void {
    this.trackEvent('engagement', {
      action,
      element,
      duration
    }, userId);
  }

  /**
   * Get user journey for analysis
   */
  getUserJourney(userId?: string): UserJourney | null {
    const key = userId || this.sessionId;
    return this.journeys.get(key) || null;
  }

  /**
   * Get conversion funnel analysis
   */
  getFunnelAnalysis(funnelSteps: FunnelStep[], userId?: string): {
    completed: FunnelStep[];
    current: FunnelStep | null;
    remaining: FunnelStep[];
    completionRate: number;
  } {
    const journey = this.getUserJourney(userId);
    if (!journey) {
      return {
        completed: [],
        current: funnelSteps[0] || null,
        remaining: funnelSteps,
        completionRate: 0
      };
    }

    const eventNames = journey.events.map(e => e.eventName);
    const completed: FunnelStep[] = [];
    let current: FunnelStep | null = null;

    for (const step of funnelSteps) {
      const stepCompleted = step.events.some(event => eventNames.includes(event));
      if (stepCompleted) {
        completed.push(step);
      } else {
        current = step;
        break;
      }
    }

    const remaining = funnelSteps.slice(completed.length + (current ? 1 : 0));
    const completionRate = completed.length / funnelSteps.length;

    return {
      completed,
      current,
      remaining,
      completionRate
    };
  }

  /**
   * Get attribution report
   */
  getAttributionReport(userId?: string): {
    attribution: AttributionData | null;
    touchpoints: ConversionEvent[];
    firstTouch: ConversionEvent | null;
    lastTouch: ConversionEvent | null;
    conversionPath: string[];
  } {
    const journey = this.getUserJourney(userId);
    if (!journey) {
      return {
        attribution: this.attribution,
        touchpoints: [],
        firstTouch: null,
        lastTouch: null,
        conversionPath: []
      };
    }

    const touchpoints = journey.events.filter(e => 
      ['page_view', 'cta_click', 'form_submit', 'email_signup'].includes(e.eventName)
    );

    const firstTouch = touchpoints[0] || null;
    const lastTouch = touchpoints[touchpoints.length - 1] || null;
    
    const conversionPath = touchpoints.map(tp => {
      const page = tp.properties.path || tp.properties.location || tp.eventName;
      return page;
    });

    return {
      attribution: journey.attribution,
      touchpoints,
      firstTouch,
      lastTouch,
      conversionPath
    };
  }

  /**
   * Calculate conversion value based on event type
   */
  private calculateConversionValue(
    eventName: string,
    properties: Record<string, any>,
    revenue?: number
  ): number {
    if (revenue) return revenue;

    // Assign values to different conversion events
    const eventValues: Record<string, number> = {
      email_signup: 5,
      trial_signup: 25,
      demo_request: 50,
      subscription: properties.amount || 120,
      upgrade: properties.amount || 240,
      referral: 10
    };

    return eventValues[eventName] || 0;
  }

  /**
   * Update user journey with new event
   */
  private updateUserJourney(event: ConversionEvent): void {
    const key = event.userId || event.sessionId;
    let journey = this.journeys.get(key);

    if (!journey) {
      journey = {
        userId: event.userId,
        sessionId: event.sessionId,
        attribution: this.attribution!,
        events: [],
        conversionGoals: [],
        totalRevenue: 0,
        firstTouch: event.timestamp,
        lastTouch: event.timestamp,
        touchpoints: 1
      };
      this.journeys.set(key, journey);
    }

    journey.events.push(event);
    journey.lastTouch = event.timestamp;
    journey.touchpoints = journey.events.length;
    
    if (event.revenue) {
      journey.totalRevenue += event.revenue;
    }
  }

  /**
   * Check if user progressed through funnel steps
   */
  private checkFunnelProgression(event: ConversionEvent): void {
    const commonFunnelSteps: FunnelStep[] = [
      {
        name: 'Landing',
        order: 1,
        required: true,
        events: ['page_view']
      },
      {
        name: 'Engagement',
        order: 2,
        required: false,
        events: ['cta_click', 'form_view', 'video_play']
      },
      {
        name: 'Lead',
        order: 3,
        required: false,
        events: ['email_signup', 'form_submit']
      },
      {
        name: 'Trial',
        order: 4,
        required: false,
        events: ['trial_signup', 'demo_request']
      },
      {
        name: 'Conversion',
        order: 5,
        required: false,
        events: ['subscription', 'purchase']
      }
    ];

    // Check if this event represents funnel progression
    const relevantStep = commonFunnelSteps.find(step => 
      step.events.includes(event.eventName)
    );

    if (relevantStep) {
      analytics.track('funnel_progression', {
        step: relevantStep.name,
        stepOrder: relevantStep.order,
        eventName: event.eventName,
        sessionId: event.sessionId,
        userId: event.userId
      });
    }
  }

  /**
   * Capture attribution data from URL parameters and referrer
   */
  private captureAttribution(): AttributionData {
    if (typeof window === 'undefined') {
      return {
        source: 'direct',
        medium: 'none',
        landingPage: '/',
        timestamp: new Date()
      };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // UTM parameters
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const utmContent = urlParams.get('utm_content');
    
    // Google Click ID
    const gclid = urlParams.get('gclid');
    
    let source = 'direct';
    let medium = 'none';
    
    if (utmSource) {
      source = utmSource;
      medium = utmMedium || 'unknown';
    } else if (gclid) {
      source = 'google';
      medium = 'cpc';
    } else if (referrer) {
      const referrerDomain = new URL(referrer).hostname;
      if (referrerDomain.includes('google')) {
        source = 'google';
        medium = 'organic';
      } else if (referrerDomain.includes('facebook')) {
        source = 'facebook';
        medium = 'social';
      } else if (referrerDomain.includes('twitter')) {
        source = 'twitter';
        medium = 'social';
      } else {
        source = referrerDomain;
        medium = 'referral';
      }
    }
    
    const attribution: AttributionData = {
      source,
      medium,
      campaign: utmCampaign || undefined,
      term: utmTerm || undefined,
      content: utmContent || undefined,
      referrer: referrer || undefined,
      landingPage: window.location.pathname,
      timestamp: new Date()
    };
    
    // Store attribution data
    try {
      localStorage.setItem('truecheckia_attribution', JSON.stringify(attribution));
    } catch (error) {
      console.warn('Failed to store attribution data:', error);
    }
    
    return attribution;
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('truecheckia_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('truecheckia_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Store event in local storage for offline analysis
   */
  private storeEvent(event: ConversionEvent): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const key = 'truecheckia_conversion_events';
      const stored = localStorage.getItem(key);
      const events = stored ? JSON.parse(stored) : [];
      
      // Keep only last 100 events
      events.push({
        ...event,
        timestamp: event.timestamp.toISOString()
      });
      
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store conversion event:', error);
    }
  }

  /**
   * Get stored events from local storage
   */
  getStoredEvents(): ConversionEvent[] {
    if (typeof localStorage === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('truecheckia_conversion_events');
      return stored ? JSON.parse(stored).map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      })) : [];
    } catch (error) {
      console.warn('Failed to retrieve stored events:', error);
      return [];
    }
  }

  /**
   * Clear stored data (for testing or privacy)
   */
  clearStoredData(): void {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.removeItem('truecheckia_conversion_events');
    localStorage.removeItem('truecheckia_attribution');
    sessionStorage.removeItem('truecheckia_session_id');
    this.journeys.clear();
  }
}

// Export singleton instance
export const conversionTracker = new ConversionTracker();

// Convenience functions
export const trackPageView = (path: string, title?: string, userId?: string) => 
  conversionTracker.trackPageView(path, title, userId);

export const trackConversion = (goalName: string, value: number, properties?: Record<string, any>, userId?: string) => 
  conversionTracker.trackConversion(goalName, value, properties, userId);

export const trackEmailSignup = (email: string, source: string, userId?: string, properties?: Record<string, any>) => 
  conversionTracker.trackEmailSignup(email, source, userId, properties);

export const trackSubscription = (plan: string, amount: number, currency?: string, userId?: string, properties?: Record<string, any>) => 
  conversionTracker.trackSubscription(plan, amount, currency, userId, properties);

export const trackCTAClick = (ctaId: string, ctaText: string, location: string, userId?: string, properties?: Record<string, any>) => 
  conversionTracker.trackCTAClick(ctaId, ctaText, location, userId, properties);

export const trackFormSubmission = (formName: string, formData: Record<string, any>, userId?: string) => 
  conversionTracker.trackFormSubmission(formName, formData, userId);

export const trackEngagement = (action: string, element: string, duration?: number, userId?: string) => 
  conversionTracker.trackEngagement(action, element, duration, userId);
