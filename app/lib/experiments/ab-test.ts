/**
 * Core A/B Testing Framework for TrueCheckIA
 * Provides experiment management, user assignment, and result tracking
 */

import { analytics } from '@/app/lib/analytics/events';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  trafficAllocation: number; // Percentage of users to include (0-100)
  startDate: Date;
  endDate?: Date;
  targetMetric: string;
  hypothesis: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  conditions?: ExperimentCondition[];
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number; // Traffic split percentage
  isControl: boolean;
  config: Record<string, any>;
}

export interface ExperimentCondition {
  type: 'url' | 'userAgent' | 'geolocation' | 'userType' | 'custom';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  value: string | string[];
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  assignedAt: Date;
  exposure: boolean; // Whether user was actually exposed to the variant
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metric: string;
  value: number;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

// Cookie keys for experiment persistence
const EXPERIMENT_COOKIE_PREFIX = 'exp_';
const SESSION_ID_COOKIE = 'truecheckia_session';
const EXPERIMENTS_STORAGE_KEY = 'truecheckia_experiments';

class ABTestManager {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, ExperimentAssignment> = new Map();

  constructor() {
    this.loadExperimentsFromStorage();
  }

  /**
   * Register an experiment
   */
  registerExperiment(experiment: Experiment): void {
    this.experiments.set(experiment.id, experiment);
    this.saveExperimentsToStorage();
  }

  /**
   * Get user assignment for an experiment
   */
  getAssignment(experimentId: string, userId?: string): ExperimentAssignment | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    const sessionId = this.getOrCreateSessionId();
    const assignmentKey = `${experimentId}_${userId || sessionId}`;

    // Check for existing assignment
    let assignment = this.assignments.get(assignmentKey);
    if (assignment) {
      return assignment;
    }

    // Check conditions
    if (!this.meetsConditions(experiment.conditions)) {
      return null;
    }

    // Check traffic allocation
    if (!this.shouldIncludeInExperiment(experiment.trafficAllocation, sessionId)) {
      return null;
    }

    // Assign variant
    const variant = this.assignVariant(experiment.variants, sessionId);
    assignment = {
      experimentId,
      variantId: variant.id,
      userId,
      sessionId,
      assignedAt: new Date(),
      exposure: false
    };

    this.assignments.set(assignmentKey, assignment);
    this.persistAssignment(assignment);

    // Track assignment
    analytics.track('experiment_assigned', {
      experimentId,
      variantId: variant.id,
      userId,
      sessionId
    });

    return assignment;
  }

  /**
   * Get variant for an experiment
   */
  getVariant(experimentId: string, userId?: string): Variant | null {
    const assignment = this.getAssignment(experimentId, userId);
    if (!assignment) return null;

    const experiment = this.experiments.get(experimentId);
    return experiment?.variants.find(v => v.id === assignment.variantId) || null;
  }

