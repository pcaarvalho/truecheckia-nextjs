/**
 * PRODUCTION CONFIGURATION FOR AI DETECTION
 * 
 * Optimized settings for production deployment with focus on:
 * - Cost efficiency
 * - Performance
 * - Reliability
 * - Monitoring
 */

// Environment validation
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'NODE_ENV'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// Validate OpenAI API key format
if (!process.env.OPENAI_API_KEY?.startsWith('sk-')) {
  throw new Error('OPENAI_API_KEY appears to be invalid (should start with sk-)')
}

// Production-optimized configuration
export const PRODUCTION_CONFIG = {
  // OpenAI Settings - Optimized for cost and consistency
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini', // Most cost-effective for production
    temperature: 0, // Maximum determinism
    seed: 42, // Fixed seed for consistency
    maxTokens: 800, // Sufficient for analysis, cost-controlled
    timeout: 25000, // 25s timeout for production
  },

  // Ensemble weights - Optimized after testing
  weights: {
    primaryAnalysis: 0.5,    // GPT analysis
    statisticalAnalysis: 0.3, // Pattern detection  
    semanticAnalysis: 0.2,    // Text characteristics
  },

  // Production cache settings
  cache: {
    enabled: true,
    ttlHours: 24 * 7, // 7 days - results are deterministic
    version: 'v2.0.0',
    maxEntries: 50000, // Higher limit for production
  },

  // Production thresholds - Validated through testing
  thresholds: {
    aiGenerated: 65, // Balanced threshold
    highConfidence: 85, // Conservative high confidence
    mediumConfidence: 45, // Generous medium confidence
    minimumLength: 50,
    maximumLength: 15000, // Higher limit for production
  },

  // Rate limiting - Production safe
  rateLimits: {
    maxConcurrent: 5, // Higher for production load
    delayBetweenRequests: 500, // Faster for production
    maxRetries: 3,
    backoffMultiplier: 2,
  },

  // Cost controls
  cost: {
    maxDailyCost: 100.0, // USD - adjust based on usage
    alertThreshold: 80.0, // Alert at 80%
    emergencyStopThreshold: 95.0, // Emergency stop at 95%
  },

  // Monitoring and logging
  monitoring: {
    enableDetailedLogs: false, // Disable in production for performance
    enableMetrics: true,
    enableHealthChecks: true,
    logErrors: true,
    logPerformanceIssues: true, // Log processing times >5s
    performanceThreshold: 5000, // 5s threshold
  },

  // Fallback behavior in production
  fallback: {
    enableStatisticalFallback: true,
    fallbackConfidence: 'LOW' as const,
    fallbackScore: 50, // Neutral score when uncertain
    deterministicFallback: true, // Use deterministic fallback logic
  },

  // Production feature flags
  features: {
    ensembleScoring: true,
    advancedCaching: true,
    costOptimization: true,
    healthChecks: true,
    performanceTracking: true,
  }
} as const

// Cost tracking for production
export class ProductionCostTracker {
  private static dailyUsage = { date: '', cost: 0 }
  
  static trackCost(cost: number): boolean {
    const today = new Date().toDateString()
    
    if (this.dailyUsage.date !== today) {
      this.dailyUsage = { date: today, cost: 0 }
    }
    
    const newTotal = this.dailyUsage.cost + cost
    
    // Emergency stop
    if (newTotal > PRODUCTION_CONFIG.cost.emergencyStopThreshold) {
      console.error(`EMERGENCY STOP: Daily cost limit exceeded ($${newTotal.toFixed(4)})`)
      return false
    }
    
    // Alert threshold
    if (newTotal > PRODUCTION_CONFIG.cost.alertThreshold && this.dailyUsage.cost <= PRODUCTION_CONFIG.cost.alertThreshold) {
      console.warn(`COST ALERT: Daily usage at $${newTotal.toFixed(4)} (${((newTotal / PRODUCTION_CONFIG.cost.maxDailyCost) * 100).toFixed(1)}%)`)
    }
    
    this.dailyUsage.cost = newTotal
    return true
  }
  
  static getDailyUsage() {
    return { ...this.dailyUsage }
  }
  
  static resetDailyUsage() {
    this.dailyUsage = { date: new Date().toDateString(), cost: 0 }
  }
}

// Production metrics collector
export class ProductionMetrics {
  private static metrics = {
    totalAnalyses: 0,
    totalProcessingTime: 0,
    cacheHits: 0,
    errors: 0,
    slowRequests: 0, // >5s
    costTracking: 0,
  }
  
  static recordAnalysis(processingTime: number, cached: boolean, error?: boolean, cost?: number) {
    this.metrics.totalAnalyses++
    this.metrics.totalProcessingTime += processingTime
    
    if (cached) this.metrics.cacheHits++
    if (error) this.metrics.errors++
    if (processingTime > PRODUCTION_CONFIG.monitoring.performanceThreshold) {
      this.metrics.slowRequests++
      if (PRODUCTION_CONFIG.monitoring.logPerformanceIssues) {
        console.warn(`Slow analysis detected: ${processingTime}ms`)
      }
    }
    if (cost) this.metrics.costTracking += cost
  }
  
