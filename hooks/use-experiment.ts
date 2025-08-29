/**
 * React Hook for A/B Testing
 * Provides easy access to experiment variants and tracking
 */

import { useEffect, useState, useCallback } from 'react';
import { abTest, Variant, ExperimentAssignment } from '@/lib/experiments/ab-test';
import { experimentTracker } from '@/lib/experiments/tracking';
import { useAuth } from './useAuth';

interface UseExperimentOptions {
  exposureCallback?: (variantId: string) => void;
  trackExposure?: boolean;
}

interface UseExperimentReturn {
  variant: Variant | null;
  config: Record<string, any>;
  isLoading: boolean;
  isInExperiment: boolean;
  variantId: string | null;
  trackConversion: (metric: string, value?: number, metadata?: Record<string, any>) => void;
}

/**
 * Hook to get experiment variant and track exposure
 */
export function useExperiment(
  experimentId: string, 
  options: UseExperimentOptions = {}
): UseExperimentReturn {
  const { user } = useAuth();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<ExperimentAssignment | null>(null);

  const { exposureCallback, trackExposure = true } = options;

  useEffect(() => {
    const userId = user?.id;
    const userAssignment = abTest.getAssignment(experimentId, userId);
    
    if (userAssignment) {
      const userVariant = abTest.getVariant(experimentId, userId);
      const variantConfig = abTest.getConfig(experimentId, userId);
      
      setAssignment(userAssignment);
      setVariant(userVariant);
      setConfig(variantConfig);
      
      // Track exposure if enabled and user is assigned
      if (trackExposure && userVariant) {
        abTest.trackExposure(experimentId, userId);
        
        // Call exposure callback if provided
        if (exposureCallback) {
          exposureCallback(userVariant.id);
        }
      }
    }
    
    setIsLoading(false);
  }, [experimentId, user?.id, exposureCallback, trackExposure]);

  const trackConversion = useCallback((metric: string, value = 1, metadata?: Record<string, any>) => {
    if (assignment) {
      abTest.trackResult(experimentId, metric, value, metadata, user?.id);
    }
  }, [experimentId, assignment, user?.id]);

  return {
    variant,
    config,
    isLoading,
    isInExperiment: assignment !== null,
    variantId: variant?.id || null,
    trackConversion
  };
}

/**
 * Hook for feature flags (simple boolean experiments)
 */
export function useFeatureFlag(flagName: string, defaultValue = false): boolean {
  const { config, isLoading } = useExperiment(flagName);
  
  if (isLoading) return defaultValue;
  return config.enabled ?? defaultValue;
}

/**
 * Hook for exit intent popup experiment
 */
export function useExitIntentPopup() {
  const experiment = useExperiment('exitIntentExperiment');
  
  const showPopup = useCallback((trigger: 'exit_intent' | 'time_based' | 'scroll_based') => {
    if (experiment.config.showPopup) {
      experimentTracker.trackExitIntentShown(experiment.config.popupType, experiment.variant?.id);
      return true;
    }
    return false;
  }, [experiment.config, experiment.variant]);

  const trackConversion = useCallback((action: 'email_signup' | 'close' | 'cta_click') => {
    if (experiment.isInExperiment) {
      experimentTracker.trackExitIntentConversion(experiment.config.popupType, action, experiment.variant?.id);
      experiment.trackConversion('email_signup', action === 'email_signup' ? 1 : 0);
    }
  }, [experiment]);

  return {
    ...experiment,
    showPopup,
    trackConversion,
    popupConfig: experiment.config
  };
}

/**
 * Hook for social proof experiment
 */
export function useSocialProof() {
  const experiment = useExperiment('socialProofExperiment');
  
  const trackView = useCallback((location: string) => {
    if (experiment.isInExperiment) {
      experimentTracker.trackSocialProofView(experiment.config.type, location, experiment.variant?.id);
    }
  }, [experiment]);

  const trackClick = useCallback((location: string) => {
    if (experiment.isInExperiment) {
      experimentTracker.trackSocialProofClick(experiment.config.type, location, experiment.variant?.id);
      experiment.trackConversion('signup_rate', 1);
    }
  }, [experiment]);

  return {
    ...experiment,
    trackView,
    trackClick,
    socialProofConfig: experiment.config
  };
}

/**
 * Hook for CTA button optimization
 */
