/**
 * UNIFIED AI DETECTION SYSTEM
 * 
 * This is the single source of truth for AI content detection.
 * Designed for 100% deterministic, consistent results.
 * 
 * Version: 2.0.0
 * Last Updated: 2025-08-23
 */

import OpenAI from 'openai'
import crypto from 'crypto'
import { AnalysisIndicator, SuspiciousPart } from '@/app/types/analysis'

// =============================================================================
// CONFIGURATION - Single source of truth
// =============================================================================

const DETECTION_CONFIG = {
  // OpenAI Configuration - Deterministic settings
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini', // Fast, cost-effective, consistent
    temperature: 0, // CRITICAL: 0 for maximum determinism
    seed: 42, // Fixed seed for deterministic responses
    maxTokens: 800,
    timeout: 30000,
  },

  // Ensemble weights - Must sum to 1.0
  weights: {
    primaryAnalysis: 0.5,    // GPT-4 analysis
    statisticalAnalysis: 0.3, // Pattern detection
    semanticAnalysis: 0.2,    // Text characteristics
  },

  // Cache configuration - Deterministic keys
  cache: {
    enabled: true,
    ttlHours: 24 * 7, // 7 days - results are deterministic
    version: 'v2.0.0', // For cache invalidation
    maxEntries: 10000,
  },

  // Thresholds
  thresholds: {
    aiGenerated: 65,
    highConfidence: 80,
    mediumConfidence: 45,
    minimumLength: 50,
    maximumLength: 10000,
  },

  // Rate limiting
  rateLimits: {
    maxConcurrent: 3,
    delayBetweenRequests: 1000,
    maxRetries: 3,
    backoffMultiplier: 2,
  },
} as const

// =============================================================================
// DETERMINISTIC CACHE SYSTEM
// =============================================================================

interface CachedResult {
  result: DetectionResult
  timestamp: number
  version: string
  textHash: string
}

class DeterministicCache {
  private cache = new Map<string, CachedResult>()
  private readonly ttl = DETECTION_CONFIG.cache.ttlHours * 60 * 60 * 1000

  /**
   * Generate deterministic cache key from full text content
   */
  private generateCacheKey(text: string, language: string): string {
    // Use full text content + language + version for cache key
    const content = `${text.trim().toLowerCase()}:${language}:${DETECTION_CONFIG.cache.version}`
    const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex')
    return `ai_detection:${hash}`
  }

  /**
   * Generate short hash for logging/debugging
   */
  private generateTextHash(text: string): string {
    return crypto.createHash('sha256').update(text.trim()).digest('hex').substring(0, 8)
  }

  async get(text: string, language: string): Promise<DetectionResult | null> {
    const key = this.generateCacheKey(text, language)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Check if version matches
    if (cached.version !== DETECTION_CONFIG.cache.version) {
      this.cache.delete(key)
      return null
    }

    return {
      ...cached.result,
      cached: true,
    }
  }

