/**
 * AI DETECTION CONSISTENCY TESTS
 * 
 * Comprehensive test suite to ensure deterministic results
 * and validate the unified AI detection system.
 */

import { detectAIContent, clearAnalysisCache, getCacheStats, healthCheck } from './ai-detection-unified'
import type { DetectionResult } from './ai-detection-unified'

interface TestCase {
  id: string
  text: string
  language: 'pt' | 'en'
  description: string
  expectedRange?: {
    min: number
    max: number
  }
}

interface ConsistencyTestResult {
  testCase: TestCase
  results: DetectionResult[]
  isConsistent: boolean
  scoreVariance: number
  maxDifference: number
  averageScore: number
  averageProcessingTime: number
  errors: string[]
}

interface TestSuite {
  totalTests: number
  passedTests: number
  failedTests: number
  consistencyRate: number
  results: ConsistencyTestResult[]
  overallStats: {
    averageProcessingTime: number
    cacheHitRate: number
    totalTokensUsed: number
    totalCost: number
  }
}

// Test cases covering different scenarios
const TEST_CASES: TestCase[] = [
  // AI-generated text examples (should score high)
  {
    id: 'ai_high_1',
    text: `In conclusion, artificial intelligence has revolutionized many industries. Furthermore, it has enhanced productivity significantly. Moreover, AI technologies continue to evolve rapidly. Additionally, these advancements bring both opportunities and challenges. It is important to note that proper implementation is crucial for success.`,
    language: 'en',
    description: 'AI-generated text with typical AI phrases',
    expectedRange: { min: 70, max: 95 }
  },
  {
    id: 'ai_high_2',
    text: `Em conclusão, a inteligência artificial tem transformado diversos setores. Além disso, tem aumentado significativamente a produtividade. Por outro lado, é importante notar que existem desafios éticos. Portanto, devemos considerar cuidadosamente a implementação dessas tecnologias. Em resumo, o futuro da IA depende de decisões responsáveis.`,
    language: 'pt',
    description: 'Texto gerado por IA com frases típicas',
    expectedRange: { min: 70, max: 95 }
  },

  // Human-written text examples (should score low)
  {
    id: 'human_low_1',
    text: `I can't believe what happened yesterday! My dog somehow managed to open the kitchen door and ate an entire chocolate cake I'd been saving for my mom's birthday. The mess was unreal - chocolate everywhere, even on the ceiling somehow? I'm still trying to figure out how he managed that physics-defying feat.`,
    language: 'en',
    description: 'Personal anecdote with natural language',
    expectedRange: { min: 10, max: 40 }
  },
  {
    id: 'human_low_2',
    text: `Cara, que dia louco hoje! Esqueci a chave do carro dentro dele (genial, né?), choveu no exato momento que saí sem guarda-chuva, e pra fechar com chave de ouro, meu celular decidiu dar pau bem na hora que mais precisava. Às vezes a vida testa nossa paciência mesmo!`,
    language: 'pt',
    description: 'Relato pessoal com linguagem natural',
    expectedRange: { min: 10, max: 40 }
  },

  // Ambiguous cases (medium scores)
  {
    id: 'mixed_medium_1',
    text: `The study of machine learning involves understanding algorithms and data structures. Researchers have developed various approaches to solve complex problems. These methods include supervised learning, unsupervised learning, and reinforcement learning. Each approach has its own advantages and limitations depending on the specific use case.`,
    language: 'en',
    description: 'Technical content that could be human or AI',
    expectedRange: { min: 40, max: 70 }
  },
  {
    id: 'mixed_medium_2',
    text: `O aprendizado de máquina é uma área fundamental da computação moderna. Existem diferentes algoritmos que podem ser aplicados conforme o problema. A escolha do método adequado depende dos dados disponíveis e dos objetivos específicos do projeto. É necessário avaliar cuidadosamente cada abordagem.`,
    language: 'pt',
    description: 'Conteúdo técnico que pode ser humano ou IA',
    expectedRange: { min: 40, max: 70 }
  },

  // Edge cases
  {
    id: 'short_text',
    text: `This is a short text sample for testing minimum length requirements and consistency.`,
    language: 'en',
    description: 'Short text at minimum length',
  },
  {
    id: 'repetitive_text',
    text: `This text has repetitive patterns. This text has repetitive patterns. This text has repetitive patterns. This text has repetitive patterns. This text has repetitive patterns. This text has repetitive patterns.`,
    language: 'en',
    description: 'Highly repetitive text',
    expectedRange: { min: 60, max: 90 }
  },
  {
    id: 'mixed_language_markers',
    text: `This text contains some English words but também tem palavras em português mixed together in a natural way como pessoas realmente falam sometimes when they're bilingual você sabe?`,
    language: 'en',
    description: 'Mixed language content',
  }
]

