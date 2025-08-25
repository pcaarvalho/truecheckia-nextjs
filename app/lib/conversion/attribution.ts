/**
 * Attribution Analysis System
 * Provides detailed attribution modeling and customer journey analysis
 */

import { ConversionEvent, AttributionData, UserJourney } from './tracking';

export interface TouchpointAnalysis {
  touchpoint: ConversionEvent;
  position: 'first' | 'middle' | 'last' | 'only';
  attribution: {
    firstTouch: number;
    lastTouch: number;
    linear: number;
    timeDecay: number;
    positionBased: number;
  };
}

export interface AttributionModel {
  name: string;
  description: string;
  calculate: (touchpoints: ConversionEvent[], conversionValue: number) => number[];
}

export interface ChannelPerformance {
  channel: string;
  touchpoints: number;
  conversions: number;
  revenue: number;
  costPerAcquisition: number;
  returnOnAdSpend: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface CampaignPerformance {
  campaign: string;
  source: string;
  medium: string;
  clicks: number;
  impressions: number;
  conversions: number;
  revenue: number;
  cost: number;
  clickThroughRate: number;
  conversionRate: number;
  costPerClick: number;
  costPerAcquisition: number;
  returnOnAdSpend: number;
}

class AttributionAnalyzer {
  private models: Map<string, AttributionModel> = new Map();

  constructor() {
    this.initializeModels();
  }

