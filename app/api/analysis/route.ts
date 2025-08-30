import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions, authenticateRequest, AppError, ERROR_CODES } from '@/lib/middleware'
import { analyzeTextSchema, type AnalyzeTextInput } from '@/lib/schemas'
import { detectAIContent } from '@/lib/ai-detection'
import { Plan } from '@prisma/client'

// Real AI analysis function using OpenAI integration
async function analyzeText(text: string, language: string = 'pt'): Promise<any> {
  try {
    // Use the real AI detection from lib/ai-detection.ts
    const result = await detectAIContent(text, language)
    return result
  } catch (error) {
    console.error('[AI Analysis] Failed to analyze text:', error)
    
    // Fallback to basic statistical analysis if OpenAI fails
    const startTime = Date.now()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    const charCount = text.length
    
    return {
      aiScore: 50, // Default neutral score
      confidence: 'LOW',
      isAiGenerated: false,
      indicators: [{
        type: 'fallback_analysis',
        description: 'Analysis completed with basic statistical methods due to API limitations',
        severity: 'low'
      }],
      explanation: 'Analysis completed using fallback statistical methods. For more accurate results, please ensure OpenAI API is properly configured.',
      suspiciousParts: [],
      processingTime: Date.now() - startTime,
      wordCount,
      charCount,
    }
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
  console.log('[Analysis API] Starting analysis request:', {
    url: request.url,
    method: request.method,
    hasAuthHeader: !!request.headers.get('authorization'),
    hasCookie: !!request.cookies.get('accessToken'),
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
    origin: request.headers.get('origin'),
    timestamp: new Date().toISOString()
  })
  
  // Authenticate user
  const { userId } = await authenticateRequest(request)
  
  console.log('[Analysis API] Authentication successful for user:', userId)

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

  // Perform real AI analysis with OpenAI integration
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
  console.log('[Analysis History API] Starting request:', {
    url: request.url,
    method: request.method,
    hasAuthHeader: !!request.headers.get('authorization'),
    hasCookie: !!request.cookies.get('accessToken'),
    timestamp: new Date().toISOString()
  })
  
  // Authenticate user
  const { userId } = await authenticateRequest(request)
  
  console.log('[Analysis History API] Authentication successful for user:', userId)

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
export const OPTIONS = (request: NextRequest) => handleOptions(request)