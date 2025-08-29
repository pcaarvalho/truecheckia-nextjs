/**
 * AI Detection Configuration
 * Centralized configuration for OpenAI integration and AI detection parameters
 */

export const AI_CONFIG = {
  // OpenAI API Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID, // Optional
    models: {
      chat: 'gpt-4',
      embedding: 'text-embedding-3-small',
      fallback: 'gpt-3.5-turbo' // Fallback for cost optimization
    },
    maxTokens: {
      analysis: 500,
      embedding: 8000
    },
    temperature: 0.1, // Low temperature for consistent analysis
    timeout: 30000 // 30 seconds
  },

  // Detection Thresholds
  thresholds: {
    aiGenerated: 70, // Score above which text is considered AI-generated
    highConfidence: 80, // Score for high confidence detection
    mediumConfidence: 50, // Score for medium confidence detection
    minimumTextLength: 10, // Minimum characters for analysis
    maximumTextLength: 10000, // Maximum characters for analysis
    scoreDifferenceForHighConfidence: 20 // Max difference between methods for high confidence
  },

  // Analysis Weights (must sum to 1.0)
  weights: {
    gpt4Analysis: 0.6,
    statisticalAnalysis: 0.4,
    embeddingAnalysis: 0.0 // Reserved for future use
  },

  // Cache Configuration
  cache: {
    enabled: true,
    expiryMinutes: 15,
    maxEntries: 1000,
    keyLength: 100 // Characters to use for cache key
  },

  // Rate Limiting
  rateLimiting: {
    batchSize: 5, // Number of concurrent analyses
    delayBetweenBatches: 1000, // Milliseconds
    maxRetries: 3,
    retryDelay: 2000 // Milliseconds
  },

  // Cost Optimization
  costOptimization: {
    useFallbackModel: false, // Use cheaper model for non-critical analyses
    enableBatching: true,
    enableCaching: true,
    maxDailyCost: 100.00, // USD limit per day
    alertThreshold: 80.00 // Send alert when approaching limit
  },

  // Statistical Analysis Parameters
  statistical: {
    vocabularyRatioThreshold: 0.5,
    sentenceVarianceThreshold: 100,
    commonPhrasesThreshold: 2,
    aiPhrases: [
      // English phrases
      'in conclusion', 'furthermore', 'moreover', 'additionally',
      'it is important to note', 'it should be noted', 'overall',
      'in summary', 'to summarize', 'in other words', 'as mentioned',
      'as we can see', 'it\'s worth noting', 'on the other hand',
      'nevertheless', 'consequently', 'therefore', 'thus',
      'first and foremost', 'last but not least', 'in light of',
      
      // Portuguese phrases
      'em conclusão', 'além disso', 'por outro lado', 'é importante notar',
      'em resumo', 'para resumir', 'em outras palavras', 'como mencionado',
      'como podemos ver', 'vale notar', 'no entanto', 'consequentemente',
      'portanto', 'assim', 'primeiro lugar', 'por último',
      'à luz de', 'tendo em vista', 'de fato', 'na verdade'
    ]
  },

  // Error Handling
  errorHandling: {
    enableFallback: true,
    logErrors: true,
    returnPartialResults: true,
    defaultScore: 50 // Default score when analysis fails
  },

  // Monitoring and Analytics
  monitoring: {
    trackPerformance: true,
    logAnalysisResults: false, // Set to true for debugging
    trackCosts: true,
    alertOnHighUsage: true,
    logErrors: true
  }
} as const

/**
 * Validation function for API key
 */
export function validateOpenAIConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!AI_CONFIG.openai.apiKey) {
    errors.push('OPENAI_API_KEY environment variable is required')
  }

  if (AI_CONFIG.openai.apiKey && !AI_CONFIG.openai.apiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)')
  }

  // Validate weights sum to 1.0
  const weightsSum = AI_CONFIG.weights.gpt4Analysis + 
                    AI_CONFIG.weights.statisticalAnalysis + 
                    AI_CONFIG.weights.embeddingAnalysis
  
  if (Math.abs(weightsSum - 1.0) > 0.01) {
    errors.push(`Analysis weights must sum to 1.0, current sum: ${weightsSum}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    ...AI_CONFIG,
    openai: {
      ...AI_CONFIG.openai,
      // Use cheaper model in development if specified
      models: {
        ...AI_CONFIG.openai.models,
        chat: isDevelopment && AI_CONFIG.costOptimization.useFallbackModel 
          ? AI_CONFIG.openai.models.fallback 
          : AI_CONFIG.openai.models.chat
      }
    },
    monitoring: {
      ...AI_CONFIG.monitoring,
      // Enable detailed logging in development
      logAnalysisResults: isDevelopment,
      trackPerformance: true
    },
    cache: {
      ...AI_CONFIG.cache,
      // Shorter cache in development for testing
      expiryMinutes: isDevelopment ? 5 : AI_CONFIG.cache.expiryMinutes
    }
  }
}

/**
 * Cost tracking utilities
 */
export const CostTracker = {
  // Estimated costs per model (USD per 1K tokens)
  costs: {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'text-embedding-3-small': { input: 0.00002, output: 0 }
  },

  estimateAnalysisCost(textLength: number, model: string = 'gpt-4'): number {
    // Rough estimation: 1 token ≈ 4 characters for text
    const estimatedTokens = Math.ceil(textLength / 4)
    const modelCosts = this.costs[model as keyof typeof this.costs]
    
    if (!modelCosts) return 0
    
    // Estimate input + output tokens (output usually ~10% of input for analysis)
    const inputCost = (estimatedTokens / 1000) * modelCosts.input
    const outputCost = (estimatedTokens * 0.1 / 1000) * modelCosts.output
    
    return inputCost + outputCost
  },

  shouldUseFallbackModel(textLength: number): boolean {
    const estimatedCost = this.estimateAnalysisCost(textLength)
    return AI_CONFIG.costOptimization.useFallbackModel && estimatedCost > 0.01
  }
}

export type AIConfig = typeof AI_CONFIG