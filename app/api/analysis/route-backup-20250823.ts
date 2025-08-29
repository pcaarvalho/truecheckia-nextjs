import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions, authenticateRequest, AppError, ERROR_CODES } from '@/lib/middleware'
import { analyzeTextSchema } from '@/lib/schemas'
import { Plan } from '@prisma/client'
import { analyzeTextWithOpenAI, fallbackAnalysis } from '@/lib/openai/analyzer'
import { cacheManager } from '@/lib/cache/manager'
import { rateLimitManager, costRateLimitManager, withRateLimit } from '@/lib/rate-limit/manager'
import { logger, createLogContext, getClientIP } from '@/lib/monitoring/logger'
import { sendAnalysisCompleteEmail, sendCreditsLowEmail } from '@/lib/email/resend-client'
// Import OpenAI client health check if needed in future

// Enhanced analysis function with OpenAI integration
async function analyzeText(
  text: string, 
  language: 'pt' | 'en' = 'pt',
  userId: string,
  userPlan: string
): Promise<any> {
  const startTime = Date.now()
  
  // Check cache first
  const cachedResult = await cacheManager.getCachedAnalysis(text, language)
  if (cachedResult) {
    logger.cacheHit(`analysis_${text.substring(0, 50)}...`, { userId })
    return {
      ...cachedResult,
      cached: true,
      processingTime: Date.now() - startTime,
    }
  }
  
  logger.cacheMiss(`analysis_${text.substring(0, 50)}...`, { userId })
  
  let analysisResult
  let usingFallback = false
  
  try {
    // Check OpenAI health status
    const isOpenAIHealthy = await cacheManager.getOpenAIHealth()
    
    if (isOpenAIHealthy === false) {
      // OpenAI is known to be down, use fallback immediately
      logger.warn('Using fallback analysis due to known OpenAI issues', { userId })
      analysisResult = await fallbackAnalysis(text, language)
      usingFallback = true
    } else {
      // Check cost-based rate limiting for OpenAI API
      const planKey = userPlan.toUpperCase() as 'FREE' | 'PRO' | 'ENTERPRISE'
      const costCheck = await costRateLimitManager.checkCostRateLimit(
        userId,
        planKey,
        0.01 // Estimated cost for this analysis
      )
      
      if (!costCheck.allowed) {
        logger.warn('Cost rate limit exceeded, using fallback analysis', { 
          userId, 
          remainingCost: costCheck.remainingCost 
        })
        analysisResult = await fallbackAnalysis(text, language)
        usingFallback = true
      } else {
        // Try OpenAI analysis
        try {
          analysisResult = await analyzeTextWithOpenAI(text, language)
          
          // Record the actual cost
          await costRateLimitManager.recordCost(userId, analysisResult.estimatedCost)
          
          // Update OpenAI health status as good
          await cacheManager.setOpenAIHealth(true)
          
        } catch (error) {
          logger.openaiError(error as Error, { userId })
          
          // Update OpenAI health status as bad
          await cacheManager.setOpenAIHealth(false)
          
          // Fall back to basic analysis
          logger.info('Falling back to basic analysis due to OpenAI error', { userId })
          analysisResult = await fallbackAnalysis(text, language)
          usingFallback = true
        }
      }
    }
    
    // Cache the result (even fallback results)
    await cacheManager.setCachedAnalysis(text, language, {
      ...analysisResult,
      usingFallback,
    })
    
    return {
      ...analysisResult,
      cached: false,
      usingFallback,
    }
    
  } catch (error) {
    logger.analysisFailed(userId, error as Error)
    throw error
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
    
    logger.info('Resetting user credits', {
      userId: user.id,
      plan: user.plan,
      oldCredits: user.credits,
      newCredits: creditsToReset,
    })
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: creditsToReset,
        creditsResetAt: now,
      },
    })
    
    // Invalidate user credits cache
    await cacheManager.invalidateUserCredits(user.id)
    
    return updatedUser
  }
  
  return user
}

