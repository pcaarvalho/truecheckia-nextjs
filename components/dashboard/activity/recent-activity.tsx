'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RecentAnalysis {
  id: string
  aiScore: number
  confidence: string
  wordCount: number
  createdAt: string
}

interface RecentActivityProps {
  analyses: RecentAnalysis[]
}

export function RecentActivity({ analyses }: RecentActivityProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your latest analysis results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analyses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start analyzing text to see your recent activity here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>
          Your latest analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div 
              key={analysis.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-sm font-medium ${getScoreColor(analysis.aiScore)}`}>
                      {analysis.aiScore}% AI
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={getConfidenceColor(analysis.confidence)}
                    >
                      {analysis.confidence.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span>{analysis.wordCount} words</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}