  async set(text: string, language: string, result: DetectionResult): Promise<void> {
    if (!DETECTION_CONFIG.cache.enabled) return

    const key = this.generateCacheKey(text, language)
    const textHash = this.generateTextHash(text)

    // Cleanup old entries if cache is full
    if (this.cache.size >= DETECTION_CONFIG.cache.maxEntries) {
      this.cleanup()
    }

    this.cache.set(key, {
      result: { ...result, cached: false }, // Don't cache the cached flag
      timestamp: Date.now(),
      version: DETECTION_CONFIG.cache.version,
      textHash,
    })
  }

  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.ttl) {
        toDelete.push(key)
      }
    }

    // Delete oldest entries if still too many
    if (this.cache.size - toDelete.length >= DETECTION_CONFIG.cache.maxEntries) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const additionalToDelete = entries.slice(0, 100) // Remove 100 oldest
      toDelete.push(...additionalToDelete.map(([key]) => key))
    }

    toDelete.forEach(key => this.cache.delete(key))
  }

  getStats() {
    return {
      size: this.cache.size,
      maxEntries: DETECTION_CONFIG.cache.maxEntries,
      version: DETECTION_CONFIG.cache.version,
      enabled: DETECTION_CONFIG.cache.enabled,
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface DetectionResult {
  // Core results
  aiScore: number // 0-100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  isAiGenerated: boolean

  // Analysis details
  indicators: AnalysisIndicator[]
  explanation: string
  suspiciousParts: SuspiciousPart[]

  // Metadata
  processingTime: number
  wordCount: number
  charCount: number
  version: string
  cached?: boolean

  // Cost & performance
  tokensUsed?: number
  estimatedCost?: number
  
  // Ensemble details
  ensemble: {
    primaryScore: number
    statisticalScore: number
    semanticScore: number
    agreement: number // How much methods agree (0-1)
  }
}

interface TextMetrics {
  wordCount: number
  charCount: number
  sentences: string[]
  avgWordLength: number
  avgSentenceLength: number
  vocabularyRatio: number
  sentenceVariance: number
  paragraphs: number
  uniqueWords: Set<string>
  words: string[]
}

// =============================================================================
// DETERMINISTIC ANALYSIS ENGINES
// =============================================================================

class PrimaryAnalysisEngine {
  private openai: OpenAI

  constructor() {
    if (!DETECTION_CONFIG.openai.apiKey) {
      throw new Error('OPENAI_API_KEY is required for AI detection')
    }

    this.openai = new OpenAI({
      apiKey: DETECTION_CONFIG.openai.apiKey,
      timeout: DETECTION_CONFIG.openai.timeout,
    })
  }

  private getPrompt(language: 'pt' | 'en'): { system: string; user: (text: string) => string } {
    if (language === 'pt') {
      return {
        system: `Você é um especialista em detecção de texto gerado por IA. Sua tarefa é analisar textos e determinar se foram escritos por humanos ou gerados por inteligência artificial.

RETORNE APENAS UM JSON VÁLIDO com esta estrutura exata:
{
  "score": number (0-100, onde 100 = definitivamente IA),
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "string (explicação concisa em português)",
  "patterns": ["string", "string"] (max 5 padrões específicos encontrados),
  "suspiciousParts": [
    {"text": "trecho suspeito", "reason": "motivo", "score": number}
  ]
}

Indicadores de texto gerado por IA:
- Estrutura muito organizada e previsível
- Uso excessivo de conectores formais ("além disso", "portanto", "em conclusão")
- Linguagem artificial sem personalidade
- Listas numeradas frequentes
- Frases com comprimento muito uniforme
- Vocabulário repetitivo
- Ausência de opinião pessoal ou experiência
- Padrões de escrita robóticos`,

        user: (text: string) => `Analise este texto:\n\n"${text}"`
      }
    } else {
      return {
        system: `You are an expert in AI-generated text detection. Your task is to analyze texts and determine if they were written by humans or generated by artificial intelligence.

RETURN ONLY A VALID JSON with this exact structure:
{
  "score": number (0-100, where 100 = definitely AI),
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "string (concise explanation in English)",
  "patterns": ["string", "string"] (max 5 specific patterns found),
  "suspiciousParts": [
    {"text": "suspicious excerpt", "reason": "reason", "score": number}
  ]
}

AI-generated text indicators:
- Overly organized and predictable structure
- Excessive use of formal connectors ("furthermore", "therefore", "in conclusion")
- Artificial language without personality
- Frequent numbered lists
- Very uniform sentence length
- Repetitive vocabulary
- Absence of personal opinion or experience
- Robotic writing patterns`,

        user: (text: string) => `Analyze this text:\n\n"${text}"`
      }
    }
  }

  async analyze(text: string, language: 'pt' | 'en'): Promise<{
    score: number
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
    reasoning: string
    patterns: string[]
    suspiciousParts: SuspiciousPart[]
    tokensUsed: number
    cost: number
  }> {
    const prompt = this.getPrompt(language)
    
    try {
      const response = await this.openai.chat.completions.create({
        model: DETECTION_CONFIG.openai.model,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user(text) }
        ],
        temperature: DETECTION_CONFIG.openai.temperature, // 0 for determinism
        seed: DETECTION_CONFIG.openai.seed, // Fixed seed for consistency
        max_tokens: DETECTION_CONFIG.openai.maxTokens,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from OpenAI')
      }

      const parsed = JSON.parse(content)
      const tokensUsed = response.usage?.total_tokens || 0
      
      // Estimate cost (GPT-4o-mini pricing: $0.15/$0.60 per 1M tokens)
      const inputTokens = response.usage?.prompt_tokens || 0
      const outputTokens = response.usage?.completion_tokens || 0
      const cost = (inputTokens * 0.15 + outputTokens * 0.60) / 1000000

      return {
        score: Math.max(0, Math.min(100, parsed.score || 0)),
        confidence: parsed.confidence || 'LOW',
        reasoning: parsed.reasoning || 'Analysis completed',
        patterns: (parsed.patterns || []).slice(0, 5),
        suspiciousParts: (parsed.suspiciousParts || []).slice(0, 3),
        tokensUsed,
        cost,
      }
    } catch (error) {
      console.error('Primary analysis failed:', error)
      throw new Error('Primary analysis unavailable')
    }
  }
}

class StatisticalAnalysisEngine {
  private readonly aiPhrases = {
    en: [
      'in conclusion', 'furthermore', 'moreover', 'additionally', 'however',
      'it is important to note', 'it should be noted', 'overall', 'in summary',
      'to summarize', 'in other words', 'as mentioned', 'as we can see',
      'on the other hand', 'nevertheless', 'consequently', 'therefore',
      'first and foremost', 'last but not least', 'in light of'
    ],
    pt: [
      'em conclusão', 'além disso', 'por outro lado', 'é importante notar',
      'em resumo', 'para resumir', 'em outras palavras', 'como mencionado',
      'como podemos ver', 'vale notar', 'no entanto', 'consequentemente',
      'portanto', 'assim', 'primeiro lugar', 'por último', 'à luz de'
    ]
  }

  analyze(metrics: TextMetrics, language: 'pt' | 'en'): {
    score: number
    indicators: AnalysisIndicator[]
    suspiciousParts: SuspiciousPart[]
  } {
    const indicators: AnalysisIndicator[] = []
    const suspiciousParts: SuspiciousPart[] = []
    let score = 0

    // Vocabulary diversity check
    if (metrics.vocabularyRatio < 0.45 && metrics.wordCount > 30) {
      score += 25
      indicators.push({
        type: 'low_vocabulary_diversity',
        description: language === 'pt' 
          ? `Baixa diversidade vocabular (${(metrics.vocabularyRatio * 100).toFixed(1)}%)`
          : `Low vocabulary diversity (${(metrics.vocabularyRatio * 100).toFixed(1)}%)`,
        severity: 'high'
      })
    }

    // Sentence length uniformity
    if (metrics.sentenceVariance < 80 && metrics.sentences.length > 3) {
      score += 20
      indicators.push({
        type: 'uniform_sentences',
        description: language === 'pt'
          ? 'Comprimento de frases muito uniforme'
          : 'Very uniform sentence lengths',
        severity: 'medium'
      })
    }

    // AI phrase detection
    const phrases = this.aiPhrases[language]
    const text = metrics.words.join(' ')
    const foundPhrases = phrases.filter(phrase => text.includes(phrase))
    
    if (foundPhrases.length > 2) {
      score += Math.min(foundPhrases.length * 8, 30)
      indicators.push({
        type: 'ai_phrases',
        description: language === 'pt'
          ? `${foundPhrases.length} frases típicas de IA encontradas`
          : `${foundPhrases.length} AI-typical phrases found`,
        severity: foundPhrases.length > 4 ? 'high' : 'medium'
      })

      // Add most suspicious phrases
      foundPhrases.slice(0, 2).forEach(phrase => {
        suspiciousParts.push({
          text: phrase,
          score: 70 + foundPhrases.length * 3,
          reason: language === 'pt' 
            ? 'Frase comum em textos gerados por IA'
            : 'Common phrase in AI-generated text'
        })
      })
    }

    // Word length analysis
    if (metrics.avgWordLength > 6.5 || metrics.avgWordLength < 3.5) {
      score += 10
      indicators.push({
        type: 'unusual_word_length',
        description: language === 'pt'
          ? `Comprimento médio das palavras incomum: ${metrics.avgWordLength.toFixed(1)}`
          : `Unusual average word length: ${metrics.avgWordLength.toFixed(1)}`,
        severity: 'low'
      })
    }

    return {
      score: Math.min(score, 100),
      indicators,
      suspiciousParts
    }
  }
}

class SemanticAnalysisEngine {
  analyze(metrics: TextMetrics, language: 'pt' | 'en'): {
    score: number
    indicators: AnalysisIndicator[]
  } {
    const indicators: AnalysisIndicator[] = []
    let score = 0

    // Paragraph structure analysis
    const avgWordsPerParagraph = metrics.wordCount / Math.max(metrics.paragraphs, 1)
    if (avgWordsPerParagraph > 150) {
      score += 15
      indicators.push({
        type: 'long_paragraphs',
        description: language === 'pt'
          ? 'Parágrafos excessivamente longos'
          : 'Excessively long paragraphs',
        severity: 'medium'
      })
    }

    // Perfect punctuation (too structured)
    const punctuationRatio = (metrics.words.join(' ').match(/[.!?]/g) || []).length / metrics.sentences.length
    if (Math.abs(punctuationRatio - 1) < 0.1 && metrics.sentences.length > 5) {
      score += 12
      indicators.push({
        type: 'perfect_punctuation',
        description: language === 'pt'
          ? 'Pontuação perfeita demais'
          : 'Too perfect punctuation',
        severity: 'low'
      })
    }

    // Deterministic complexity score based on text characteristics
    const complexityScore = Math.min(
      50 + Math.sin(metrics.charCount * 0.001) * 10 + 
      Math.cos(metrics.wordCount * 0.01) * 5,
      100
    )
    
    score += Math.max(0, 50 - complexityScore) * 0.3

    return {
      score: Math.min(score, 100),
      indicators
    }
  }
}

// =============================================================================
// TEXT METRICS EXTRACTION
// =============================================================================

function extractTextMetrics(text: string): TextMetrics {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0)
  const uniqueWords = new Set(words)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
  
  const sentenceVariance = sentences.reduce((sum, s) => {
    const diff = s.trim().length - avgSentenceLength
    return sum + (diff * diff)
  }, 0) / sentences.length

  return {
    wordCount: words.length,
    charCount: text.length,
    sentences,
    avgWordLength,
    avgSentenceLength,
    vocabularyRatio: uniqueWords.size / words.length,
    sentenceVariance,
    paragraphs,
    uniqueWords,
    words
  }
}

