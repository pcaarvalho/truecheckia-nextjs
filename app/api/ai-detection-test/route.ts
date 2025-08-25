import { NextRequest, NextResponse } from 'next/server'
import { detectAIContent, healthCheck, getCacheStats, getDailyCostStats } from '../../lib/ai-detection'
import { validateOpenAIConfig } from '../../lib/ai-config'

/**
 * Test endpoint for AI detection system
 * GET /api/ai-detection-test - System health check and configuration validation
 * POST /api/ai-detection-test - Test AI detection with sample texts
 */

export async function GET() {
  try {
    // Perform comprehensive system check
    const [health, cacheStats, costStats, configValidation] = await Promise.all([
      healthCheck(),
      Promise.resolve(getCacheStats()),
      Promise.resolve(getDailyCostStats()),
      Promise.resolve(validateOpenAIConfig())
    ])

    return NextResponse.json({
      success: true,
      data: {
        health,
        cache: cacheStats,
        costs: costStats,
        config: {
          isValid: configValidation.isValid,
          errors: configValidation.errors
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language = 'pt', testType = 'single' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Text is required and must be a string'
      }, { status: 400 })
    }

    if (testType === 'single') {
      // Single text analysis
      const startTime = Date.now()
      const result = await detectAIContent(text, language)
      const totalTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          analysis: result,
          performance: {
            totalTime,
            apiTime: result.processingTime
          },
          metadata: {
            textLength: text.length,
            language,
            timestamp: new Date().toISOString()
          }
        }
      })
    } else if (testType === 'samples') {
      // Test with predefined samples
      const samples = [
        {
          id: 'human_casual',
          text: 'Cara, que dia louco! Acordei super tarde e quase perdi a reunião. Por sorte consegui entrar no meet em cima da hora. Enfim, pelo menos deu tudo certo no final. Como foi o seu dia?',
          language: 'pt',
          expectedType: 'human'
        },
        {
          id: 'ai_formal',
          text: 'Furthermore, it is important to note that artificial intelligence has become increasingly prevalent in modern society. Moreover, the implementation of AI systems requires careful consideration of various factors. Additionally, organizations must evaluate the potential benefits and risks. In conclusion, AI represents a significant technological advancement.',
          language: 'en',
          expectedType: 'ai'
        },
        {
          id: 'human_technical',
          text: 'Implementei o sistema de cache hoje e cara, que trabalheira! Tive que refatorar um monte de código legado. Mas agora tá funcionando redondinho. A performance melhorou uns 40% fácil.',
          language: 'pt',
          expectedType: 'human'
        },
        {
          id: 'ai_portuguese',
          text: 'É importante considerar que a implementação de sistemas de inteligência artificial requer uma análise cuidadosa. Além disso, devemos avaliar os benefícios e riscos associados. Portanto, é fundamental adotar uma abordagem metodológica. Em conclusão, a IA representa um avanço significativo.',
          language: 'pt',
          expectedType: 'ai'
        }
      ]

      const results = []
      const startTime = Date.now()

      for (const sample of samples) {
        try {
          const analysis = await detectAIContent(sample.text, sample.language)
          results.push({
            id: sample.id,
            expectedType: sample.expectedType,
            analysis,
            correct: (sample.expectedType === 'ai') === analysis.isAiGenerated,
            confidence: analysis.confidence
          })
        } catch (error) {
          results.push({
            id: sample.id,
            expectedType: sample.expectedType,
            error: error instanceof Error ? error.message : 'Analysis failed',
            correct: false
          })
        }
      }

      const totalTime = Date.now() - startTime
      const correctPredictions = results.filter(r => r.correct).length
      const accuracy = (correctPredictions / results.length) * 100

      return NextResponse.json({
        success: true,
        data: {
          results,
          summary: {
            totalSamples: samples.length,
            correctPredictions,
            accuracy: Math.round(accuracy * 100) / 100,
            totalTime,
            averageTimePerSample: Math.round(totalTime / samples.length)
          },
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid testType. Use "single" or "samples"'
    }, { status: 400 })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}