async function createAnalysisHandler(request: NextRequest): Promise<NextResponse> {
  const logContext = createLogContext(request)
  const clientIP = getClientIP(request)
  
  console.log('[API] Analysis request started:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });
  
  try {
    // Authenticate user
    console.log('[API] Authenticating request...');
    const { userId } = await authenticateRequest(request)
    console.log('[API] User authenticated:', { userId });
    logContext.userId = userId
    
    logger.apiRequest('POST', '/api/analysis', logContext)
    
    // Validate request body
    const data = await validateRequest(request, analyzeTextSchema)
    const { text, language } = data
    
    logger.analysisStarted(userId, text.length, language || 'pt', logContext)
    
    // Get user and check/reset credits if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        plan: true,
        creditsResetAt: true,
      },
    })
    
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
    }
    
    // Check and reset credits if monthly period has passed
    const updatedUserCredits = await checkAndResetCredits(user)
    if (updatedUserCredits && updatedUserCredits.id === user.id) {
      // Update only the credits and reset date
      user.credits = updatedUserCredits.credits
      user.creditsResetAt = updatedUserCredits.creditsResetAt
    }
    
    // Check rate limiting
    const rateLimitResult = await withRateLimit(userId, user.plan, clientIP)
    
    if (!rateLimitResult.allowed) {
      logger.rateLimitExceeded(userId, clientIP, user.plan, logContext)
      throw new AppError(
        'Rate limit exceeded. Please wait before making more requests.',
        429,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      )
    }
    
    if (!user || user.credits <= 0) {
      throw new AppError(
        'Insufficient credits. Please upgrade your plan.',
        402,
        ERROR_CODES.INSUFFICIENT_CREDITS
      )
    }
    
    // Perform analysis
    const analysisResult = await analyzeText(text, language, userId, user.plan)
    
    // Prepare analysis data for database
    const analysisData = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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
      tokensUsed: analysisResult.tokensUsed || 0,
      estimatedCost: analysisResult.estimatedCost || 0,
      cached: analysisResult.cached || false,
      usingFallback: analysisResult.usingFallback || false,
    }
    
    // Save analysis to database
    const analysis = await prisma.analysis.create({
      data: analysisData,
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
        // Note: These fields will be available after migration
        // tokensUsed: true,
        // estimatedCost: true,
        // cached: true,
        // usingFallback: true,
        createdAt: true,
      },
    })
    
    // Deduct credit only if not cached
    let remainingCredits = user.credits
    if (!analysisResult.cached) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: 1,
          },
        },
      })
      remainingCredits -= 1
      
      logger.creditsDeducted(userId, remainingCredits, logContext)
      
      // Invalidate user credits cache
      await cacheManager.invalidateUserCredits(userId)
    }
    
    // Send analysis complete email asynchronously (only if not cached)
    if (!analysisResult.cached && user && user.email && user.name) {
      const analysisEmailData = {
        text: text.length > 500 ? `${text.substring(0, 500)}...` : text,
        aiProbability: analysisResult.aiScore,
        isAiGenerated: analysisResult.isAiGenerated,
        analysisId: analysis.id,
      }
      
      sendAnalysisCompleteEmail(user.email, user.name, analysisEmailData).catch(error => {
        console.error('Failed to send analysis complete email:', error)
        // Don't fail the analysis if email fails
      })
      
      // Send credits low warning if credits are running low (5 or less)
      if (remainingCredits <= 5 && remainingCredits > 0) {
        sendCreditsLowEmail(user.email, user.name, remainingCredits).catch(error => {
          console.error('Failed to send credits low email:', error)
          // Don't fail the analysis if email fails
        })
      }
    }
    
    // Log successful analysis
    logger.analysisCompleted(
      userId,
      analysisResult.aiScore,
      analysisResult.processingTime,
      analysisResult.tokensUsed || 0,
      analysisResult.estimatedCost || 0,
      analysisResult.cached || false,
      logContext
    )
    
    const response = createResponse({
      ...analysis,
      remainingCredits,
    }, true, 'Analysis completed successfully', 201)
    
    // Add rate limit headers
    const rateLimitHeaders = rateLimitManager.getRateLimitHeaders(rateLimitResult)
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    logger.apiResponse('POST', '/api/analysis', 201, {
      ...logContext,
      duration: Date.now() - parseInt(logContext.requestId?.split('_')[1] || '0'),
    })
    
    return response
    
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500
    logger.apiResponse('POST', '/api/analysis', statusCode, {
      ...logContext,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
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