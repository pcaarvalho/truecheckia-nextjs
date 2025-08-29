'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  validateToken, 
  forceLogout, 
  handleAuthError, 
  getStoredUser, 
  clearAuthData,
  type User,
  type AuthValidationResponse 
} from '@/lib/auth-client'
import { apiClient } from '@/lib/api-client'

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthActions {
  validateAuth: () => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  refreshAuth: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

/**
 * Enhanced authentication hook with better error handling and state management
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const validateAuth = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result: AuthValidationResponse = await validateToken()
      
      if (result.success && result.data?.valid) {
        setState(prev => ({
          ...prev,
          user: result.data!.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }))
        
        // Store user data for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.data.user))
        }
        
        return true
      } else {
        // Token is invalid or expired - try to refresh before giving up
        if (result.error?.code === 'TOKEN_EXPIRED') {
          try {
            console.log('Token expired, attempting refresh...')
            const refreshToken = localStorage.getItem('refreshToken')
            
            if (refreshToken) {
              const refreshResult = await apiClient.post('/auth/refresh', { refreshToken })
              
              if (refreshResult.success && refreshResult.data) {
                console.log('Token refreshed successfully')
                // Retry validation with new token
                return await validateAuth()
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
          }
        }
        
        // Token is invalid or refresh failed
        const errorMessage = result.error?.message || 'Authentication failed'
        
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        }))
        
        // Clear any stale data
        clearAuthData()
        
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }))
      
      clearAuthData()
      return false
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      await forceLogout()
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Logout error:', error)
      
      // Still clear local state even if server logout failed
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Logout completed with errors',
      }))
    }
  }, [])

  const refreshAuth = useCallback(async (): Promise<void> => {
    await validateAuth()
  }, [validateAuth])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const result = await apiClient.post('/auth/refresh', { refreshToken: storedRefreshToken })
      
      if (result.success && result.data) {
        console.log('Manual token refresh successful')
        // Validate the new token
        return await validateAuth()
      }
      
      throw new Error('Token refresh failed')
    } catch (error) {
      console.error('Manual token refresh failed:', error)
      await handleAuthError()
      return false
    }
  }, [validateAuth])

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Try to get stored user data first for immediate UI update
      const storedUser = getStoredUser()
      if (storedUser) {
        setState(prev => ({
          ...prev,
          user: storedUser,
          isAuthenticated: true,
          isLoading: true, // Still loading because we need to validate
        }))
      }
      
      // Validate with server
      const isValid = await validateAuth()
      
      if (!isValid && storedUser) {
        // If stored user exists but server validation failed, handle auth error
        console.log('Stored user found but server validation failed')
        await handleAuthError()
      }
    }

    initAuth()
  }, [validateAuth])

  // Auto-refresh token periodically (proactive refresh)
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(async () => {
      try {
        // Check if token is close to expiration (refresh 1 hour before expiry)
        const token = localStorage.getItem('accessToken')
        if (!token) return
        
        // Decode JWT to check expiration (basic check without verification)
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = payload.exp - currentTime
        
        // If token expires in less than 1 hour, refresh proactively
        if (timeUntilExpiry < 3600) {
          console.log('Proactively refreshing token before expiration')
          const refreshToken = localStorage.getItem('refreshToken')
          
          if (refreshToken) {
            try {
              await apiClient.post('/auth/refresh', { refreshToken })
              console.log('Token refreshed proactively')
            } catch (error) {
              console.error('Proactive token refresh failed:', error)
              await handleAuthError()
            }
          }
        }
      } catch (error) {
        console.error('Error in token refresh check:', error)
        // Fallback to validation
        const isValid = await validateAuth()
        if (!isValid) {
          console.log('Periodic token validation failed')
          await handleAuthError()
        }
      }
    }, 30 * 60 * 1000) // Check every 30 minutes

    return () => clearInterval(interval)
  }, [state.isAuthenticated, validateAuth])

  return {
    ...state,
    validateAuth,
    logout,
    clearError,
    refreshAuth,
    refreshToken,
  }
}