'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { refreshAccessToken, isTokenNearExpiry } from '../app/lib/auth-client'

interface User {
  id: string
  email: string
  name?: string
  plan?: string
  credits?: number
  role?: string
  emailVerified?: boolean
}

interface LoginResponse {
  success?: boolean
  data?: {
    accessToken: string
    refreshToken: string
    user: User
  }
  accessToken?: string
  refreshToken?: string
  user?: User
}

interface RegisterResponse {
  success?: boolean
  data?: {
    accessToken?: string
    refreshToken?: string
    user?: User
    message?: string
  }
  accessToken?: string
  refreshToken?: string
  user?: User
  message?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<RegisterResponse | void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...')
        
        const token = localStorage.getItem('accessToken')
        const savedUserStr = localStorage.getItem('user')
        
        console.log('[AuthContext] Found stored data:', {
          hasToken: !!token,
          hasUser: !!savedUserStr,
          token: token ? `${token.substring(0, 10)}...` : null
        })
        
        if (token && savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr)
            console.log('[AuthContext] Restoring user session:', savedUser)
            
            // Also restore cookie for middleware - MUST match middleware check
            document.cookie = `accessToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
            
            setUser(savedUser)
            console.log('[AuthContext] User session restored successfully')
          } catch (e) {
            console.error('[AuthContext] Error parsing saved user:', e)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
        } else {
          console.log('[AuthContext] No stored session found')
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Starting login for:', email)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
      
      const loginData: LoginResponse = await response.json()
      
      console.log('[AuthContext] Login response received:', {
        hasSuccess: 'success' in loginData,
        hasData: 'data' in loginData,
      })
      
      // Extract tokens from the correct structure
      let accessToken, refreshToken, user
      
      if (loginData.data) {
        // Backend returns: { success: true, data: { accessToken, refreshToken, user } }
        accessToken = loginData.data.accessToken
        refreshToken = loginData.data.refreshToken
        user = loginData.data.user
      } else if (loginData.accessToken) {
        // Fallback: tokens are directly in loginData
        accessToken = loginData.accessToken
        refreshToken = loginData.refreshToken
        user = loginData.user
      }
      
      console.log('[AuthContext] Extracted login data:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        userEmail: user?.email
      })
      
      if (accessToken && refreshToken && user) {
        console.log('[AuthContext] Login successful, storing tokens and user')
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Also store token in cookie for middleware
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        // Update state
        setUser(user)
        
        console.log('[AuthContext] Login completed successfully, tokens stored in both localStorage and cookies')
      } else {
        console.error('[AuthContext] Invalid login response - missing required fields:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          loginData
        })
        throw new Error('Invalid login response - missing tokens or user data')
      }
    } catch (error) {
      console.error('[AuthContext] Login error details:', error)
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      console.log('[AuthContext] Starting registration')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }
      
      const registerData: RegisterResponse = await response.json()
      
      console.log('[AuthContext] Register response received')
      
      if (registerData) {
        // Extract tokens from the correct structure
        let accessToken, refreshToken, user
        
        if (registerData.data) {
          // Backend returns: { success: true, data: { accessToken, refreshToken, user } }
          accessToken = registerData.data.accessToken
          refreshToken = registerData.data.refreshToken
          user = registerData.data.user
        } else if (registerData.accessToken) {
          // Fallback: tokens are directly in registerData
          accessToken = registerData.accessToken
          refreshToken = registerData.refreshToken
          user = registerData.user
        }
        
        console.log('[AuthContext] Extracted register data:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          userEmail: user?.email
        })
        
        // Auto-login if tokens are returned (soft verification)
        if (accessToken && refreshToken && user) {
          console.log('[AuthContext] Auto-login after registration')
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Also store token in cookie for middleware
          document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
          
          // Update state
          setUser(user)
        }
        
        console.log('[AuthContext] Registration completed successfully')
        return { success: true, data: registerData }
      }
    } catch (error) {
      console.error('[AuthContext] Register error details:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Remove cookie as well
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      setUser(null)
      router.push('/')
    }
  }

  const updateUser = (newUser: User) => {
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  // Proactive token refresh
  const refreshTokenIfNeeded = useCallback(async () => {
    if (!user) return
    
    try {
      if (isTokenNearExpiry()) {
        console.log('[AuthContext] Token near expiry, refreshing proactively...')
        const tokens = await refreshAccessToken()
        
        if (tokens) {
          console.log('[AuthContext] Token refreshed successfully')
        } else {
          console.log('[AuthContext] Token refresh failed, logging out')
          await logout()
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error in proactive token refresh:', error)
    }
  }, [user])

  // Set up periodic token refresh check
  useEffect(() => {
    if (!user) return

    // Check immediately
    refreshTokenIfNeeded()

    // Set up interval for periodic checks (every 30 minutes)
    const interval = setInterval(refreshTokenIfNeeded, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, refreshTokenIfNeeded])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}