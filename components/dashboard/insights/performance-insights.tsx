'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PerformanceInsightsProps {
  totalAnalyses: number
  avgAiProbability: number
  avgConfidence: number
  weeklyGrowth: number
  creditsRemaining: number
  plan: string
}

interface Insight {
  type: 'tip' | 'warning' | 'success' | 'info'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function PerformanceInsights({ 
  totalAnalyses, 
  avgAiProbability, 
  avgConfidence, 
  weeklyGrowth,
  creditsRemaining,
  plan 
}: PerformanceInsightsProps) {
  const router = useRouter()

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Usage insights
    if (totalAnalyses === 0) {
      insights.push({
        type: 'tip',
        title: 'Get Started',
        description: 'Start analyzing text to detect AI-generated content and build your usage patterns.',
        action: {
          label: 'Start Analyzing',
          onClick: () => router.push('/analysis')
        }
      })
    } else if (totalAnalyses < 10) {
      insights.push({
        type: 'tip',
        title: 'Building Your Profile',
        description: `You've completed ${totalAnalyses} analyses. Try analyzing different types of content to improve accuracy.`,
      })
    }

    // Growth insights
    if (weeklyGrowth > 50) {
      insights.push({
        type: 'success',
        title: 'High Activity',
        description: `Your usage grew by ${weeklyGrowth.toFixed(1)}% this week. You're actively using TrueCheckIA!`,
      })
    } else if (weeklyGrowth < -20) {
      insights.push({
        type: 'info',
        title: 'Usage Decreased',
        description: `Your usage dropped by ${Math.abs(weeklyGrowth).toFixed(1)}% this week. Consider setting up regular checks.`,
      })
    }

    // AI detection insights
    if (avgAiProbability > 70) {
      insights.push({
        type: 'warning',
        title: 'High AI Detection Rate',
        description: `Your content shows ${avgAiProbability}% average AI probability. Consider reviewing your sources.`,
      })
    } else if (avgAiProbability < 30) {
      insights.push({
        type: 'success',
        title: 'Mostly Human Content',
        description: `Great! Your analyzed content shows only ${avgAiProbability}% average AI probability.`,
      })
    }

    // Confidence insights
    if (avgConfidence < 2) {
      insights.push({
        type: 'tip',
        title: 'Low Confidence Scores',
        description: 'Try analyzing longer, more structured text for higher confidence results.',
      })
    }

    // Credits insights
    if (creditsRemaining < 5 && plan === 'FREE') {
      insights.push({
        type: 'warning',
        title: 'Credits Running Low',
        description: `Only ${creditsRemaining} credits remaining. Consider upgrading for unlimited analyses.`,
        action: {
          label: 'Upgrade Plan',
          onClick: () => router.push('/pricing')
        }
      })
    }

    // Plan insights
    if (plan === 'FREE' && totalAnalyses > 5) {
      insights.push({
        type: 'tip',
        title: 'Consider Upgrading',
        description: 'Unlock unlimited analyses, priority support, and advanced features with a Pro plan.',
        action: {
          label: 'View Plans',
          onClick: () => router.push('/pricing')
        }
      })
    }

    return insights.slice(0, 3) // Show max 3 insights
  }

  const insights = generateInsights()

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <Target className="h-4 w-4" />
      case 'info':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'text-blue-600 dark:text-blue-400'
      case 'warning':
        return 'text-orange-600 dark:text-orange-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'info':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive'
      case 'success':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
          <CardDescription>
            Personalized tips and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No new insights available at the moment
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
          <Lightbulb className="h-5 w-5" />
          <span>Performance Insights</span>
        </CardTitle>
        <CardDescription>
          Personalized tips and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={insight.action.onClick}
                      className="text-xs"
                    >
                      {insight.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}