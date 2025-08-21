'use client'

/**
 * Client-side authentication utilities
 */

export interface User {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  role: 'USER' | 'ADMIN'
  credits: number
  emailVerified: boolean
}

export interface AuthValidationResponse {
  success: boolean
  data?: {
    valid: boolean
    user: User
    token: {
      userId: string
      email: string
      role: string
      plan: string
    }
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Clear all authentication data from client
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return
  
  // Clear localStorage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  // Clear any other auth-related data
  localStorage.removeItem('authData')
}

/**
 * Validate current token with the server
 */
export async function validateToken(): Promise<AuthValidationResponse> {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'UNKNOWN', message: 'Token validation failed' }
      }
    }

    return data
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      success: false,
      error: { 
        code: 'NETWORK_ERROR', 
        message: 'Failed to connect to server' 
      }
    }
  }
}

/**
 * Force logout and clear all session data
 */
export async function forceLogout(): Promise<void> {
  try {
    // Call server logout endpoint
    await fetch('/api/auth/force-logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Error during server logout:', error)
  } finally {
    // Always clear local data regardless of server response
    clearAuthData()
  }
}

/**
 * Check if user appears to be authenticated (has local data)
 * Note: This doesn't validate the token, just checks if auth data exists
 */
export function hasAuthData(): boolean {
  if (typeof window === 'undefined') return false
  
  return !!(
    localStorage.getItem('accessToken') || 
    localStorage.getItem('user')
  )
}

/**
 * Get user data from localStorage
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

/**
 * Handle authentication error (e.g., expired token)
 */
export async function handleAuthError(): Promise<void> {
  console.log('Handling authentication error - clearing session and redirecting')
  
  // Clear all auth data
  await forceLogout()
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath)
    
    if (!isAuthPage) {
      window.location.href = `/login?from=${encodeURIComponent(currentPath)}`
    }
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    
    if (data.success && data.data) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data
      
      // Update stored tokens
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      // Update cookie for middleware
      document.cookie = `accessToken=${newAccessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    }
    
    throw new Error('Invalid refresh response')
  } catch (error) {
    console.error('Token refresh error:', error)
    // Clear auth data on refresh failure
    clearAuthData()
    return null
  }
}

/**
 * Check if token is close to expiration (within next hour)
 */
export function isTokenNearExpiry(): boolean {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return true
    
    // Decode JWT payload (basic decode without verification)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = payload.exp - currentTime
    
    // Return true if token expires within next hour
    return timeUntilExpiry < 3600
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true // Assume expired if we can't check
  }
}

/**
 * Redirect to login with current path as return URL
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  
  const currentPath = window.location.pathname
  const returnUrl = currentPath !== '/' ? `?from=${encodeURIComponent(currentPath)}` : ''
  
  window.location.href = `/login${returnUrl}`
}