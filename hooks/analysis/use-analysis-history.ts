'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, AnalysisResult, ApiError } from '@/lib/api/client'
import { toast } from 'sonner'

interface AnalysisHistoryState {
  analyses: AnalysisResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalAnalyses: number
    averageAiScore: number
  }
  isLoading: boolean
  error: string | null
}

interface UseAnalysisHistoryReturn extends AnalysisHistoryState {
  loadHistory: (page?: number, limit?: number) => Promise<void>
  refreshHistory: () => Promise<void>
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function useAnalysisHistory(initialPage: number = 1, initialLimit: number = 20): UseAnalysisHistoryReturn {
  const [state, setState] = useState<AnalysisHistoryState>({
    analyses: [],
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0
    },
    stats: {
      totalAnalyses: 0,
      averageAiScore: 0
    },
    isLoading: false,
    error: null
  })

  const updateState = useCallback((updates: Partial<AnalysisHistoryState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const loadHistory = useCallback(async (page: number = state.pagination.page, limit: number = state.pagination.limit) => {
    updateState({ isLoading: true, error: null })

    try {
      console.log('[useAnalysisHistory] Loading history:', { page, limit })

      const result = await apiClient.getAnalysisHistory(page, limit)

      console.log('[useAnalysisHistory] History loaded:', {
        analysesCount: result.analyses.length,
        total: result.pagination.total,
        page: result.pagination.page,
        totalPages: result.pagination.totalPages
      })

      updateState({
        analyses: result.analyses,
        pagination: result.pagination,
        stats: result.stats,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error('[useAnalysisHistory] Failed to load history:', error)
      
      let errorMessage = 'Failed to load analysis history'
      
      if (error instanceof ApiError) {
        errorMessage = error.message
        
        // Handle specific error codes
        switch (error.code) {
          case 'UNAUTHORIZED':
            errorMessage = 'Please login to view your analysis history'
            break
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'Too many requests. Please wait a moment and try again.'
            break
        }
      }

      updateState({
        analyses: [],
        isLoading: false,
        error: errorMessage
      })

      toast.error(errorMessage)
    }
  }, [state.pagination.page, state.pagination.limit, updateState])

  const refreshHistory = useCallback(async () => {
    await loadHistory(1, state.pagination.limit)
  }, [loadHistory, state.pagination.limit])

  // Auto-load on mount
  useEffect(() => {
    loadHistory()
  }, []) // Only run on mount

  const hasNextPage = state.pagination.page < state.pagination.totalPages
  const hasPreviousPage = state.pagination.page > 1

  return {
    ...state,
    loadHistory,
    refreshHistory,
    hasNextPage,
    hasPreviousPage
  }
}