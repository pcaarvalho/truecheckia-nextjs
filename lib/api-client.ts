/**
 * API Client with automatic token refresh interceptor
 */

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
  }> = []

  constructor() {
    // Use relative URL in production for same-domain API calls
    this.baseURL = typeof window !== 'undefined' 
      ? '/api'  // Client-side: use relative URL
      : process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL}/api`  // Server-side with app URL
        : 'http://localhost:3000/api'  // Fallback for local development
  }

  /**
   * Process failed requests queue after token refresh
   */
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token!)
      }
    })
    
    this.failedQueue = []
  }

  /**
   * Refresh access token using refresh token from httpOnly cookie
   */
  private async refreshToken(): Promise<string> {
    try {
      console.log('[ApiClient] Attempting token refresh:', {
        baseURL: this.baseURL,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'server'
      })
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body - refresh token comes from httpOnly cookie
        credentials: 'include', // Essential for httpOnly cookies
      })
      
      console.log('[ApiClient] Refresh response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ApiClient] Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`)
      }

      const data: ApiResponse<RefreshResponse> = await response.json()
      
      if (!data.success || !data.data) {
        throw new Error('Invalid refresh response')
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data

      // Store access token in localStorage for API requests
      localStorage.setItem('accessToken', newAccessToken)
      
      // Note: refreshToken is automatically set as httpOnly cookie by the server
      // We don't need to handle it manually in the client

      console.log('[ApiClient] Token refresh successful:', {
        newTokenLength: newAccessToken.length
      })
      
      return newAccessToken
    } catch (error) {
      console.error('[ApiClient] Token refresh error:', error)
      // Clear auth data on refresh failure
      this.clearAuthData()
      throw error
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    // Clear httpOnly cookies by calling logout endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      }).catch(() => {
        // If logout fails, try manual cookie clearing
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      })
    }
  }

  /**
   * Get authorization header with current token
   */
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('accessToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Make authenticated request with automatic token refresh
   */
  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    // Add auth header
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    }

    const authHeader = (headers as any)['Authorization'] as string | undefined;
    console.log('[ApiClient] Making request:', {
      url: fullUrl,
      method: options.method || 'GET',
      hasAuthHeader: !!authHeader,
      tokenLength: authHeader ? authHeader.split(' ')[1]?.length : 0,
      timestamp: new Date().toISOString()
    })

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      })

      console.log('[ApiClient] Response received:', {
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString()
      })

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        const token = localStorage.getItem('accessToken')
        
        if (!token) {
          throw new Error('No access token')
        }

        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({
              resolve: (newToken: string) => {
                // Retry request with new token
                this.request<T>(url, {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                }).then(resolve).catch(reject)
              },
              reject,
            })
          })
        }

        this.isRefreshing = true

        try {
          const newToken = await this.refreshToken()
          this.processQueue(null, newToken)
          
          // Retry original request with new token
          return this.request<T>(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })
        } catch (refreshError) {
          this.processQueue(refreshError, null)
          
          // Redirect to login on refresh failure
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath)
            
            if (!isAuthPage) {
              window.location.href = `/login?from=${encodeURIComponent(currentPath)}`
            }
          }
          
          throw refreshError
        } finally {
          this.isRefreshing = false
        }
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export for direct use
export default apiClient