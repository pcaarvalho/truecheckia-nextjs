import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, withErrorHandler, handleOptions, authenticateRequest } from '@/lib/middleware'

interface DashboardStats {
  totalAnalyses: number
  creditsRemaining: number
  avgAiProbability: number
  lastAnalysisAt: string | null
  avgConfidence: number
  totalWordsProcessed: number
  dailyStats: { date: string; count: number }[]
  confidenceDistribution: { level: string; count: number }[]
  languageStats: { language: string; count: number }[]
  weeklyGrowth: number
  monthlyStats: { month: string; count: number }[]
  recentAnalyses: Array<{
    id: string
    aiScore: number
    confidence: string
    wordCount: number
    createdAt: string
  }>
}

async function getDashboardStatsHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request)

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      creditsResetAt: true,
      plan: true,
    },
  })

  if (!user) {
    return createResponse({ error: 'User not found' }, false, 'User not found', 404)
  }

  // Get date ranges
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  // const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get total analyses count
  const totalAnalyses = await prisma.analysis.count({
    where: { userId },
  })

  // Get last analysis
  const lastAnalysis = await prisma.analysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  // Get aggregated stats
  const analysisStats = await prisma.analysis.aggregate({
    where: { userId },
    _avg: {
      aiScore: true,
    },
    _sum: {
      wordCount: true,
    },
  })

  // Get confidence distribution
  const confidenceDistribution = await prisma.analysis.groupBy({
    by: ['confidence'],
    where: { userId },
    _count: {
      confidence: true,
    },
  })

  // Get language distribution
  const languageStats = await prisma.analysis.groupBy({
    by: ['language'],
    where: { userId },
    _count: {
      language: true,
    },
  })

  // Get daily stats for the last 7 days
  const dailyAnalyses = await prisma.analysis.findMany({
    where: {
      userId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  })

  // Process daily stats
  const dailyStatsMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    dailyStatsMap.set(dateStr, 0)
  }

  dailyAnalyses.forEach(analysis => {
    const dateStr = analysis.createdAt.toISOString().split('T')[0]
    if (dailyStatsMap.has(dateStr)) {
      dailyStatsMap.set(dateStr, (dailyStatsMap.get(dateStr) || 0) + 1)
    }
  })

  const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  // Get weekly growth comparison
  const thisWeekCount = await prisma.analysis.count({
    where: {
      userId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  })

  const previousWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
  const previousWeekCount = await prisma.analysis.count({
    where: {
      userId,
      createdAt: {
        gte: previousWeekStart,
        lt: sevenDaysAgo,
      },
    },
  })

  const weeklyGrowth = previousWeekCount > 0 
    ? ((thisWeekCount - previousWeekCount) / previousWeekCount) * 100 
    : 0

  // Get monthly stats for the last 6 months
  const monthlyAnalyses = await prisma.analysis.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      },
    },
    select: {
      createdAt: true,
    },
  })

  // Process monthly stats
  const monthlyStatsMap = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    monthlyStatsMap.set(monthStr, 0)
  }

  monthlyAnalyses.forEach(analysis => {
    const date = new Date(analysis.createdAt)
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (monthlyStatsMap.has(monthStr)) {
      monthlyStatsMap.set(monthStr, (monthlyStatsMap.get(monthStr) || 0) + 1)
    }
  })

  const monthlyStats = Array.from(monthlyStatsMap.entries()).map(([month, count]) => ({
    month,
    count,
  }))

  // Get recent analyses
  const recentAnalyses = await prisma.analysis.findMany({
    where: { userId },
    select: {
      id: true,
      aiScore: true,
      confidence: true,
      wordCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Calculate average confidence score
  const totalConfidenceWeight = confidenceDistribution.reduce((total, item) => {
    const weight = item.confidence === 'HIGH' ? 3 : item.confidence === 'MEDIUM' ? 2 : 1
    return total + (weight * item._count.confidence)
  }, 0)
  
  const totalConfidenceCount = confidenceDistribution.reduce((total, item) => {
    return total + item._count.confidence
  }, 0)
  
  const avgConfidenceScore = totalConfidenceCount > 0 
    ? totalConfidenceWeight / totalConfidenceCount 
    : 0

  const stats: DashboardStats = {
    totalAnalyses,
    creditsRemaining: user.credits,
    avgAiProbability: Math.round(analysisStats._avg.aiScore || 0),
    lastAnalysisAt: lastAnalysis?.createdAt.toISOString() || null,
    avgConfidence: Math.round(avgConfidenceScore * 100) / 100,
    totalWordsProcessed: analysisStats._sum.wordCount || 0,
    dailyStats,
    confidenceDistribution: confidenceDistribution.map(item => ({
      level: item.confidence,
      count: item._count.confidence,
    })),
    languageStats: languageStats.map(item => ({
      language: item.language === 'pt' ? 'Portuguese' : 'English',
      count: item._count.language,
    })),
    weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
    monthlyStats,
    recentAnalyses: recentAnalyses.map(analysis => ({
      id: analysis.id,
      aiScore: Math.round(analysis.aiScore),
      confidence: analysis.confidence,
      wordCount: analysis.wordCount,
      createdAt: analysis.createdAt.toISOString(),
    })),
  }

  return createResponse(stats, true, 'Dashboard stats retrieved successfully')
}

// Export handlers
export const GET = withErrorHandler(getDashboardStatsHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)