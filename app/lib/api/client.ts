export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface AnalysisRequest {
  text: string
  language?: 'pt' | 'en'
}

export interface AnalysisResult {
  id: string
  aiScore: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  isAiGenerated: boolean
  indicators: Array<{
    type: string
    description: string
    severity: string
  }>
  explanation: string
  suspiciousParts: Array<{
    text: string
    score: number
    reason: string
  }>
  processingTime: number
  wordCount: number
  charCount: number
  createdAt: string
}

export interface AnalysisResponse extends ApiResponse<AnalysisResult> {
  data: AnalysisResult & {
    remainingCredits: number
  }
}

export interface AnalysisHistoryResponse extends ApiResponse {
  data: {
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
  }
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string
  private retryAttempts: number = 3
  private retryDelay: number = 1000

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    })

    const responseData: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse response',
      }
    }))

    if (!response.ok || !responseData.success) {
      const error = responseData.error || {
        code: 'UNKNOWN_ERROR',
        message: 'An error occurred'
      }
      
      throw new ApiError(
        error.message,
        response.status,
        error.code,
        error.details
      )
    }

    return responseData.data || responseData as T
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options)
    } catch (error) {
      if (error instanceof ApiError) {
        // Don't retry client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error
        }
      }

      // Retry server errors (5xx) and network errors
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        return this.requestWithRetry<T>(endpoint, options, attempt + 1)
      }

      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  // Analysis-specific methods
  async analyzeText(data: AnalysisRequest): Promise<AnalysisResponse['data']> {
    return this.post<AnalysisResponse['data']>('/analysis', data)
  }

  async getAnalysisHistory(page: number = 1, limit: number = 20): Promise<AnalysisHistoryResponse['data']> {
    return this.get<AnalysisHistoryResponse['data']>(`/analysis/history?page=${page}&limit=${limit}`)
  }

  async getAnalysisById(id: string): Promise<AnalysisResult> {
    return this.get<AnalysisResult>(`/analysis/${id}`)
  }
}

export const apiClient = new ApiClient();