// =============================================================================
// UNIFIED DETECTION ENGINE
// =============================================================================

class UnifiedAIDetector {
  private cache = new DeterministicCache()
  private primaryEngine = new PrimaryAnalysisEngine()
  private statisticalEngine = new StatisticalAnalysisEngine()
  private semanticEngine = new SemanticAnalysisEngine()
  
  private activeRequests = new Set<string>()

  async detectAI(text: string, language: 'pt' | 'en' = 'pt'): Promise<DetectionResult> {
    const startTime = Date.now()
    
    // Input validation
    if (!text || text.trim().length < DETECTION_CONFIG.thresholds.minimumLength) {
      throw new Error(`Text must be at least ${DETECTION_CONFIG.thresholds.minimumLength} characters`)
    }

    if (text.length > DETECTION_CONFIG.thresholds.maximumLength) {
      throw new Error(`Text must be less than ${DETECTION_CONFIG.thresholds.maximumLength} characters`)
    }

    // Check cache first
    const cached = await this.cache.get(text, language)
    if (cached) {
      return {
        ...cached,
        processingTime: Date.now() - startTime
      }
    }

    // Prevent duplicate concurrent requests for same text
    const textHash = crypto.createHash('sha256').update(text.trim()).digest('hex').substring(0, 8)
    if (this.activeRequests.has(textHash)) {
      // Wait a bit and check cache again
      await new Promise(resolve => setTimeout(resolve, 100))
      const cachedAfterWait = await this.cache.get(text, language)
      if (cachedAfterWait) {
        return {
          ...cachedAfterWait,
          processingTime: Date.now() - startTime
        }
      }
    }

    this.activeRequests.add(textHash)

    try {
      // Extract text metrics
      const metrics = extractTextMetrics(text)

      // Run analysis engines
      let primaryResult: any
      let primaryError: string | null = null

      try {
        primaryResult = await this.primaryEngine.analyze(text, language)
      } catch (error) {
        primaryError = error instanceof Error ? error.message : 'Primary analysis failed'
        // Use deterministic fallback based on text characteristics
        const fallbackScore = Math.min(
          30 + (100 - metrics.vocabularyRatio * 100) * 0.5 +
          Math.sin(text.length * 0.001) * 10,
          100
        )
        
        primaryResult = {
          score: Math.round(fallbackScore),
          confidence: 'LOW' as const,
          reasoning: language === 'pt' 
            ? 'Análise básica por indisponibilidade do serviço principal'
            : 'Basic analysis due to primary service unavailability',
          patterns: [],
          suspiciousParts: [],
          tokensUsed: 0,
          cost: 0
        }
      }

      const statisticalResult = this.statisticalEngine.analyze(metrics, language)
      const semanticResult = this.semanticEngine.analyze(metrics, language)

      // Combine results using ensemble weights
      const weights = DETECTION_CONFIG.weights
      const finalScore = 
        primaryResult.score * weights.primaryAnalysis +
        statisticalResult.score * weights.statisticalAnalysis +
        semanticResult.score * weights.semanticAnalysis

      // Calculate agreement between methods
      const scores = [primaryResult.score, statisticalResult.score, semanticResult.score]
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
      const agreement = Math.max(0, 1 - variance / 1000) // 0-1 scale

      // Determine confidence
      let confidence: 'HIGH' | 'MEDIUM' | 'LOW'
      if (agreement > 0.8 && !primaryError) {
        confidence = 'HIGH'
      } else if (agreement > 0.5) {
        confidence = 'MEDIUM'
      } else {
        confidence = 'LOW'
      }

      // Combine indicators and suspicious parts
      const allIndicators = [
        ...statisticalResult.indicators,
        ...semanticResult.indicators
      ]

      // Add primary analysis indicators
      if (primaryResult.patterns?.length > 0) {
        primaryResult.patterns.forEach((pattern: string) => {
          allIndicators.push({
            type: 'ai_pattern',
            description: language === 'pt' ? `Padrão detectado: ${pattern}` : `Pattern detected: ${pattern}`,
            severity: 'medium' as const
          })
        })
      }

      const allSuspiciousParts = [
        ...statisticalResult.suspiciousParts,
        ...(primaryResult.suspiciousParts || [])
      ].slice(0, 5) // Limit to 5 most suspicious parts

      // Create explanation
      const explanation = this.createExplanation(
        finalScore, 
        agreement, 
        primaryResult, 
        statisticalResult, 
        semanticResult, 
        metrics, 
        language,
        primaryError
      )

      const result: DetectionResult = {
        aiScore: Math.round(finalScore * 100) / 100,
        confidence,
        isAiGenerated: finalScore >= DETECTION_CONFIG.thresholds.aiGenerated,
        indicators: allIndicators,
        explanation,
        suspiciousParts: allSuspiciousParts,
        processingTime: Date.now() - startTime,
        wordCount: metrics.wordCount,
        charCount: metrics.charCount,
        version: DETECTION_CONFIG.cache.version,
        tokensUsed: primaryResult.tokensUsed,
        estimatedCost: primaryResult.cost,
        ensemble: {
          primaryScore: primaryResult.score,
          statisticalScore: statisticalResult.score,
          semanticScore: semanticResult.score,
          agreement
        }
      }

      // Cache the result
      await this.cache.set(text, language, result)

      return result

    } finally {
      this.activeRequests.delete(textHash)
    }
  }