export function useCTAExperiment(ctaId: string) {
  const experiment = useExperiment('ctaButtonExperiment');
  const { user } = useAuth();
  
  const trackView = useCallback(() => {
    if (experiment.isInExperiment) {
      experimentTracker.trackCTAView(ctaId, experiment.config.buttonText, 'experiment', user?.id);
    }
  }, [experiment, ctaId, user?.id]);

  const trackClick = useCallback(() => {
    if (experiment.isInExperiment) {
      experimentTracker.trackCTAClick(ctaId, experiment.config.buttonText, 'experiment', user?.id);
      experiment.trackConversion('cta_click_rate', 1);
    }
  }, [experiment, ctaId, user?.id]);

  return {
    ...experiment,
    trackView,
    trackClick,
    buttonConfig: experiment.config
  };
}

/**
 * Hook for pricing page experiment
 */
export function usePricingExperiment() {
  const experiment = useExperiment('pricingPageExperiment');
  
  const trackPlanView = useCallback((plan: string) => {
    if (experiment.isInExperiment) {
      experiment.trackConversion('plan_view', 1, { plan });
    }
  }, [experiment]);

  const trackPlanSelect = useCallback((plan: string) => {
    if (experiment.isInExperiment) {
      experiment.trackConversion('subscription_conversion', 1, { plan });
    }
  }, [experiment]);

  return {
    ...experiment,
    trackPlanView,
    trackPlanSelect,
    pricingConfig: experiment.config
  };
}

/**
 * Hook for onboarding experiment
 */
export function useOnboardingExperiment() {
  const experiment = useExperiment('onboardingExperiment');
  
  const trackStep = useCallback((step: number, completed: boolean) => {
    if (experiment.isInExperiment) {
      experiment.trackConversion('onboarding_step', completed ? 1 : 0, { step });
    }
  }, [experiment]);

  const trackCompletion = useCallback(() => {
    if (experiment.isInExperiment) {
      experiment.trackConversion('user_activation', 1);
    }
  }, [experiment]);

  return {
    ...experiment,
    trackStep,
    trackCompletion,
    onboardingConfig: experiment.config
  };
}

/**
 * Hook to track general experiment events
 */
export function useExperimentTracking() {
  const { user } = useAuth();
  
  const trackPageView = useCallback((path: string) => {
    experimentTracker.trackPageView(path, user?.id);
  }, [user?.id]);

  const trackSignup = useCallback((method: 'email' | 'google' = 'email', properties?: Record<string, any>) => {
    if (user?.id) {
      experimentTracker.trackSignup(user.id, method, properties);
    }
  }, [user?.id]);

  const trackSubscription = useCallback((plan: string, amount: number, currency = 'USD') => {
    if (user?.id) {
      experimentTracker.trackSubscription(user.id, plan, amount, currency);
    }
  }, [user?.id]);

  const trackAnalysis = useCallback((analysisType?: string, creditsUsed?: number) => {
    experimentTracker.trackAnalysisCompleted(user?.id, analysisType, creditsUsed);
  }, [user?.id]);

  const trackFirstAnalysis = useCallback(() => {
    if (user?.id) {
      experimentTracker.trackFirstAnalysis(user.id);
    }
  }, [user?.id]);

  const trackEmailCapture = useCallback((email: string, source: string) => {
    experimentTracker.trackEmailCapture(email, source, user?.id);
  }, [user?.id]);

  return {
    trackPageView,
    trackSignup,
    trackSubscription,
    trackAnalysis,
    trackFirstAnalysis,
    trackEmailCapture
  };
}

/**
 * Hook to manage multiple experiments
 */
export function useExperiments(experimentIds: string[]) {
  const [experiments, setExperiments] = useState<Record<string, UseExperimentReturn>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const experimentData: Record<string, UseExperimentReturn> = {};
    let loadingCount = experimentIds.length;

    experimentIds.forEach(id => {
      // This would need to be implemented differently in a real scenario
      // For now, we'll create a simplified version
      const assignment = abTest.getAssignment(id);
      const variant = abTest.getVariant(id);
      const config = abTest.getConfig(id);
      
      experimentData[id] = {
        variant,
        config,
        isLoading: false,
        isInExperiment: assignment !== null,
        variantId: variant?.id || null,
        trackConversion: (metric: string, value = 1, metadata?: Record<string, any>) => {
          abTest.trackResult(id, metric, value, metadata);
        }
      };
      
      loadingCount--;
      if (loadingCount === 0) {
        setIsLoading(false);
      }
    });

    setExperiments(experimentData);
  }, [experimentIds]);

  return {
    experiments,
    isLoading,
    getExperiment: (id: string) => experiments[id]
  };
}