  /**
   * Track exposure (when user actually sees the variant)
   */
  trackExposure(experimentId: string, userId?: string): void {
    const sessionId = this.getOrCreateSessionId();
    const assignmentKey = `${experimentId}_${userId || sessionId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (assignment && !assignment.exposure) {
      assignment.exposure = true;
      this.assignments.set(assignmentKey, assignment);
      
      analytics.track('experiment_exposure', {
        experimentId,
        variantId: assignment.variantId,
        userId,
        sessionId
      });
    }
  }

  /**
   * Track conversion or metric
   */
  trackResult(experimentId: string, metric: string, value: number, metadata?: Record<string, any>, userId?: string): void {
    const assignment = this.getAssignment(experimentId, userId);
    if (!assignment || !assignment.exposure) return;

    const result: ExperimentResult = {
      experimentId,
      variantId: assignment.variantId,
      metric,
      value,
      timestamp: new Date(),
      userId,
      sessionId: assignment.sessionId,
      metadata
    };

    // Track in analytics
    analytics.track('experiment_conversion', {
      ...result,
      timestamp: result.timestamp.toISOString()
    });

    // Store locally for analysis
    this.storeResult(result);
  }

  /**
   * Get experiment configuration for a variant
   */
  getConfig(experimentId: string, userId?: string): Record<string, any> {
    const variant = this.getVariant(experimentId, userId);
    return variant?.config || {};
  }

  /**
   * Check if user is in experiment
   */
  isInExperiment(experimentId: string, userId?: string): boolean {
    return this.getAssignment(experimentId, userId) !== null;
  }

  /**
   * Check if user is in specific variant
   */
  isInVariant(experimentId: string, variantId: string, userId?: string): boolean {
    const assignment = this.getAssignment(experimentId, userId);
    return assignment?.variantId === variantId;
  }

  /**
   * Get all active experiments
   */
  getActiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(exp => exp.status === 'running');
  }

  // Private methods

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = this.getCookie(SESSION_ID_COOKIE);
    if (!sessionId) {
      sessionId = this.generateId();
      this.setCookie(SESSION_ID_COOKIE, sessionId, 30); // 30 days
    }
    return sessionId;
  }

  private meetsConditions(conditions?: ExperimentCondition[]): boolean {
    if (!conditions || conditions.length === 0) return true;
    if (typeof window === 'undefined') return false;

    return conditions.every(condition => {
      let testValue: string;
      
      switch (condition.type) {
        case 'url':
          testValue = window.location.href;
          break;
        case 'userAgent':
          testValue = navigator.userAgent;
          break;
        case 'geolocation':
          // Would need geolocation API
          return true;
        case 'userType':
          // Would check user authentication status
          return true;
        default:
          return true;
      }

      switch (condition.operator) {
        case 'equals':
          return testValue === condition.value;
        case 'contains':
          return testValue.includes(condition.value as string);
        case 'startsWith':
          return testValue.startsWith(condition.value as string);
        case 'endsWith':
          return testValue.endsWith(condition.value as string);
        case 'regex':
          return new RegExp(condition.value as string).test(testValue);
        default:
          return false;
      }
    });
  }

  private shouldIncludeInExperiment(trafficAllocation: number, sessionId: string): boolean {
    const hash = this.hashString(sessionId);
    return (hash % 100) < trafficAllocation;
  }

  private assignVariant(variants: Variant[], sessionId: string): Variant {
    const hash = this.hashString(sessionId + '_variant');
    const random = hash % 100;
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (random < cumulative) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return variants[0];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  private persistAssignment(assignment: ExperimentAssignment): void {
    const cookieName = `${EXPERIMENT_COOKIE_PREFIX}${assignment.experimentId}`;
    this.setCookie(cookieName, assignment.variantId, 30);
  }

  private loadExperimentsFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(EXPERIMENTS_STORAGE_KEY);
      if (stored) {
        const experiments = JSON.parse(stored) as Experiment[];
        experiments.forEach(exp => {
          exp.startDate = new Date(exp.startDate);
          if (exp.endDate) exp.endDate = new Date(exp.endDate);
          this.experiments.set(exp.id, exp);
        });
      }
    } catch (error) {
      console.warn('Failed to load experiments from storage:', error);
    }
  }

  private saveExperimentsToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const experiments = Array.from(this.experiments.values());
      localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(experiments));
    } catch (error) {
      console.warn('Failed to save experiments to storage:', error);
    }
  }

  private storeResult(result: ExperimentResult): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const key = `experiment_results_${result.experimentId}`;
      const stored = localStorage.getItem(key);
      const results = stored ? JSON.parse(stored) : [];
      results.push(result);
      localStorage.setItem(key, JSON.stringify(results));
    } catch (error) {
      console.warn('Failed to store experiment result:', error);
    }
  }
}

// Export singleton instance
export const abTest = new ABTestManager();

// Utility functions
export const createExperiment = (config: Omit<Experiment, 'id'>): Experiment => ({
  id: Math.random().toString(36).substr(2, 9),
  ...config
});

export const createVariant = (config: Omit<Variant, 'id'>): Variant => ({
  id: Math.random().toString(36).substr(2, 9),
  ...config
});
