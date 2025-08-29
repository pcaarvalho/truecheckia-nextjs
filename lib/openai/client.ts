import OpenAI from 'openai'
import { z } from 'zod'

// OpenAI Configuration Schema
const openaiConfigSchema = z.object({
  apiKey: z.string().min(1, 'OpenAI API key is required'),
  organization: z.string().optional(),
  baseURL: z.string().url().optional(),
})

// OpenAI Client Configuration
const config = {
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORGANIZATION,
  baseURL: process.env.OPENAI_BASE_URL,
}

// Validate configuration
openaiConfigSchema.parse(config)

// Create OpenAI client instance
export const openaiClient = new OpenAI({
  apiKey: config.apiKey,
  organization: config.organization,
  baseURL: config.baseURL,
})

// OpenAI API Settings
export const OPENAI_SETTINGS = {
  models: {
    primary: 'gpt-4o-mini', // Cost-effective model for text analysis
    fallback: 'gpt-3.5-turbo',
  },
  limits: {
    maxTokens: 4096,
    maxInputLength: 10000, // characters
    timeout: 30000, // 30 seconds
  },
  retries: {
    maxAttempts: 3,
    backoffMs: 1000,
  },
  pricing: {
    'gpt-4o-mini': {
      input: 0.00015, // per 1K tokens
      output: 0.0006, // per 1K tokens
    },
    'gpt-3.5-turbo': {
      input: 0.001, // per 1K tokens
      output: 0.002, // per 1K tokens
    },
  },
} as const

// Token estimation function
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English, ~6 for Portuguese
  const avgCharsPerToken = 5
  return Math.ceil(text.length / avgCharsPerToken)
}

// Cost estimation function
export function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = OPENAI_SETTINGS.pricing[model as keyof typeof OPENAI_SETTINGS.pricing]
  if (!pricing) return 0
  
  const inputCost = (inputTokens / 1000) * pricing.input
  const outputCost = (outputTokens / 1000) * pricing.output
  return inputCost + outputCost
}

// Health check function
export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_SETTINGS.models.primary,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    })
    return !!response.choices[0]?.message?.content
  } catch (error) {
    console.error('OpenAI health check failed:', error)
    return false
  }
}