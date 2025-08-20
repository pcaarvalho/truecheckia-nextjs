export interface AnalysisIndicator {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface SuspiciousPart {
  text: string
  score: number
  reason: string
}

export interface AnalysisResult {
  id: string
  aiScore: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  isAiGenerated: boolean
  indicators: AnalysisIndicator[]
  explanation: string
  suspiciousParts: SuspiciousPart[]
  processingTime: number
  wordCount: number
  charCount: number
  language: string
  createdAt: string
}

export interface AnalysisRequest {
  text: string
  language?: 'pt' | 'en'
}

export interface AnalysisResponse {
  success: boolean
  message?: string
  data: AnalysisResult & {
    remainingCredits: number
  }
}

export interface AnalysisHistoryResponse {
  success: boolean
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

export interface UserStats {
  totalAnalyses: number
  averageAiScore: number
  highConfidenceCount: number
  mediumConfidenceCount: number
  lowConfidenceCount: number
  aiGeneratedCount: number
  humanGeneratedCount: number
}

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type Language = 'pt' | 'en'