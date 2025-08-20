import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createResponse, withErrorHandler, handleOptions, authenticateRequest } from '../../../lib/middleware'

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
      language: true,
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

  // Get user stats
  const stats = await prisma.analysis.aggregate({
    where: { userId },
    _avg: {
      aiScore: true,
    },
    _count: {
      id: true,
    },
  })

  return createResponse({
    analyses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalAnalyses: stats._count.id,
      averageAiScore: Math.round(stats._avg.aiScore || 0),
    },
  })
}

// Export handlers for different HTTP methods
export const GET = withErrorHandler(getAnalysisHistoryHandler)
export const OPTIONS = handleOptions