  /**
   * Analyze touchpoint attribution for a user journey
   */
  analyzeTouchpoints(
    journey: UserJourney,
    conversionValue: number,
    modelName: string = 'linear'
  ): TouchpointAnalysis[] {
    const touchpoints = journey.events.filter(event => 
      this.isTouchpointEvent(event)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (touchpoints.length === 0) return [];

    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Attribution model '${modelName}' not found`);
    }

    const attributionValues = model.calculate(touchpoints, conversionValue);

    return touchpoints.map((touchpoint, index) => {
      let position: 'first' | 'middle' | 'last' | 'only';
      
      if (touchpoints.length === 1) {
        position = 'only';
      } else if (index === 0) {
        position = 'first';
      } else if (index === touchpoints.length - 1) {
        position = 'last';
      } else {
        position = 'middle';
      }

      // Calculate attribution for all models
      const firstTouchValues = this.models.get('firstTouch')!.calculate(touchpoints, conversionValue);
      const lastTouchValues = this.models.get('lastTouch')!.calculate(touchpoints, conversionValue);
      const linearValues = this.models.get('linear')!.calculate(touchpoints, conversionValue);
      const timeDecayValues = this.models.get('timeDecay')!.calculate(touchpoints, conversionValue);
      const positionBasedValues = this.models.get('positionBased')!.calculate(touchpoints, conversionValue);

      return {
        touchpoint,
        position,
        attribution: {
          firstTouch: firstTouchValues[index],
          lastTouch: lastTouchValues[index],
          linear: linearValues[index],
          timeDecay: timeDecayValues[index],
          positionBased: positionBasedValues[index]
        }
      };
    });
  }

  /**
   * Analyze channel performance across all journeys
   */
  analyzeChannelPerformance(
    journeys: UserJourney[],
    adSpendData?: Map<string, number>
  ): ChannelPerformance[] {
    const channelStats = new Map<string, {
      touchpoints: number;
      conversions: number;
      revenue: number;
      orders: ConversionEvent[];
    }>();

    journeys.forEach(journey => {
      const channels = new Set<string>();
      
      journey.events.forEach(event => {
        if (this.isTouchpointEvent(event)) {
          const channel = this.getChannelFromAttribution(journey.attribution);
          channels.add(channel);
        }
      });

      const hasConversion = journey.conversionGoals.length > 0;
      const revenue = journey.totalRevenue;

      channels.forEach(channel => {
        const stats = channelStats.get(channel) || {
          touchpoints: 0,
          conversions: 0,
          revenue: 0,
          orders: []
        };
        
        stats.touchpoints += 1;
        if (hasConversion) {
          stats.conversions += 1;
          stats.revenue += revenue;
          
          // Find conversion events
          const conversionEvents = journey.events.filter(e => e.eventName === 'conversion');
          stats.orders.push(...conversionEvents);
        }
        
        channelStats.set(channel, stats);
      });
    });

    return Array.from(channelStats.entries()).map(([channel, stats]) => {
      const adSpend = adSpendData?.get(channel) || 0;
      const conversionRate = stats.touchpoints > 0 ? stats.conversions / stats.touchpoints : 0;
      const averageOrderValue = stats.orders.length > 0 ? stats.revenue / stats.orders.length : 0;
      const costPerAcquisition = stats.conversions > 0 ? adSpend / stats.conversions : 0;
      const returnOnAdSpend = adSpend > 0 ? stats.revenue / adSpend : 0;

      return {
        channel,
        touchpoints: stats.touchpoints,
        conversions: stats.conversions,
        revenue: stats.revenue,
        costPerAcquisition,
        returnOnAdSpend,
        conversionRate,
        averageOrderValue
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Analyze campaign performance
   */
  analyzeCampaignPerformance(
    journeys: UserJourney[],
    campaignData?: Map<string, { impressions: number; clicks: number; cost: number }>
  ): CampaignPerformance[] {
    const campaignStats = new Map<string, {
      conversions: number;
      revenue: number;
      attribution: AttributionData;
    }>();

    journeys.forEach(journey => {
      if (!journey.attribution.campaign) return;
      
      const campaignKey = `${journey.attribution.source}-${journey.attribution.campaign}`;
      const hasConversion = journey.conversionGoals.length > 0;
      
      if (hasConversion) {
        const stats = campaignStats.get(campaignKey) || {
          conversions: 0,
          revenue: 0,
          attribution: journey.attribution
        };
        
        stats.conversions += 1;
        stats.revenue += journey.totalRevenue;
        
        campaignStats.set(campaignKey, stats);
      }
    });

    return Array.from(campaignStats.entries()).map(([campaignKey, stats]) => {
      const campaign = stats.attribution.campaign!;
      const source = stats.attribution.source;
      const medium = stats.attribution.medium;
      
      const externalData = campaignData?.get(campaignKey) || {
        impressions: 0,
        clicks: 0,
        cost: 0
      };
      
      const clickThroughRate = externalData.impressions > 0 
        ? externalData.clicks / externalData.impressions 
        : 0;
      
      const conversionRate = externalData.clicks > 0 
        ? stats.conversions / externalData.clicks 
        : 0;
      
      const costPerClick = externalData.clicks > 0 
        ? externalData.cost / externalData.clicks 
        : 0;
      
      const costPerAcquisition = stats.conversions > 0 
        ? externalData.cost / stats.conversions 
        : 0;
      
      const returnOnAdSpend = externalData.cost > 0 
        ? stats.revenue / externalData.cost 
        : 0;

      return {
        campaign,
        source,
        medium,
        clicks: externalData.clicks,
        impressions: externalData.impressions,
        conversions: stats.conversions,
        revenue: stats.revenue,
        cost: externalData.cost,
        clickThroughRate,
        conversionRate,
        costPerClick,
        costPerAcquisition,
        returnOnAdSpend
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Generate customer journey visualization data
   */
  generateJourneyVisualization(journey: UserJourney): {
    steps: Array<{
      event: ConversionEvent;
      stepType: 'touchpoint' | 'engagement' | 'conversion';
      timeSinceFirst: number;
      channel: string;
      page: string;
    }>;
    duration: number;
    touchpoints: number;
    conversions: number;
  } {
    const firstEvent = journey.events[0];
    const steps = journey.events.map(event => {
      const timeSinceFirst = event.timestamp.getTime() - firstEvent.timestamp.getTime();
      
      let stepType: 'touchpoint' | 'engagement' | 'conversion';
      if (event.eventName === 'conversion') {
        stepType = 'conversion';
      } else if (this.isTouchpointEvent(event)) {
        stepType = 'touchpoint';
      } else {
        stepType = 'engagement';
      }
      
      const channel = this.getChannelFromEvent(event);
      const page = event.properties.path || event.properties.location || 'Unknown';
      
      return {
        event,
        stepType,
        timeSinceFirst,
        channel,
        page
      };
    });

    const duration = journey.lastTouch.getTime() - journey.firstTouch.getTime();
    const touchpoints = steps.filter(s => s.stepType === 'touchpoint').length;
    const conversions = steps.filter(s => s.stepType === 'conversion').length;

    return {
      steps,
      duration,
      touchpoints,
      conversions
    };
  }

  /**
   * Calculate conversion path analysis
   */
  analyzeConversionPaths(journeys: UserJourney[]): {
    path: string;
    frequency: number;
    conversions: number;
    conversionRate: number;
    averageRevenue: number;
  }[] {
    const pathStats = new Map<string, {
      frequency: number;
      conversions: number;
      totalRevenue: number;
    }>();

    journeys.forEach(journey => {
      const touchpoints = journey.events
        .filter(e => this.isTouchpointEvent(e))
        .map(e => this.getChannelFromEvent(e));
      
      const path = touchpoints.join(' > ');
      const hasConversion = journey.conversionGoals.length > 0;
      
      const stats = pathStats.get(path) || {
        frequency: 0,
        conversions: 0,
        totalRevenue: 0
      };
      
      stats.frequency += 1;
      if (hasConversion) {
        stats.conversions += 1;
        stats.totalRevenue += journey.totalRevenue;
      }
      
      pathStats.set(path, stats);
    });

    return Array.from(pathStats.entries())
      .map(([path, stats]) => ({
        path,
        frequency: stats.frequency,
        conversions: stats.conversions,
        conversionRate: stats.frequency > 0 ? stats.conversions / stats.frequency : 0,
        averageRevenue: stats.conversions > 0 ? stats.totalRevenue / stats.conversions : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Top 20 paths
  }

  /**
   * Initialize attribution models
   */
  private initializeModels(): void {
    // First-touch attribution
    this.models.set('firstTouch', {
      name: 'First Touch',
      description: 'Gives 100% credit to the first touchpoint',
      calculate: (touchpoints: ConversionEvent[], conversionValue: number) => {
        const values = new Array(touchpoints.length).fill(0);
        if (touchpoints.length > 0) {
          values[0] = conversionValue;
        }
        return values;
      }
    });

    // Last-touch attribution
    this.models.set('lastTouch', {
      name: 'Last Touch',
      description: 'Gives 100% credit to the last touchpoint',
      calculate: (touchpoints: ConversionEvent[], conversionValue: number) => {
        const values = new Array(touchpoints.length).fill(0);
        if (touchpoints.length > 0) {
          values[touchpoints.length - 1] = conversionValue;
        }
        return values;
      }
    });

    // Linear attribution
    this.models.set('linear', {
      name: 'Linear',
      description: 'Distributes credit equally across all touchpoints',
      calculate: (touchpoints: ConversionEvent[], conversionValue: number) => {
        const valuePerTouch = touchpoints.length > 0 ? conversionValue / touchpoints.length : 0;
        return new Array(touchpoints.length).fill(valuePerTouch);
      }
    });

    // Time decay attribution
    this.models.set('timeDecay', {
      name: 'Time Decay',
      description: 'Gives more credit to touchpoints closer to conversion',
      calculate: (touchpoints: ConversionEvent[], conversionValue: number) => {
        if (touchpoints.length === 0) return [];
        if (touchpoints.length === 1) return [conversionValue];
        
        const halfLife = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const conversionTime = Math.max(...touchpoints.map(t => t.timestamp.getTime()));
        
        let totalWeight = 0;
        const weights = touchpoints.map(touchpoint => {
          const timeDiff = conversionTime - touchpoint.timestamp.getTime();
          const weight = Math.pow(0.5, timeDiff / halfLife);
          totalWeight += weight;
          return weight;
        });
        
        return weights.map(weight => (weight / totalWeight) * conversionValue);
      }
    });

    // Position-based attribution (40% first, 40% last, 20% middle)
    this.models.set('positionBased', {
      name: 'Position Based',
      description: 'Gives 40% to first and last touchpoints, 20% to middle',
      calculate: (touchpoints: ConversionEvent[], conversionValue: number) => {
        if (touchpoints.length === 0) return [];
        if (touchpoints.length === 1) return [conversionValue];
        if (touchpoints.length === 2) return [conversionValue * 0.5, conversionValue * 0.5];
        
        const values = new Array(touchpoints.length).fill(0);
        const middleValue = touchpoints.length > 2 ? (0.2 * conversionValue) / (touchpoints.length - 2) : 0;
        
        values[0] = 0.4 * conversionValue; // First touch
        values[touchpoints.length - 1] = 0.4 * conversionValue; // Last touch
        
        // Middle touches
        for (let i = 1; i < touchpoints.length - 1; i++) {
          values[i] = middleValue;
        }
        
        return values;
      }
    });
  }

  /**
   * Check if event is a touchpoint
   */
  private isTouchpointEvent(event: ConversionEvent): boolean {
    return ['page_view', 'cta_click', 'ad_click', 'email_open', 'social_click'].includes(event.eventName);
  }

  /**
   * Get channel from attribution data
   */
  private getChannelFromAttribution(attribution: AttributionData): string {
    if (attribution.medium === 'cpc') {
      return `${attribution.source} Ads`;
    } else if (attribution.medium === 'social') {
      return `${attribution.source} Social`;
    } else if (attribution.medium === 'email') {
      return 'Email';
    } else if (attribution.medium === 'organic') {
      return `${attribution.source} Organic`;
    } else if (attribution.medium === 'referral') {
      return 'Referral';
    } else {
      return 'Direct';
    }
  }

  /**
   * Get channel from event properties
   */
  private getChannelFromEvent(event: ConversionEvent): string {
    // Try to extract channel from event properties
    if (event.properties.channel) {
      return event.properties.channel;
    }
    
    if (event.properties.source) {
      return event.properties.source;
    }
    
    if (event.properties.referrer) {
      const domain = new URL(event.properties.referrer).hostname;
      return domain;
    }
    
    return 'Direct';
  }
}

// Export singleton
export const attributionAnalyzer = new AttributionAnalyzer();