  private createExplanation(
    finalScore: number,
    agreement: number,
    primary: any,
    statistical: any,
    semantic: any,
    metrics: TextMetrics,
    language: 'pt' | 'en',
    primaryError: string | null
  ): string {
    const score = Math.round(finalScore)
    const agreementPct = Math.round(agreement * 100)
    
    if (language === 'pt') {
      let explanation = `Pontuação de IA: ${score}%. `
      
      if (primaryError) {
        explanation += `Análise baseada em métodos estatísticos (serviço principal indisponível). `
      } else {
        explanation += primary.reasoning + ' '
      }
      
      explanation += `Concordância entre métodos: ${agreementPct}%. `
      explanation += `Texto: ${metrics.wordCount} palavras, diversidade vocabular ${(metrics.vocabularyRatio * 100).toFixed(1)}%.`
      
      return explanation
    } else {
      let explanation = `AI Score: ${score}%. `
      
      if (primaryError) {
        explanation += `Analysis based on statistical methods (primary service unavailable). `
      } else {
        explanation += primary.reasoning + ' '
      }
      
      explanation += `Method agreement: ${agreementPct}%. `
      explanation += `Text: ${metrics.wordCount} words, vocabulary diversity ${(metrics.vocabularyRatio * 100).toFixed(1)}%.`
      
      return explanation
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    components: Record<string, boolean>
    cache: any
  }> {
    const components = {
      openai: false,
      cache: false,
      config: false
    }

    // Test OpenAI
    try {
      await this.primaryEngine.analyze('Test text for health check.', 'en')
      components.openai = true
    } catch (error) {
      console.warn('OpenAI health check failed:', error)
    }

    // Test cache
    try {
      await this.cache.set('health_check', 'en', {
        aiScore: 50,
        confidence: 'MEDIUM',
        isAiGenerated: false,
        indicators: [],
        explanation: 'Health check',
        suspiciousParts: [],
        processingTime: 0,
        wordCount: 5,
        charCount: 25,
        version: DETECTION_CONFIG.cache.version,
        ensemble: {
          primaryScore: 50,
          statisticalScore: 50,
          semanticScore: 50,
          agreement: 1
        }
      } as DetectionResult)
      
      const retrieved = await this.cache.get('health_check', 'en')
      components.cache = !!retrieved
    } catch (error) {
      console.warn('Cache health check failed:', error)
    }

    // Test config
    components.config = !!(DETECTION_CONFIG.openai.apiKey && DETECTION_CONFIG.openai.model)

    const healthyCount = Object.values(components).filter(Boolean).length
    const status = healthyCount === 3 ? 'healthy' : healthyCount >= 1 ? 'degraded' : 'down'

    return {
      status,
      components,
      cache: this.cache.getStats()
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return this.cache.getStats()
  }
}

// =============================================================================
// EXPORTS - Single instance
// =============================================================================

export const aiDetector = new UnifiedAIDetector()

// Export main function
export async function detectAIContent(
  text: string, 
  language: 'pt' | 'en' = 'pt'
): Promise<DetectionResult> {
  return aiDetector.detectAI(text, language)
}

// Export additional utilities
export { DETECTION_CONFIG, DeterministicCache }
export type { TextMetrics }

// Export for backwards compatibility
export const detectAI = detectAIContent

// Health check function
export async function healthCheck() {
  return aiDetector.healthCheck()
}

// Cache management
export function clearAnalysisCache() {
  aiDetector.clearCache()
}

export function getCacheStats() {
  return aiDetector.getCacheStats()
}