'use client'

import { useState, useCallback } from 'react'
import { apiClient, AnalysisRequest, AnalysisResult, ApiError } from '@/lib/api/client'
import { useAuth } from '@/hooks/auth/use-auth'
import { toast } from 'sonner'

interface AnalysisState {
  result: AnalysisResult | null
  isAnalyzing: boolean
  progress: number
  error: string | null
}

interface UseAnalysisReturn extends AnalysisState {
  analyzeText: (text: string, language?: 'pt' | 'en') => Promise<void>
  resetAnalysis: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const { user, updateUser } = useAuth()
  const [state, setState] = useState<AnalysisState>({
    result: null,
    isAnalyzing: false,
    progress: 0,
    error: null
  })

  const updateState = useCallback((updates: Partial<AnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const analyzeText = useCallback(async (text: string, language: 'pt' | 'en' = 'pt') => {
    // Validate input
    if (!text.trim()) {
      toast.error('Please enter text to analyze')
      return
    }

    if (text.length < 50) {
      toast.error('Text must be at least 50 characters long')
      return
    }

    if (text.length > 10000) {
      toast.error('Text is too long (maximum 10,000 characters)')
      return
    }

    // Check user authentication and credits
    if (!user) {
      toast.error('Please login to analyze content')
      return
    }

    if (user.credits !== undefined && user.credits <= 0) {
      toast.error('Insufficient credits', {
        description: 'Please upgrade your plan to continue analyzing content.',
      })
      return
    }

    // Reset state and start analysis
    updateState({
      result: null,
      isAnalyzing: true,
      progress: 0,
      error: null
    })

    // Simulate progress
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 15, 90)
      }))
    }, 300)

    try {
      // Prepare request data
      const requestData: AnalysisRequest = {
        text: text.trim(),
        language
      }

      console.log('[useAnalysis] Starting analysis with data:', {
        textLength: requestData.text.length,
        language: requestData.language,
        wordCount: requestData.text.split(/\s+/).length
      })

      // Call API
      const analysisResult = await apiClient.analyzeText(requestData)
      
      console.log('[useAnalysis] Analysis completed:', {
        id: analysisResult.id,
        aiScore: analysisResult.aiScore,
        confidence: analysisResult.confidence,
        remainingCredits: analysisResult.remainingCredits
      })

      // Update progress to 100%
      clearInterval(progressInterval)
      updateState({ progress: 100 })

      // Wait a bit to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update user credits if returned
      if (analysisResult.remainingCredits !== undefined && user) {
        updateUser({
          ...user,
          credits: analysisResult.remainingCredits
        })
      }

      // Update state with result
      updateState({
        result: analysisResult,
        isAnalyzing: false,
        progress: 0,
        error: null
      })

      // Show success toast
      toast.success('Analysis completed!', {
        description: `AI probability: ${Math.round(analysisResult.aiScore)}%`,
      })

    } catch (error) {
      console.error('[useAnalysis] Analysis failed:', error)
      
      clearInterval(progressInterval)
      
      let errorMessage = 'Analysis failed. Please try again.'
      let errorDescription = 'Please try again or contact support if the problem persists.'

      if (error instanceof ApiError) {
        errorMessage = error.message
        
        // Handle specific error codes
        switch (error.code) {
          case 'INSUFFICIENT_CREDITS':
            errorDescription = 'Please upgrade your plan to continue analyzing content.'
            break
          case 'VALIDATION_ERROR':
            errorDescription = 'Please check your input and try again.'
            break
          case 'UNAUTHORIZED':
            errorDescription = 'Please login again to continue.'
            break
          case 'RATE_LIMIT_EXCEEDED':
            errorDescription = 'Too many requests. Please wait a moment and try again.'
            break
          default:
            errorDescription = error.details || 'Please try again or contact support if the problem persists.'
        }
      }

      updateState({
        result: null,
        isAnalyzing: false,
        progress: 0,
        error: errorMessage
      })

      toast.error(errorMessage, {
        description: errorDescription,
      })
    }
  }, [user, updateUser, updateState])

  const resetAnalysis = useCallback(() => {
    updateState({
      result: null,
      isAnalyzing: false,
      progress: 0,
      error: null
    })
  }, [updateState])

  return {
    ...state,
    analyzeText,
    resetAnalysis
  }
}