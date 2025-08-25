/**
 * Experiment Setup and Registration
 * Initializes all experiments and registers them with the A/B testing system
 */

import { abTest } from '../experiments/ab-test';
import { allExperiments } from '../experiments/variants';

/**
 * Initialize and register all conversion optimization experiments
 */
export function initializeExperiments(): void {
  // Register all experiments
  allExperiments.forEach(experiment => {
    abTest.registerExperiment(experiment);
  });

  console.log(`Initialized ${allExperiments.length} conversion experiments:`);
  allExperiments.forEach(exp => {
    console.log(`- ${exp.name}: ${exp.variants.length} variants`);
  });
}

/**
 * Get experiment status for debugging
 */
export function getExperimentStatus() {
  const active = abTest.getActiveExperiments();
  
  return {
    totalExperiments: allExperiments.length,
    activeExperiments: active.length,
    experiments: active.map(exp => ({
      id: exp.id,
      name: exp.name,
      status: exp.status,
      variants: exp.variants.length,
      trafficAllocation: exp.trafficAllocation
    }))
  };
}

/**
 * Force experiment assignment for testing (development only)
 */
export function forceExperimentAssignment(
  experimentId: string,
  variantId: string,
  userId?: string
): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('forceExperimentAssignment only available in development');
    return;
  }
  
  // This would be implemented with a development-only override
  console.log(`Forcing assignment: ${experimentId} -> ${variantId}`);
}

/**
 * Export experiment configurations for easy access
 */
export const EXPERIMENT_IDS = {
  EXIT_INTENT: 'exitIntentExperiment',
  SOCIAL_PROOF: 'socialProofExperiment',
  CTA_OPTIMIZATION: 'ctaButtonExperiment',
  PRICING_PAGE: 'pricingPageExperiment',
  ONBOARDING: 'onboardingExperiment'
} as const;

export const CONVERSION_GOALS = {
  EMAIL_SIGNUP: 'email_signup',
  USER_REGISTRATION: 'user_signup',
  SUBSCRIPTION: 'subscription_created',
  TRIAL_START: 'trial_started',
  FIRST_ANALYSIS: 'first_analysis_completed',
  CTA_CLICK: 'cta_click_rate',
  FORM_SUBMIT: 'form_submit'
} as const;

/**
 * Quick setup function for common conversion scenarios
 */
export function setupConversionTracking() {
  // Initialize experiments
  initializeExperiments();
  
  // Set up global event listeners for common actions
  if (typeof window !== 'undefined') {
    // Track all form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const formName = form.name || form.id || 'unknown_form';
      
      // Track form submission in experiments
      abTest.getActiveExperiments().forEach(exp => {
        abTest.trackResult(exp.id, 'form_submit', 1, {
          formName,
          timestamp: new Date().toISOString()
        });
      });
    });
    
    // Track CTA clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a[href]') as HTMLElement;
      
      if (button && (button.textContent?.toLowerCase().includes('sign up') || 
                     button.textContent?.toLowerCase().includes('start') ||
                     button.textContent?.toLowerCase().includes('get started'))) {
        // Track CTA click in experiments
        abTest.getActiveExperiments().forEach(exp => {
          abTest.trackResult(exp.id, 'cta_click_rate', 1, {
            buttonText: button.textContent,
            timestamp: new Date().toISOString()
          });
        });
      }
    });
  }
}

/**
 * Development helpers
 */
export const DevHelpers = {
  /**
   * Log current experiment assignments
   */
  logAssignments: (userId?: string) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('Current Experiment Assignments');
    allExperiments.forEach(exp => {
      const assignment = abTest.getAssignment(exp.id, userId);
      if (assignment) {
        const variant = abTest.getVariant(exp.id, userId);
        console.log(`${exp.name}: ${variant?.name || 'Unknown'} (${assignment.variantId})`);
      } else {
        console.log(`${exp.name}: Not assigned`);
      }
    });
    console.groupEnd();
  },
  
  /**
   * Clear all experiment data
   */
  clearExperimentData: () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    localStorage.removeItem('truecheckia_experiments');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('exp_') || key.startsWith('experiment_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared all experiment data');
  },
  
  /**
   * Simulate conversion events
   */
  simulateConversion: (goal: string, value = 1) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    allExperiments.forEach(exp => {
      abTest.trackResult(exp.id, goal, value, {
        simulated: true,
        timestamp: new Date().toISOString()
      });
    });
    console.log(`Simulated conversion: ${goal} = ${value}`);
  }
};
