/**
 * AI Detection Demo and Testing Utilities
 * This file provides utilities to demonstrate and test the AI detection capabilities
 */

import { detectAIContent, batchDetectAI } from './ai-detection'

export interface TestSample {
  id: string
  text: string
  language: 'pt' | 'en'
  expectedType: 'human' | 'ai'
  description: string
}

/**
 * Sample texts for testing AI detection
 */
export const TEST_SAMPLES: TestSample[] = [
  // Human-written samples (Portuguese)
  {
    id: 'human_casual_pt',
    text: 'Cara, que dia louco! Acordei super tarde porque o despertador não tocou (ou eu que não ouvi, né? rs). Aí tive que correr pra não perder o ônibus... acabei perdendo mesmo. Tive que pegar um Uber caríssimo! Mas valeu a pena porque o trabalho foi produtivo e ainda encontrei uns amigos no final do dia.',
    language: 'pt',
    expectedType: 'human',
    description: 'Casual Portuguese text with slang and personal experience'
  },
  {
    id: 'human_technical_pt',
    text: 'Implementei o sistema de cache hoje e cara, que trabalheira! Tive que refatorar um monte de código legado que tava uma bagunça. Mas agora tá funcionando redondinho. A performance melhorou uns 40% fácil. O pessoal da equipe ficou impressionado com o resultado.',
    language: 'pt',
    expectedType: 'human',
    description: 'Technical Portuguese text with informal language'
  },
  {
    id: 'human_emotional_pt',
    text: 'Nossa, quando vi a notícia não acreditei... que tristeza! Uma pessoa tão querida e que sempre ajudou todo mundo. Ainda tô processando tudo isso. A vida é muito imprevisível mesmo. Pelo menos ficaram as boas lembranças e todo o bem que ela fez.',
    language: 'pt',
    expectedType: 'human',
    description: 'Emotional Portuguese text with personal feelings'
  },

  // AI-like samples (Portuguese)
  {
    id: 'ai_formal_pt',
    text: 'É importante considerar que a implementação de sistemas de inteligência artificial requer uma análise cuidadosa dos diversos fatores envolvidos. Além disso, devemos avaliar minuciosamente os benefícios e riscos associados a essa tecnologia. Portanto, é fundamental adotar uma abordagem metodológica e estruturada. Em conclusão, a IA representa um avanço tecnológico significativo que demanda planejamento adequado.',
    language: 'pt',
    expectedType: 'ai',
    description: 'Formal Portuguese text with AI-typical structure'
  },
  {
    id: 'ai_repetitive_pt',
    text: 'A sustentabilidade é fundamental para o desenvolvimento sustentável. As empresas sustentáveis devem implementar práticas sustentáveis. É essencial que o desenvolvimento sustentável seja priorizado. A sustentabilidade corporativa promove um futuro sustentável. Portanto, a sustentabilidade deve ser integrada em todas as operações empresariais.',
    language: 'pt',
    expectedType: 'ai',
    description: 'Portuguese text with repetitive vocabulary'
  },

  // Human-written samples (English)
  {
    id: 'human_casual_en',
    text: 'Ugh, what a day! Woke up late again because I stayed up binge-watching that new series. Totally worth it though - the plot twist in episode 6 was INSANE! Almost missed my morning meeting but managed to sneak in just as it started. Boss didn\'t notice, thank god.',
    language: 'en',
    expectedType: 'human',
    description: 'Casual English text with personal experience'
  },
  {
    id: 'human_creative_en',
    text: 'The coffee shop buzzed with the usual morning chaos. Steam hissed from the espresso machine while Sarah fumbled with her keys, already running late. She\'d promised herself yesterday that today would be different - organized, punctual, prepared. Yet here she was again, disheveled and desperate for caffeine.',
    language: 'en',
    expectedType: 'human',
    description: 'Creative English writing with narrative style'
  },

  // AI-like samples (English)
  {
    id: 'ai_formal_en',
    text: 'Furthermore, it is important to note that artificial intelligence has become increasingly prevalent in modern society. Moreover, the implementation of AI systems requires careful consideration of various factors and potential implications. Additionally, organizations must evaluate the benefits and risks associated with AI adoption. In conclusion, artificial intelligence represents a significant technological advancement that requires thoughtful planning and execution.',
    language: 'en',
    expectedType: 'ai',
    description: 'Formal English text with AI transition phrases'
  },
  {
    id: 'ai_structured_en',
    text: 'The benefits of renewable energy are manifold. First, renewable energy sources reduce environmental impact. Second, they provide sustainable long-term solutions. Third, renewable energy creates economic opportunities. Fourth, it enhances energy security. Therefore, renewable energy adoption is essential for sustainable development.',
    language: 'en',
    expectedType: 'ai',
    description: 'Structured English text with numbered points'
  },

  // Edge cases
  {
    id: 'mixed_style_pt',
    text: 'A análise dos dados demonstra claramente que houve um aumento significativo. Mas cara, os números são meio assustadores... Será que a gente tá indo na direção certa? É importante notar que os resultados podem indicar uma tendência preocupante. Enfim, vamos ver no que dá.',
    language: 'pt',
    expectedType: 'human',
    description: 'Mixed formal/informal Portuguese style'
  },
  {
    id: 'technical_human_en',
    text: 'The algorithm performs well in most cases, but there\'s this weird edge case that\'s been bugging me for days. The time complexity should be O(n log n) but sometimes it just... doesn\'t behave. I suspect there\'s something funky happening with the memory allocation. Need to dig deeper into this.',
    language: 'en',
    expectedType: 'human',
    description: 'Technical English with human personality'
  }
]

