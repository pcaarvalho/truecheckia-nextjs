import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions, authenticateRequest, AppError, ERROR_CODES } from '@/lib/middleware'
import { analyzeTextSchema, type AnalyzeTextInput } from '@/lib/schemas'
import { Plan } from '@prisma/client'

// Enhanced analysis function with more sophisticated heuristics
async function analyzeText(text: string, language: string = 'pt'): Promise<any> {
  const startTime = Date.now()
  
  // Simulate processing time based on text length
  const processingDelay = Math.min(1000 + text.length * 2, 5000)
  await new Promise(resolve => setTimeout(resolve, processingDelay))

  // Enhanced analysis result
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const charCount = text.length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // More sophisticated scoring based on text characteristics
  let aiScore = 0
  const indicators = []
  const suspiciousParts = []
  
  // Check for repetitive patterns
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const vocabularyRatio = uniqueWords.size / words.length
  
  if (vocabularyRatio < 0.5) {
    aiScore += 25
    indicators.push({
      type: 'repetitive_vocabulary',
      description: 'High repetition in vocabulary suggests AI generation',
      severity: 'medium',
    })
  }
  
  // Check sentence length consistency
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
  const sentenceLengthVariance = sentences.reduce((sum, s) => {
    const diff = s.trim().length - avgSentenceLength
    return sum + (diff * diff)
  }, 0) / sentences.length
  
  if (sentenceLengthVariance < 100 && sentences.length > 3) {
    aiScore += 20
    indicators.push({
      type: 'uniform_sentence_length',
      description: 'Uniform sentence lengths indicate potential AI generation',
      severity: 'high',
    })
  }
  
  // Check for common AI patterns
  const aiPhrases = [
    'in conclusion', 'furthermore', 'moreover', 'additionally',
    'it is important to note', 'it should be noted', 'overall'
  ]
  
  const foundAiPhrases = aiPhrases.filter(phrase => 
    text.toLowerCase().includes(phrase)
  )
  
  if (foundAiPhrases.length > 2) {
    aiScore += 15
    indicators.push({
      type: 'ai_common_phrases',
      description: 'Contains common AI-generated phrases',
      severity: 'medium',
    })
  }
  
  // Add randomness to simulate model uncertainty
  aiScore += Math.random() * 30 - 15
  aiScore = Math.max(0, Math.min(100, aiScore))
  
  const confidence = aiScore > 80 ? 'HIGH' : aiScore > 50 ? 'MEDIUM' : 'LOW'
  const isAiGenerated = aiScore > 70
  
  // Find suspicious parts
  if (foundAiPhrases.length > 0) {
    suspiciousParts.push({
      text: foundAiPhrases[0],
      score: Math.min(aiScore + 10, 100),
      reason: 'Common AI-generated phrase detected',
    })
  }
  
  const explanation = `Analysis completed with ${Math.round(aiScore)}% AI probability. ${
    indicators.length > 0 
      ? `Detected ${indicators.length} indicator(s) of potential AI generation including ${indicators[0].description.toLowerCase()}.`
      : 'No strong indicators of AI generation found.'
  } The text contains ${wordCount} words across ${sentences.length} sentences with ${language === 'pt' ? 'Portuguese' : 'English'} characteristics.`

  return {
    aiScore: Math.round(aiScore * 100) / 100, // Round to 2 decimal places
    confidence,
    isAiGenerated,
    indicators,
    explanation,
    suspiciousParts,
    processingTime: Date.now() - startTime,
    wordCount,
    charCount,
  }
}

// Helper function to reset credits if needed
async function checkAndResetCredits(user: { id: string; credits: number; plan: Plan; creditsResetAt: Date }) {
  const now = new Date()
  const creditsResetAt = new Date(user.creditsResetAt)
  
  // Check if a month has passed since last reset
  const monthsDiff = (now.getFullYear() - creditsResetAt.getFullYear()) * 12 + 
                    (now.getMonth() - creditsResetAt.getMonth())
  
  if (monthsDiff >= 1) {
    // Reset credits based on plan
    const creditsToReset = user.plan === 'PRO' ? 1000 : user.plan === 'ENTERPRISE' ? 10000 : 10
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: creditsToReset,
        creditsResetAt: now,
      },
    })
    
    return updatedUser
  }
  
  return user
}

async function createAnalysisHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request)

  // Validate request body
  const data = await validateRequest(request, analyzeTextSchema)
  const { text, language } = data

  // Get user and check/reset credits if needed
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credits: true,
      plan: true,
      creditsResetAt: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
  }

  // Check and reset credits if monthly period has passed
  user = await checkAndResetCredits(user)

  if (!user || user.credits <= 0) {
    throw new AppError('Insufficient credits. Please upgrade your plan.', 402, ERROR_CODES.INSUFFICIENT_CREDITS)
  }

  // Perform analysis
  const analysisResult = await analyzeText(text, language)

  // Save analysis to database and deduct credit
  const analysis = await prisma.analysis.create({
    data: {
      userId: user.id,
      text,
      language,
      aiScore: analysisResult.aiScore,
      confidence: analysisResult.confidence,
      isAiGenerated: analysisResult.isAiGenerated,
      indicators: analysisResult.indicators,
      explanation: analysisResult.explanation,
      suspiciousParts: analysisResult.suspiciousParts,
      processingTime: analysisResult.processingTime,
      wordCount: analysisResult.wordCount,
      charCount: analysisResult.charCount,
    },
    select: {
      id: true,
      aiScore: true,
      confidence: true,
      isAiGenerated: true,
      indicators: true,
      explanation: true,
      suspiciousParts: true,
      processingTime: true,
      wordCount: true,
      charCount: true,
      createdAt: true,
    },
  })

  // Deduct credit
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: 1,
      },
    },
  })

  return createResponse({
    ...analysis,
    remainingCredits: user.credits - 1,
  }, true, 'Analysis completed successfully', 201)
}

async function getAnalysisHistoryHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request)

  // Get query parameters for pagination
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  const skip = (page - 1) * limit

  // Get user's analysis history
  const analyses = await prisma.analysis.findMany({
    where: { userId },
    select: {
      id: true,
      aiScore: true,
      confidence: true,
      isAiGenerated: true,
      explanation: true,
      processingTime: true,
      wordCount: true,
      charCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })

  // Get total count for pagination
  const total = await prisma.analysis.count({
    where: { userId },
  })

  return createResponse({
    analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(createAnalysisHandler)
export const GET = withErrorHandler(getAnalysisHistoryHandler)
export const OPTIONS = handleOptions