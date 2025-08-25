/**
 * Experiment Tracking System
 * Handles event tracking, conversion metrics, and statistical analysis
 */

import { analytics } from '@/app/lib/analytics/events';
import { ExperimentResult, abTest } from './ab-test';

export interface ConversionEvent {
  name: string;
  value?: number;
  properties?: Record<string, any>;
  revenue?: number;
  userId?: string;
  sessionId?: string;
}

export interface MetricDefinition {
  name: string;
  description: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'unique';
  events: string[];
  filters?: Record<string, any>;
}

// Core conversion metrics for TrueCheckIA
export const CONVERSION_METRICS: Record<string, MetricDefinition> = {
  // Primary conversion metrics
  signup_rate: {
    name: 'Signup Rate',
    description: 'Percentage of visitors who create an account',
    type: 'percentage',
    events: ['user_signup', 'page_view']
  },
  
  subscription_conversion: {
    name: 'Subscription Conversion',
    description: 'Percentage of users who purchase a subscription',
    type: 'percentage',
    events: ['subscription_created', 'user_signup']
  },
  
  trial_to_paid: {
    name: 'Trial to Paid Conversion',
    description: 'Percentage of trial users who convert to paid',
    type: 'percentage',
    events: ['subscription_created', 'trial_started']
  },
  
  // Engagement metrics
  user_activation: {
    name: 'User Activation Rate',
    description: 'Percentage of users who complete first analysis',
    type: 'percentage',
    events: ['first_analysis_completed', 'user_signup']
  },
  
  analysis_completion: {
    name: 'Analysis Completion Rate',
    description: 'Percentage of started analyses that are completed',
    type: 'percentage',
    events: ['analysis_completed', 'analysis_started']
  },
  
  // Email and lead metrics
  email_signup: {
    name: 'Email Signup Rate',
    description: 'Percentage of visitors who provide email',
    type: 'percentage',
    events: ['email_captured', 'page_view']
  },
  
  // CTA and interaction metrics
  cta_click_rate: {
    name: 'CTA Click Rate',
    description: 'Percentage of CTA button clicks',
    type: 'percentage',
    events: ['cta_clicked', 'cta_viewed']
  },
  
  // Revenue metrics
  revenue_per_visitor: {
    name: 'Revenue per Visitor',
    description: 'Average revenue generated per visitor',
    type: 'average',
    events: ['purchase_completed']
  },
  
  // Retention metrics
  day_1_retention: {
    name: 'Day 1 Retention',
    description: 'Percentage of users who return within 24 hours',
    type: 'percentage',
    events: ['user_returned_day_1', 'user_signup']
  },
  
  day_7_retention: {
    name: 'Day 7 Retention',
    description: 'Percentage of users who return within 7 days',
    type: 'percentage',
    events: ['user_returned_day_7', 'user_signup']
  }
};

class ExperimentTracker {
  private conversionGoals: Map<string, number> = new Map();
  private sessionStartTime: number = Date.now();

  /**
   * Track a conversion event for experiments
   */
  trackConversion(event: ConversionEvent): void {
    const { name, value = 1, properties = {}, revenue, userId } = event;
    
    // Track in analytics
    analytics.track(name, {
      ...properties,
      value,
      revenue,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    });

    // Track for all active experiments
    const activeExperiments = abTest.getActiveExperiments();
    
    activeExperiments.forEach(experiment => {
      // Check if this event is relevant to the experiment's target metric
      const metric = CONVERSION_METRICS[experiment.targetMetric];
      if (metric && metric.events.includes(name)) {
        abTest.trackResult(
          experiment.id,
          experiment.targetMetric,
          value,
          {
            event: name,
            ...properties,
            revenue,
            timestamp: new Date().toISOString()
          },
          userId
        );
      }
    });
  }

  /**
   * Track page view (for calculating conversion rates)
   */
  trackPageView(path: string, userId?: string): void {
    this.trackConversion({
      name: 'page_view',
      properties: {
        path,
        referrer: typeof window !== 'undefined' ? document.referrer : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
      },
      userId
    });
  }

  /**
   * Track user signup
   */
  trackSignup(userId: string, method: 'email' | 'google' = 'email', properties?: Record<string, any>): void {
    this.trackConversion({
      name: 'user_signup',
      properties: {
        method,
        ...properties
      },
      userId
    });
  }

  /**
   * Track subscription creation
   */
  trackSubscription(userId: string, plan: string, amount: number, currency: string = 'USD'): void {
    this.trackConversion({
      name: 'subscription_created',
      value: 1,
      revenue: amount,
      properties: {
        plan,
        currency,
        amount
      },
      userId
    });
  }