/**
 * Run consistency test for a single test case
 */
async function runConsistencyTest(
  testCase: TestCase, 
  iterations: number = 5
): Promise<ConsistencyTestResult> {
  const results: DetectionResult[] = []
  const errors: string[] = []

  console.log(`Testing: ${testCase.description} (${iterations} iterations)`)

  for (let i = 0; i < iterations; i++) {
    try {
      // Clear cache before some iterations to test both cached and uncached results
      if (i === Math.floor(iterations / 2)) {
        clearAnalysisCache()
      }

      const result = await detectAIContent(testCase.text, testCase.language)
      results.push(result)

      // Log progress
      if (i === 0) {
        console.log(`  First result: ${result.aiScore}% (${result.confidence}, cached: ${result.cached})`)
      }
    } catch (error) {
      errors.push(`Iteration ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error(`  Error in iteration ${i + 1}:`, error)
    }
  }

  if (results.length === 0) {
    return {
      testCase,
      results: [],
      isConsistent: false,
      scoreVariance: 0,
      maxDifference: 0,
      averageScore: 0,
      averageProcessingTime: 0,
      errors
    }
  }

  // Calculate consistency metrics
  const scores = results.map(r => r.aiScore)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const scoreVariance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
  const maxDifference = Math.max(...scores) - Math.min(...scores)
  const averageProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length

  // Consistency check: max difference should be <= 0.01 (accounting for floating point precision)
  const isConsistent = maxDifference <= 0.01

  // Validate expected range if provided
  if (testCase.expectedRange) {
    const inRange = averageScore >= testCase.expectedRange.min && averageScore <= testCase.expectedRange.max
    if (!inRange) {
      errors.push(`Average score ${averageScore.toFixed(2)} outside expected range [${testCase.expectedRange.min}-${testCase.expectedRange.max}]`)
    }
  }

  console.log(`  Results: avg=${averageScore.toFixed(2)}, variance=${scoreVariance.toFixed(4)}, maxDiff=${maxDifference.toFixed(4)}, consistent=${isConsistent}`)

  return {
    testCase,
    results,
    isConsistent,
    scoreVariance,
    maxDifference,
    averageScore,
    averageProcessingTime,
    errors
  }
}

/**
 * Run complete test suite
 */
export async function runConsistencyTestSuite(
  iterations: number = 5,
  testCases: TestCase[] = TEST_CASES
): Promise<TestSuite> {
  console.log(`\n🧪 Starting AI Detection Consistency Test Suite`)
  console.log(`Tests: ${testCases.length}, Iterations per test: ${iterations}`)
  console.log(`Expected behavior: Same text should produce identical scores\n`)

  // Clear cache at start
  clearAnalysisCache()

  const results: ConsistencyTestResult[] = []
  let totalTokens = 0
  let totalCost = 0
  let cacheHits = 0
  let totalAnalyses = 0

  // Run health check first
  console.log('🏥 Running health check...')
  try {
    const health = await healthCheck()
    console.log(`Health status: ${health.status}`)
    console.log(`Components: ${JSON.stringify(health.components)}`)
  } catch (error) {
    console.warn('Health check failed:', error)
  }

  console.log('\n📊 Running test cases...\n')

  for (const testCase of testCases) {
    try {
      const testResult = await runConsistencyTest(testCase, iterations)
      results.push(testResult)

      // Accumulate stats
      testResult.results.forEach(result => {
        totalTokens += result.tokensUsed || 0
        totalCost += result.estimatedCost || 0
        if (result.cached) cacheHits++
        totalAnalyses++
      })

      // Add small delay between tests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Failed to run test case ${testCase.id}:`, error)
      results.push({
        testCase,
        results: [],
        isConsistent: false,
        scoreVariance: 0,
        maxDifference: 0,
        averageScore: 0,
        averageProcessingTime: 0,
        errors: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    }
  }

  // Calculate overall statistics
  const passedTests = results.filter(r => r.isConsistent && r.errors.length === 0).length
  const failedTests = results.length - passedTests
  const consistencyRate = (passedTests / results.length) * 100
  const averageProcessingTime = results.reduce((sum, r) => sum + r.averageProcessingTime, 0) / results.length
  const cacheHitRate = totalAnalyses > 0 ? (cacheHits / totalAnalyses) * 100 : 0

  const testSuite: TestSuite = {
    totalTests: results.length,
    passedTests,
    failedTests,
    consistencyRate,
    results,
    overallStats: {
      averageProcessingTime,
      cacheHitRate,
      totalTokensUsed: totalTokens,
      totalCost: totalCost
    }
  }

  return testSuite
}

/**
 * Print detailed test results
 */
export function printTestResults(testSuite: TestSuite): void {
  console.log('\n' + '='.repeat(80))
  console.log('🎯 AI DETECTION CONSISTENCY TEST RESULTS')
  console.log('='.repeat(80))

  // Overall summary
  console.log('\n📊 OVERALL SUMMARY:')
  console.log(`Total Tests: ${testSuite.totalTests}`)
  console.log(`Passed: ${testSuite.passedTests} ✅`)
  console.log(`Failed: ${testSuite.failedTests} ❌`)
  console.log(`Consistency Rate: ${testSuite.consistencyRate.toFixed(1)}%`)
  console.log(`Average Processing Time: ${testSuite.overallStats.averageProcessingTime.toFixed(0)}ms`)
  console.log(`Cache Hit Rate: ${testSuite.overallStats.cacheHitRate.toFixed(1)}%`)
  console.log(`Total Tokens Used: ${testSuite.overallStats.totalTokensUsed}`)
  console.log(`Total Estimated Cost: $${testSuite.overallStats.totalCost.toFixed(4)}`)

  // Detailed results
  console.log('\n📋 DETAILED RESULTS:')
  testSuite.results.forEach((result, index) => {
    const status = result.isConsistent && result.errors.length === 0 ? '✅' : '❌'
    console.log(`\n${index + 1}. ${status} ${result.testCase.id} - ${result.testCase.description}`)
    console.log(`   Average Score: ${result.averageScore.toFixed(2)}%`)
    console.log(`   Max Difference: ${result.maxDifference.toFixed(4)}`)
    console.log(`   Score Variance: ${result.scoreVariance.toFixed(4)}`)
    console.log(`   Consistent: ${result.isConsistent ? 'YES' : 'NO'}`)
    
    if (result.results.length > 0) {
      const scores = result.results.map(r => r.aiScore.toFixed(2))
      console.log(`   All Scores: [${scores.join(', ')}]`)
      const cached = result.results.map(r => r.cached ? 'C' : 'N').join('')
      console.log(`   Cache Pattern: ${cached} (C=cached, N=new)`)
    }

    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join('; ')}`)
    }
  })

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  if (testSuite.consistencyRate >= 95) {
    console.log('✅ Excellent consistency! The system is working as expected.')
  } else if (testSuite.consistencyRate >= 80) {
    console.log('⚠️  Good consistency with room for improvement.')
  } else {
    console.log('❌ Poor consistency detected. Review the implementation.')
  }

  if (testSuite.overallStats.cacheHitRate < 40) {
    console.log('📢 Low cache hit rate - consider reviewing cache key generation')
  }

  if (testSuite.overallStats.averageProcessingTime > 3000) {
    console.log('🐌 High processing times detected - consider optimization')
  }

  console.log('\n' + '='.repeat(80))
}

/**
 * Run quick consistency check for development
 */
export async function quickConsistencyCheck(): Promise<boolean> {
  console.log('🚀 Running quick consistency check...')
  
  const quickTests = TEST_CASES.slice(0, 3) // First 3 test cases
  const testSuite = await runConsistencyTestSuite(3, quickTests) // 3 iterations each
  
  printTestResults(testSuite)
  
  return testSuite.consistencyRate >= 95
}

/**
 * Performance benchmark
 */
export async function runPerformanceBenchmark(): Promise<{
  avgProcessingTime: number
  maxProcessingTime: number
  minProcessingTime: number
  tokenEfficiency: number
}> {
  console.log('⚡ Running performance benchmark...')
  
  clearAnalysisCache()
  
  const testTexts = [
    'Short text for testing.',
    'Medium length text with some more content to analyze for performance testing purposes.',
    'This is a longer text sample that contains multiple sentences and paragraphs to test the performance of the AI detection system under various conditions. It includes different types of content and should provide a good benchmark for processing times and resource usage.'
  ]
  
  const results: DetectionResult[] = []
  
  for (const text of testTexts) {
    for (let i = 0; i < 5; i++) {
      const result = await detectAIContent(text, 'en')
      results.push(result)
    }
  }
  
  const processingTimes = results.map(r => r.processingTime)
  const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
  const maxProcessingTime = Math.max(...processingTimes)
  const minProcessingTime = Math.min(...processingTimes)
  
  const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0)
  const totalChars = results.reduce((sum, r) => sum + r.charCount, 0)
  const tokenEfficiency = totalChars / Math.max(totalTokens, 1)
  
  console.log(`Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`)
  console.log(`Max Processing Time: ${maxProcessingTime}ms`)
  console.log(`Min Processing Time: ${minProcessingTime}ms`)
  console.log(`Token Efficiency: ${tokenEfficiency.toFixed(2)} chars/token`)
  
  return {
    avgProcessingTime,
    maxProcessingTime,
    minProcessingTime,
    tokenEfficiency
  }
}

// Export test cases for external use
export { TEST_CASES, type TestCase, type ConsistencyTestResult, type TestSuite }