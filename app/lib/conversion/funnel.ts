/**
 * Funnel Analysis System
 * Comprehensive funnel tracking, analysis, and optimization
 */

import { ConversionEvent, UserJourney } from './tracking';

export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  order: number;
  required: boolean;
  events: string[];
  conditions?: Array<{
    property: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  timeWindow?: number; // Maximum time to complete step (in milliseconds)
}

export interface FunnelAnalysis {
  step: FunnelStep;
  totalUsers: number;
  completedUsers: number;
  completionRate: number;
  dropoffUsers: number;
  dropoffRate: number;
  averageTimeToComplete: number;
  medianTimeToComplete: number;
  conversionValue: number;
  bottleneck: boolean;
}

export interface FunnelReport {
  funnel: {
    id: string;
    name: string;
    description: string;
    steps: FunnelStep[];
  };
  analysis: FunnelAnalysis[];
  overallConversionRate: number;
  totalUsers: number;
  totalConversions: number;
  totalRevenue: number;
  averageTimeToConvert: number;
  biggestDropoff: {
    step: FunnelStep;
    dropoffRate: number;
  } | null;
  recommendations: string[];
}

export interface CohortFunnelAnalysis {
  cohort: string;
  period: string;
  userCount: number;
  funnelAnalysis: FunnelAnalysis[];
  conversionRate: number;
  revenue: number;
}

class FunnelAnalyzer {
  private funnels: Map<string, {
    id: string;
    name: string;
    description: string;
    steps: FunnelStep[];
  }> = new Map();

  constructor() {
    this.initializeDefaultFunnels();
  }

  /**
   * Register a custom funnel
   */
  registerFunnel(
    id: string,
    name: string,
    description: string,
    steps: FunnelStep[]
  ): void {
    // Validate and sort steps by order
    const sortedSteps = steps.sort((a, b) => a.order - b.order);
    
    this.funnels.set(id, {
      id,
      name,
      description,
      steps: sortedSteps
    });
  }

