'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles,
  FileText, 
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/layout/header/header'

export default function AnalysisPage() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  const handleAnalysis = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to analyze')
      return
    }

    if (!user || (user.credits !== undefined && user.credits <= 0)) {
      toast.error('Insufficient credits', {
        description: 'Please upgrade your plan to continue analyzing content.',
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setResult(null)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      // TODO: Implement actual API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock result
      const mockResult = {
        aiProbability: Math.floor(Math.random() * 100),
        confidence: Math.random() > 0.5 ? 'High' : 'Medium',
        processingTime: (Math.random() * 3 + 0.5).toFixed(1),
        detectedModel: ['GPT-4', 'Claude', 'Gemini'][Math.floor(Math.random() * 3)],
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        sentences: []
      }

      setProgress(100)
      setTimeout(() => {
        setResult(mockResult)
        setIsAnalyzing(false)
        toast.success('Analysis completed!', {
          description: `AI probability: ${mockResult.aiProbability}%`,
        })
      }, 500)
    } catch (error) {
      setIsAnalyzing(false)
      setProgress(0)
      toast.error('Analysis failed', {
        description: 'Please try again or contact support if the problem persists.',
      })
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600'
    if (probability >= 40) return 'text-yellow-600'
    return 'text-green-600'
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
                    <div className={`text-4xl font-bold ${getProbabilityColor(result.aiProbability)} mb-2`}>
                      {result.aiProbability}%
                    </div>
                    <p className="text-gray-600">AI Probability</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence Level:</span>
                        <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-semibold">{result.processingTime}s</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Detected Model:</span>
                        <span className="font-semibold">{result.detectedModel}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Count:</span>
                        <span className="font-semibold">{result.wordCount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Characters:</span>
                        <span className="font-semibold">{result.characterCount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Date:</span>
                        <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Score</span>
                      <span>{result.confidence}</span>
                    </div>
                    <Progress 
                      value={result.confidence === 'High' ? 90 : result.confidence === 'Medium' ? 60 : 30} 
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
                <p className="text-sm text-gray-600 mb-4">
                  Credits remaining this month
                </p>
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

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  No recent analyses to show.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}