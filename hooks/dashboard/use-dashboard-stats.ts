'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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

interface UseDashboardStatsReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardStats(autoRefresh = false): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setError(null)
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch dashboard stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      // Only show toast on user-initiated actions, not auto-refresh
      if (!autoRefresh) {
        toast.error('Failed to load dashboard stats', {
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    setLoading(true)
    await fetchStats()
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchStats()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  return {
    stats,
    loading,
    error,
    refetch,
  }
}