  /**
   * Analyze funnel performance
   */
  analyzeFunnel(
    funnelId: string,
    journeys: UserJourney[],
    dateRange?: { start: Date; end: Date }
  ): FunnelReport {
    const funnel = this.funnels.get(funnelId);
    if (!funnel) {
      throw new Error(`Funnel '${funnelId}' not found`);
    }

    // Filter journeys by date range if provided
    let filteredJourneys = journeys;
    if (dateRange) {
      filteredJourneys = journeys.filter(journey => 
        journey.firstTouch >= dateRange.start && journey.firstTouch <= dateRange.end
      );
    }

    const stepAnalyses: FunnelAnalysis[] = [];
    let previousStepUsers = new Set(filteredJourneys.map(j => j.userId || j.sessionId));
    let totalRevenue = 0;
    const completionTimes: number[] = [];

    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const stepUsers = new Set<string>();
      const stepCompletionTimes: number[] = [];
      let stepRevenue = 0;

      filteredJourneys.forEach(journey => {
        const userId = journey.userId || journey.sessionId;
        
        // Check if user was in previous step (or this is first step)
        if (i === 0 || previousStepUsers.has(userId)) {
          const completed = this.hasCompletedStep(step, journey);
          
          if (completed) {
            stepUsers.add(userId);
            
            // Calculate time to complete step
            const completionTime = this.getStepCompletionTime(step, journey);
            if (completionTime !== null) {
              stepCompletionTimes.push(completionTime);
              
              // If this is the final step, track overall completion time
              if (i === funnel.steps.length - 1) {
                const totalTime = journey.lastTouch.getTime() - journey.firstTouch.getTime();
                completionTimes.push(totalTime);
                stepRevenue += journey.totalRevenue;
              }
            }
          }
        }
      });

      const totalUsers = previousStepUsers.size;
      const completedUsers = stepUsers.size;
      const completionRate = totalUsers > 0 ? completedUsers / totalUsers : 0;
      const dropoffUsers = totalUsers - completedUsers;
      const dropoffRate = totalUsers > 0 ? dropoffUsers / totalUsers : 0;
      
      const averageTimeToComplete = stepCompletionTimes.length > 0 
        ? stepCompletionTimes.reduce((a, b) => a + b, 0) / stepCompletionTimes.length 
        : 0;
      
      const sortedTimes = [...stepCompletionTimes].sort((a, b) => a - b);
      const medianTimeToComplete = sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length / 2)] 
        : 0;

      stepAnalyses.push({
        step,
        totalUsers,
        completedUsers,
        completionRate,
        dropoffUsers,
        dropoffRate,
        averageTimeToComplete,
        medianTimeToComplete,
        conversionValue: stepRevenue,
        bottleneck: false // Will be calculated later
      });

      previousStepUsers = stepUsers;
      totalRevenue += stepRevenue;
    }

    // Identify bottlenecks (steps with highest dropoff rates)
    if (stepAnalyses.length > 1) {
      const highestDropoff = Math.max(...stepAnalyses.map(s => s.dropoffRate));
      stepAnalyses.forEach(step => {
        step.bottleneck = step.dropoffRate === highestDropoff && step.dropoffRate > 0.3;
      });
    }

    // Calculate overall metrics
    const totalUsers = filteredJourneys.length;
    const totalConversions = stepAnalyses[stepAnalyses.length - 1]?.completedUsers || 0;
    const overallConversionRate = totalUsers > 0 ? totalConversions / totalUsers : 0;
    const averageTimeToConvert = completionTimes.length > 0 
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
      : 0;

    // Find biggest dropoff
    const biggestDropoff = stepAnalyses.length > 0 
      ? stepAnalyses.reduce((prev, current) => 
          current.dropoffRate > prev.dropoffRate ? current : prev
        )
      : null;

    // Generate recommendations
    const recommendations = this.generateRecommendations(stepAnalyses, overallConversionRate);

    return {
      funnel,
      analysis: stepAnalyses,
      overallConversionRate,
      totalUsers,
      totalConversions,
      totalRevenue,
      averageTimeToConvert,
      biggestDropoff: biggestDropoff ? {
        step: biggestDropoff.step,
        dropoffRate: biggestDropoff.dropoffRate
      } : null,
      recommendations
    };
  }

  /**
   * Analyze funnel by cohorts (e.g., by signup date, traffic source)
   */
  analyzeFunnelByCohort(
    funnelId: string,
    journeys: UserJourney[],
    cohortBy: 'signup_date' | 'traffic_source' | 'campaign' | 'device_type',
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): CohortFunnelAnalysis[] {
    const cohortGroups = this.groupJourneysByCohort(journeys, cohortBy, period);
    
    return Array.from(cohortGroups.entries()).map(([cohort, cohortJourneys]) => {
      const funnelReport = this.analyzeFunnel(funnelId, cohortJourneys);
      
      return {
        cohort,
        period,
        userCount: cohortJourneys.length,
        funnelAnalysis: funnelReport.analysis,
        conversionRate: funnelReport.overallConversionRate,
        revenue: funnelReport.totalRevenue
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  }

  /**
   * Get funnel visualization data
   */
  getFunnelVisualization(funnelReport: FunnelReport): {
    steps: Array<{
      name: string;
      users: number;
      percentage: number;
      dropoff: number;
      isBottleneck: boolean;
    }>;
    maxUsers: number;
  } {
    const maxUsers = funnelReport.totalUsers;
    
    const steps = funnelReport.analysis.map((analysis, index) => ({
      name: analysis.step.name,
      users: analysis.completedUsers,
      percentage: maxUsers > 0 ? (analysis.completedUsers / maxUsers) * 100 : 0,
      dropoff: analysis.dropoffUsers,
      isBottleneck: analysis.bottleneck
    }));

    return {
      steps,
      maxUsers
    };
  }

  /**
   * Compare two funnels or time periods
   */
  compareFunnels(
    report1: FunnelReport,
    report2: FunnelReport
  ): {
    conversionRateChange: number;
    revenueChange: number;
    stepComparisons: Array<{
      stepName: string;
      completionRateChange: number;
      dropoffRateChange: number;
      significantChange: boolean;
    }>;
  } {
    const conversionRateChange = report2.overallConversionRate - report1.overallConversionRate;
    const revenueChange = report2.totalRevenue - report1.totalRevenue;
    
    const stepComparisons = report1.analysis.map((step1, index) => {
      const step2 = report2.analysis[index];
      const completionRateChange = step2.completionRate - step1.completionRate;
      const dropoffRateChange = step2.dropoffRate - step1.dropoffRate;
      const significantChange = Math.abs(completionRateChange) > 0.05; // 5% threshold
      
      return {
        stepName: step1.step.name,
        completionRateChange,
        dropoffRateChange,
        significantChange
      };
    });

    return {
      conversionRateChange,
      revenueChange,
      stepComparisons
    };
  }

  /**
   * Check if user has completed a funnel step
   */
  private hasCompletedStep(step: FunnelStep, journey: UserJourney): boolean {
    // Check if any of the step events occurred
    const hasRequiredEvent = journey.events.some(event => 
      step.events.includes(event.eventName)
    );
    
    if (!hasRequiredEvent) return false;
    
    // Check additional conditions if any
    if (step.conditions) {
      return step.conditions.every(condition => 
        journey.events.some(event => 
          this.eventMeetsCondition(event, condition)
        )
      );
    }
    
    return true;
  }

  /**
   * Get time taken to complete a step
   */
  private getStepCompletionTime(step: FunnelStep, journey: UserJourney): number | null {
    const stepEvents = journey.events.filter(event => 
      step.events.includes(event.eventName)
    );
    
    if (stepEvents.length === 0) return null;
    
    // Use the first occurrence of the step event
    const firstStepEvent = stepEvents.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )[0];
    
    return firstStepEvent.timestamp.getTime() - journey.firstTouch.getTime();
  }

  /**
   * Check if event meets a condition
   */
  private eventMeetsCondition(
    event: ConversionEvent,
    condition: { property: string; operator: string; value: any }
  ): boolean {
    const propertyValue = event.properties[condition.property];
    
    switch (condition.operator) {
      case 'equals':
        return propertyValue === condition.value;
      case 'contains':
        return String(propertyValue).includes(String(condition.value));
      case 'greater_than':
        return Number(propertyValue) > Number(condition.value);
      case 'less_than':
        return Number(propertyValue) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Group journeys by cohort
   */
  private groupJourneysByCohort(
    journeys: UserJourney[],
    cohortBy: string,
    period: string
  ): Map<string, UserJourney[]> {
    const cohorts = new Map<string, UserJourney[]>();
    
    journeys.forEach(journey => {
      let cohortKey: string;
      
      switch (cohortBy) {
        case 'signup_date':
          cohortKey = this.formatDateByCohort(journey.firstTouch, period);
          break;
        case 'traffic_source':
          cohortKey = journey.attribution.source;
          break;
        case 'campaign':
          cohortKey = journey.attribution.campaign || 'No Campaign';
          break;
        case 'device_type':
          // Would need to extract from user agent
          cohortKey = 'Unknown Device';
          break;
        default:
          cohortKey = 'Default';
      }
      
      const cohortJourneys = cohorts.get(cohortKey) || [];
      cohortJourneys.push(journey);
      cohorts.set(cohortKey, cohortJourneys);
    });
    
    return cohorts;
  }

  /**
   * Format date by cohort period
   */
  private formatDateByCohort(date: Date, period: string): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `Week of ${weekStart.toISOString().split('T')[0]}`;
      case 'monthly':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    stepAnalyses: FunnelAnalysis[],
    overallConversionRate: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Low overall conversion rate
    if (overallConversionRate < 0.05) {
      recommendations.push('Overall conversion rate is very low. Consider A/B testing your entire funnel.');
    }
    
    // High dropoff rates
    stepAnalyses.forEach((analysis, index) => {
      if (analysis.dropoffRate > 0.5) {
        recommendations.push(`Step "${analysis.step.name}" has a high dropoff rate (${Math.round(analysis.dropoffRate * 100)}%). Consider simplifying this step or adding guidance.`);
      }
      
      if (analysis.bottleneck) {
        recommendations.push(`Step "${analysis.step.name}" is a bottleneck. Focus optimization efforts here for maximum impact.`);
      }
      
      // Long completion times
      if (analysis.averageTimeToComplete > 300000) { // 5 minutes
        recommendations.push(`Users are taking too long to complete "${analysis.step.name}". Consider reducing friction or adding progress indicators.`);
      }
    });
    
    // First step issues
    if (stepAnalyses.length > 0 && stepAnalyses[0].dropoffRate > 0.3) {
      recommendations.push('High dropoff at the first step suggests landing page or messaging issues.');
    }
    
    // Final step issues
    if (stepAnalyses.length > 1) {
      const finalStep = stepAnalyses[stepAnalyses.length - 1];
      if (finalStep.dropoffRate > 0.2) {
        recommendations.push('High dropoff at the final step suggests checkout or completion issues.');
      }
    }
    
    return recommendations;
  }

  /**
   * Initialize default funnels for TrueCheckIA
   */
  private initializeDefaultFunnels(): void {
    // Registration funnel
    this.registerFunnel(
      'registration',
      'User Registration Funnel',
      'Track user journey from landing to account creation',
      [
        {
          id: 'landing',
          name: 'Landing Page Visit',
          description: 'User visits the landing page',
          order: 1,
          required: true,
          events: ['page_view'],
          conditions: [
            { property: 'path', operator: 'equals', value: '/' }
          ]
        },
        {
          id: 'signup_click',
          name: 'Signup CTA Click',
          description: 'User clicks on signup CTA',
          order: 2,
          required: false,
          events: ['cta_click'],
          conditions: [
            { property: 'ctaText', operator: 'contains', value: 'Sign Up' }
          ]
        },
        {
          id: 'signup_form',
          name: 'Signup Form View',
          description: 'User views the signup form',
          order: 3,
          required: true,
          events: ['page_view'],
          conditions: [
            { property: 'path', operator: 'contains', value: '/register' }
          ]
        },
        {
          id: 'account_created',
          name: 'Account Created',
          description: 'User successfully creates an account',
          order: 4,
          required: true,
          events: ['user_signup']
        }
      ]
    );

    // Subscription funnel
    this.registerFunnel(
      'subscription',
      'Subscription Funnel',
      'Track user journey from registration to paid subscription',
      [
        {
          id: 'registration',
          name: 'Account Registration',
          description: 'User creates an account',
          order: 1,
          required: true,
          events: ['user_signup']
        },
        {
          id: 'first_analysis',
          name: 'First Analysis',
          description: 'User completes their first analysis',
          order: 2,
          required: false,
          events: ['analysis_completed']
        },
        {
          id: 'pricing_view',
          name: 'Pricing Page View',
          description: 'User views pricing page',
          order: 3,
          required: false,
          events: ['page_view'],
          conditions: [
            { property: 'path', operator: 'contains', value: '/pricing' }
          ]
        },
        {
          id: 'subscription',
          name: 'Subscription Purchase',
          description: 'User purchases a subscription',
          order: 4,
          required: true,
          events: ['subscription']
        }
      ]
    );

    // Analysis funnel
    this.registerFunnel(
      'analysis',
      'Analysis Completion Funnel',
      'Track user journey through the analysis process',
      [
        {
          id: 'analysis_start',
          name: 'Analysis Started',
          description: 'User starts an analysis',
          order: 1,
          required: true,
          events: ['analysis_started']
        },
        {
          id: 'content_input',
          name: 'Content Inputted',
          description: 'User inputs content for analysis',
          order: 2,
          required: true,
          events: ['content_submitted']
        },
        {
          id: 'analysis_complete',
          name: 'Analysis Completed',
          description: 'Analysis results are shown',
          order: 3,
          required: true,
          events: ['analysis_completed']
        },
        {
          id: 'results_viewed',
          name: 'Results Viewed',
          description: 'User views detailed results',
          order: 4,
          required: false,
          events: ['results_viewed']
        }
      ]
    );
  }
}

// Export singleton
export const funnelAnalyzer = new FunnelAnalyzer();
