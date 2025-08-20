import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions, authenticateRequest, AppError, ERROR_CODES } from '../../lib/middleware'
import { analyzeTextSchema, type AnalyzeTextInput } from '../../lib/schemas'

// Mock analysis function - replace with actual AI analysis
async function analyzeText(text: string, language: string = 'pt'): Promise<any> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock analysis result
  const wordCount = text.split(' ').length
  const charCount = text.length
  
  // Simple heuristic for demo purposes
  const aiScore = Math.floor(Math.random() * 100)
  const confidence = aiScore > 80 ? 'HIGH' : aiScore > 50 ? 'MEDIUM' : 'LOW'
  const isAiGenerated = aiScore > 70

  return {
    aiScore,
    confidence,
    isAiGenerated,
    indicators: [
      {
        type: 'repetitive_patterns',
        description: 'Text shows repetitive sentence structures',
        severity: 'medium',
      },
      {
        type: 'vocabulary_complexity',
        description: 'Vocabulary complexity suggests AI generation',
        severity: 'high',
      },
    ],
    explanation: `The text analysis indicates a ${aiScore}% probability of AI generation based on linguistic patterns, vocabulary choices, and structural consistency.`,
    suspiciousParts: [
      {
        text: text.substring(0, 100) + '...',
        score: aiScore,
        reason: 'Unusual sentence structure pattern detected',
      },
    ],
    processingTime: 1000,
    wordCount,
    charCount,
  }
}

async function createAnalysisHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request)

  // Validate request body
  const data = await validateRequest(request, analyzeTextSchema)
  const { text, language } = data

  // Check user credits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credits: true,
      plan: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
  }

  if (user.credits <= 0) {
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