  /**
   * Track analysis completion
   */
  trackAnalysisCompleted(userId?: string, analysisType?: string, creditsUsed?: number): void {
    this.trackConversion({
      name: 'analysis_completed',
      value: 1,
      properties: {
        analysisType,
        creditsUsed,
        timeToComplete: Date.now() - this.sessionStartTime
      },
      userId
    });
  }

  /**
   * Track first analysis (activation event)
   */
  trackFirstAnalysis(userId: string): void {
    this.trackConversion({
      name: 'first_analysis_completed',
      value: 1,
      properties: {
        timeToActivation: Date.now() - this.sessionStartTime
      },
      userId
    });
  }

  /**
   * Track email capture from popups/forms
   */
  trackEmailCapture(email: string, source: string, userId?: string): void {
    this.trackConversion({
      name: 'email_captured',
      value: 1,
      properties: {
        source, // 'exit_intent', 'newsletter', 'lead_magnet', etc.
        email_domain: email.split('@')[1]
      },
      userId
    });
  }

  /**
   * Track CTA interactions
   */
  trackCTAClick(ctaId: string, ctaText: string, location: string, userId?: string): void {
    this.trackConversion({
      name: 'cta_clicked',
      value: 1,
      properties: {
        ctaId,
        ctaText,
        location
      },
      userId
    });
  }

  trackCTAView(ctaId: string, ctaText: string, location: string, userId?: string): void {
    this.trackConversion({
      name: 'cta_viewed',
      value: 1,
      properties: {
        ctaId,
        ctaText,
        location
      },
      userId
    });
  }

  /**
   * Track user return visits
   */
  trackUserReturn(userId: string, daysSinceSignup: number): void {
    if (daysSinceSignup === 1) {
      this.trackConversion({
        name: 'user_returned_day_1',
        value: 1,
        userId
      });
    } else if (daysSinceSignup === 7) {
      this.trackConversion({
        name: 'user_returned_day_7',
        value: 1,
        userId
      });
    }
  }

  /**
   * Track exit intent popup interactions
   */
  trackExitIntentShown(popupType: string, userId?: string): void {
    this.trackConversion({
      name: 'exit_intent_shown',
      properties: {
        popupType
      },
      userId
    });
  }

  trackExitIntentConversion(popupType: string, action: string, userId?: string): void {
    this.trackConversion({
      name: 'exit_intent_conversion',
      value: 1,
      properties: {
        popupType,
        action
      },
      userId
    });
  }

  /**
   * Track social proof interactions
   */
  trackSocialProofView(type: string, location: string, userId?: string): void {
    this.trackConversion({
      name: 'social_proof_viewed',
      properties: {
        type,
        location
      },
      userId
    });
  }

  trackSocialProofClick(type: string, location: string, userId?: string): void {
    this.trackConversion({
      name: 'social_proof_clicked',
      value: 1,
      properties: {
        type,
        location
      },
      userId
    });
  }

  /**
   * Set conversion goals for tracking
   */
  setConversionGoal(metric: string, targetValue: number): void {
    this.conversionGoals.set(metric, targetValue);
  }

  /**
   * Get session ID for tracking
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('truecheckia_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('truecheckia_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(
    controlConversions: number,
    controlSample: number,
    variantConversions: number,
    variantSample: number
  ): { pValue: number; significant: boolean; confidenceLevel: number } {
    const p1 = controlConversions / controlSample;
    const p2 = variantConversions / variantSample;
    const pPool = (controlConversions + variantConversions) / (controlSample + variantSample);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1/controlSample + 1/variantSample));
    const zScore = (p2 - p1) / se;
    
    // Two-tailed test
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    return {
      pValue,
      significant: pValue < 0.05,
      confidenceLevel: (1 - pValue) * 100
    };
  }

  /**
   * Normal cumulative distribution function
   */
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }
}

// Export singleton instance
export const experimentTracker = new ExperimentTracker();

// Convenience functions
export const trackSignup = experimentTracker.trackSignup.bind(experimentTracker);
export const trackSubscription = experimentTracker.trackSubscription.bind(experimentTracker);
export const trackAnalysisCompleted = experimentTracker.trackAnalysisCompleted.bind(experimentTracker);
export const trackEmailCapture = experimentTracker.trackEmailCapture.bind(experimentTracker);
export const trackCTAClick = experimentTracker.trackCTAClick.bind(experimentTracker);
export const trackPageView = experimentTracker.trackPageView.bind(experimentTracker);
