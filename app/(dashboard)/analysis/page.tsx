'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth/use-auth'
import { useAnalysis } from '@/hooks/analysis/use-analysis'
import { useAnalysisHistory } from '@/hooks/analysis/use-analysis-history'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  FileText, 
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/layout/header/header'

export default function AnalysisPage() {
  const { user } = useAuth()
  const { result, isAnalyzing, progress, analyzeText, resetAnalysis } = useAnalysis()
  const { analyses, stats, refreshHistory, isLoading: historyLoading } = useAnalysisHistory(1, 5)
  const [text, setText] = useState('')
  const [language, setLanguage] = useState<'pt' | 'en'>('pt')

  const handleAnalysis = async () => {
    await analyzeText(text, language)
    // Refresh history after successful analysis
    if (result) {
      await refreshHistory()
    }
  }

  const formatConfidence = (confidence: string) => {
    return confidence.charAt(0).toUpperCase() + confidence.slice(1).toLowerCase()
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toUpperCase()) {
      case 'HIGH': return 'text-green-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence.toUpperCase()) {
      case 'HIGH': return 'default'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'destructive'
      default: return 'outline'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600'
    if (probability >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Content Analysis
          </h1>
          <p className="text-gray-600">
            Paste your content below to detect AI-generated text with advanced machine learning
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Input
                </CardTitle>
                <CardDescription>
                  Enter the text you want to analyze for AI-generated content detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Language:</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
                      className="px-3 py-1 border rounded-md text-sm"
                      disabled={isAnalyzing}
                    >
                      <option value="pt">Portuguese</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Paste your content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  disabled={isAnalyzing}
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                  
                  <Button 
                    onClick={handleAnalysis}
                    disabled={!text.trim() || isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Content
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Result */}
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${getProbabilityColor(result.aiScore)} mb-2`}>
                      {Math.round(result.aiScore)}%
                    </div>
                    <p className="text-gray-600 mb-2">AI Probability</p>
                    <Badge variant={getConfidenceBadgeVariant(result.confidence)}>
                      {formatConfidence(result.confidence)} Confidence
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Generated:</span>
                        <span className={`font-semibold ${result.isAiGenerated ? 'text-red-600' : 'text-green-600'}`}>
                          {result.isAiGenerated ? 'Yes' : 'No'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-semibold">{(result.processingTime / 1000).toFixed(1)}s</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Indicators:</span>
                        <span className="font-semibold">{result.indicators?.length || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Count:</span>
                        <span className="font-semibold">{result.wordCount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Characters:</span>
                        <span className="font-semibold">{result.charCount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Date:</span>
                        <span className="font-semibold">{formatDate(result.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Explanation</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  )}

                  {/* Indicators */}
                  {result.indicators && result.indicators.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Detection Indicators</h4>
                      <div className="space-y-2">
                        {result.indicators.slice(0, 3).map((indicator, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              indicator.severity === 'high' ? 'bg-red-500' :
                              indicator.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <span className="text-gray-600">{indicator.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Score Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Probability Score</span>
                      <span>{Math.round(result.aiScore)}%</span>
                    </div>
                    <Progress 
                      value={result.aiScore} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Your Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {user?.credits !== undefined ? user.credits : '---'}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Credits remaining this month
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Plan: {user?.plan || 'FREE'}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Tips for Better Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Use longer texts (100+ words) for more accurate detection</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Check multiple paragraphs from the same source</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Results over 70% indicate likely AI generation</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Consider context and source when interpreting results</p>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.totalAnalyses}
                    </div>
                    <p className="text-xs text-gray-600">Total Analyses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.averageAiScore}%
                    </div>
                    <p className="text-xs text-gray-600">Avg AI Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Analyses
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshHistory}
                    disabled={historyLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : analyses.length > 0 ? (
                  <div className="space-y-3">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="border-l-2 border-purple-200 pl-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-semibold ${getProbabilityColor(analysis.aiScore)}`}>
                            {Math.round(analysis.aiScore)}% AI
                          </div>
                          <Badge 
                            variant={getConfidenceBadgeVariant(analysis.confidence)}
                            className="text-xs"
                          >
                            {formatConfidence(analysis.confidence)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {analysis.wordCount} words • {formatDate(analysis.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No recent analyses to show.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}