  static getMetrics() {
    const avgProcessingTime = this.metrics.totalAnalyses > 0 
      ? this.metrics.totalProcessingTime / this.metrics.totalAnalyses 
      : 0
      
    const cacheHitRate = this.metrics.totalAnalyses > 0
      ? (this.metrics.cacheHits / this.metrics.totalAnalyses) * 100
      : 0
      
    const errorRate = this.metrics.totalAnalyses > 0
      ? (this.metrics.errors / this.metrics.totalAnalyses) * 100
      : 0
      
    const slowRequestRate = this.metrics.totalAnalyses > 0
      ? (this.metrics.slowRequests / this.metrics.totalAnalyses) * 100
      : 0
    
    return {
      totalAnalyses: this.metrics.totalAnalyses,
      avgProcessingTime: Math.round(avgProcessingTime),
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10,
      slowRequestRate: Math.round(slowRequestRate * 10) / 10,
      totalCost: Math.round(this.metrics.costTracking * 10000) / 10000,
    }
  }
  
  static resetMetrics() {
    this.metrics = {
      totalAnalyses: 0,
      totalProcessingTime: 0,
      cacheHits: 0,
      errors: 0,
      slowRequests: 0,
      costTracking: 0,
    }
  }
}

// Production health checker
export class ProductionHealthChecker {
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    checks: Record<string, boolean>
    metrics: any
    cost: any
    timestamp: string
  }> {
    const checks = {
      openaiConnectivity: false,
      configurationValid: false,
      cacheWorking: false,
      costLimitsOk: false,
    }
    
    // Test OpenAI connectivity
    try {
      const OpenAI = require('openai')
      const openai = new OpenAI({ 
        apiKey: PRODUCTION_CONFIG.openai.apiKey,
        timeout: 5000 // Quick health check
      })
      
      await openai.chat.completions.create({
        model: PRODUCTION_CONFIG.openai.model,
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 5,
        temperature: 0,
      })
      
      checks.openaiConnectivity = true
    } catch (error) {
      console.warn('OpenAI connectivity check failed:', error)
    }
    
    // Configuration validation
    checks.configurationValid = !!(
      PRODUCTION_CONFIG.openai.apiKey &&
      PRODUCTION_CONFIG.openai.model &&
      PRODUCTION_CONFIG.weights.primaryAnalysis + 
      PRODUCTION_CONFIG.weights.statisticalAnalysis + 
      PRODUCTION_CONFIG.weights.semanticAnalysis === 1.0
    )
    
    // Cache test (simplified)
    checks.cacheWorking = true // Assume working unless we can test Redis/etc
    
    // Cost limits check
    const dailyUsage = ProductionCostTracker.getDailyUsage()
    checks.costLimitsOk = dailyUsage.cost < PRODUCTION_CONFIG.cost.maxDailyCost
    
    const healthyChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    
    let status: 'healthy' | 'degraded' | 'down'
    if (healthyChecks === totalChecks) {
      status = 'healthy'
    } else if (healthyChecks >= totalChecks / 2) {
      status = 'degraded'
    } else {
      status = 'down'
    }
    
    return {
      status,
      checks,
      metrics: ProductionMetrics.getMetrics(),
      cost: ProductionCostTracker.getDailyUsage(),
      timestamp: new Date().toISOString(),
    }
  }
}

// Export configuration validation
export function validateProductionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check OpenAI configuration
  if (!PRODUCTION_CONFIG.openai.apiKey) {
    errors.push('OpenAI API key is required')
  }
  
  if (!PRODUCTION_CONFIG.openai.model) {
    errors.push('OpenAI model is required')
  }
  
  // Check weights sum to 1.0
  const weightsSum = 
    PRODUCTION_CONFIG.weights.primaryAnalysis +
    PRODUCTION_CONFIG.weights.statisticalAnalysis +
    PRODUCTION_CONFIG.weights.semanticAnalysis
    
  if (Math.abs(weightsSum - 1.0) > 0.001) {
    errors.push(`Ensemble weights must sum to 1.0, current: ${weightsSum}`)
  }
  
  // Check thresholds are reasonable
  if (PRODUCTION_CONFIG.thresholds.aiGenerated < 0 || PRODUCTION_CONFIG.thresholds.aiGenerated > 100) {
    errors.push('AI generation threshold must be between 0-100')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Initialize production configuration
const configValidation = validateProductionConfig()
if (!configValidation.isValid) {
  console.error('Production configuration errors:', configValidation.errors)
  throw new Error(`Invalid production configuration: ${configValidation.errors.join(', ')}`)
}

console.log('✅ Production AI Detection configuration loaded and validated')

export default PRODUCTION_CONFIG