/**
 * Run comprehensive test suite
 */
export async function runTestSuite(): Promise<{
  results: Array<{
    sample: TestSample
    analysis: any
    correct: boolean
    confidence: string
    processingTime: number
  }>
  summary: {
    totalTests: number
    correctPredictions: number
    accuracy: number
    averageConfidence: string
    averageProcessingTime: number
    byType: {
      human: { total: number; correct: number; accuracy: number }
      ai: { total: number; correct: number; accuracy: number }
    }
    byLanguage: {
      pt: { total: number; correct: number; accuracy: number }
      en: { total: number; correct: number; accuracy: number }
    }
  }
}> {
  console.log('Starting AI Detection Test Suite...')
  const results = []
  
  for (const sample of TEST_SAMPLES) {
    console.log(`Testing: ${sample.id}`)
    try {
      const analysis = await detectAIContent(sample.text, sample.language)
      const correct = (sample.expectedType === 'ai') === analysis.isAiGenerated
      
      results.push({
        sample,
        analysis,
        correct,
        confidence: analysis.confidence,
        processingTime: analysis.processingTime
      })
      
      console.log(`  Result: ${analysis.isAiGenerated ? 'AI' : 'Human'} (${analysis.aiScore}%) - ${correct ? '✓' : '✗'}`)
    } catch (error) {
      console.error(`  Error: ${error}`)
      results.push({
        sample,
        analysis: null,
        correct: false,
        confidence: 'ERROR',
        processingTime: 0
      })
    }
  }
  
  // Calculate summary statistics
  const totalTests = results.length
  const correctPredictions = results.filter(r => r.correct).length
  const accuracy = (correctPredictions / totalTests) * 100
  
  const validResults = results.filter(r => r.analysis !== null)
  const averageProcessingTime = validResults.reduce((sum, r) => sum + r.processingTime, 0) / validResults.length
  
  // Confidence distribution
  const confidenceCounts = validResults.reduce((acc, r) => {
    acc[r.confidence] = (acc[r.confidence] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostCommonConfidence = Object.keys(confidenceCounts).reduce((a, b) => 
    confidenceCounts[a] > confidenceCounts[b] ? a : b
  )
  
  // By type analysis
  const humanSamples = results.filter(r => r.sample.expectedType === 'human')
  const aiSamples = results.filter(r => r.sample.expectedType === 'ai')
  
  // By language analysis
  const ptSamples = results.filter(r => r.sample.language === 'pt')
  const enSamples = results.filter(r => r.sample.language === 'en')
  
  const summary = {
    totalTests,
    correctPredictions,
    accuracy: Math.round(accuracy * 100) / 100,
    averageConfidence: mostCommonConfidence,
    averageProcessingTime: Math.round(averageProcessingTime),
    byType: {
      human: {
        total: humanSamples.length,
        correct: humanSamples.filter(r => r.correct).length,
        accuracy: Math.round((humanSamples.filter(r => r.correct).length / humanSamples.length) * 10000) / 100
      },
      ai: {
        total: aiSamples.length,
        correct: aiSamples.filter(r => r.correct).length,
        accuracy: Math.round((aiSamples.filter(r => r.correct).length / aiSamples.length) * 10000) / 100
      }
    },
    byLanguage: {
      pt: {
        total: ptSamples.length,
        correct: ptSamples.filter(r => r.correct).length,
        accuracy: Math.round((ptSamples.filter(r => r.correct).length / ptSamples.length) * 10000) / 100
      },
      en: {
        total: enSamples.length,
        correct: enSamples.filter(r => r.correct).length,
        accuracy: Math.round((enSamples.filter(r => r.correct).length / enSamples.length) * 10000) / 100
      }
    }
  }
  
  console.log('\n=== TEST SUITE SUMMARY ===')
  console.log(`Overall Accuracy: ${summary.accuracy}% (${correctPredictions}/${totalTests})`)
  console.log(`Human Text Accuracy: ${summary.byType.human.accuracy}%`)
  console.log(`AI Text Accuracy: ${summary.byType.ai.accuracy}%`)
  console.log(`Portuguese Accuracy: ${summary.byLanguage.pt.accuracy}%`)
  console.log(`English Accuracy: ${summary.byLanguage.en.accuracy}%`)
  console.log(`Average Processing Time: ${summary.averageProcessingTime}ms`)
  
  return { results, summary }
}

/**
 * Benchmark processing performance
 */
export async function benchmarkPerformance(): Promise<{
  singleText: { averageTime: number; samples: number }
  batchText: { averageTime: number; samples: number; totalTime: number }
  scalability: Array<{ textLength: number; processingTime: number }>
}> {
  console.log('Running performance benchmarks...')
  
  const sampleText = 'Este é um texto de exemplo para testar a performance do sistema de detecção de IA'
  
  // Single text benchmark
  const singleResults = []
  for (let i = 0; i < 5; i++) {
    const result = await detectAIContent(sampleText, 'pt')
    singleResults.push(result.processingTime)
  }
  
  // Batch benchmark
  const batchTexts = Array(10).fill(null).map((_, i) => ({
    text: `${sampleText} - Variação ${i + 1} para teste em lote`,
    language: 'pt' as const
  }))
  
  const batchStartTime = Date.now()
  const batchResults = await batchDetectAI(batchTexts)
  const batchTotalTime = Date.now() - batchStartTime
  
  // Scalability test with different text lengths
  const scalabilityResults = []
  const baseLengths = [100, 500, 1000, 2000, 5000]
  
  for (const length of baseLengths) {
    const longText = sampleText.repeat(Math.ceil(length / sampleText.length)).substring(0, length)
    const result = await detectAIContent(longText, 'pt')
    scalabilityResults.push({
      textLength: length,
      processingTime: result.processingTime
    })
  }
  
  return {
    singleText: {
      averageTime: Math.round(singleResults.reduce((a, b) => a + b, 0) / singleResults.length),
      samples: singleResults.length
    },
    batchText: {
      averageTime: Math.round(batchResults.reduce((sum, r) => sum + r.processingTime, 0) / batchResults.length),
      samples: batchResults.length,
      totalTime: batchTotalTime
    },
    scalability: scalabilityResults
  }
}

/**
 * Compare old vs new system (demonstration purposes)
 */
export function demonstrateImprovement(): {
  improvements: string[]
  features: string[]
  technicalDetails: string[]
} {
  return {
    improvements: [
      'Replaced fake random scoring with real OpenAI GPT-4 analysis',
      'Added comprehensive statistical analysis for multi-dimensional detection',
      'Implemented intelligent caching system for cost optimization',
      'Added batch processing capabilities for high-volume scenarios',
      'Introduced confidence scoring based on multiple analysis methods',
      'Enhanced error handling with graceful fallbacks',
      'Added comprehensive monitoring and health checking'
    ],
    features: [
      'Real-time AI detection using OpenAI GPT-4',
      'Multi-language support (Portuguese and English)',
      'Statistical pattern analysis (vocabulary diversity, sentence structure)',
      'AI phrase detection with extensive pattern database',
      'Embedding-based analysis for semantic understanding',
      'Cost tracking and daily limit enforcement',
      'Performance monitoring and optimization',
      'Comprehensive test suite with accuracy metrics'
    ],
    technicalDetails: [
      'GPT-4 integration with structured prompts for consistent analysis',
      'Text embedding generation using text-embedding-3-small',
      'Statistical indicators: vocabulary ratio, sentence variance, punctuation patterns',
      'Weighted scoring system combining multiple analysis methods',
      'Memory-efficient caching with automatic cleanup',
      'Rate limiting and batch processing for API optimization',
      'Configurable thresholds and parameters for fine-tuning',
      'Health checking and system monitoring capabilities'
    ]
  }
}