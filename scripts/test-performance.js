#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}

const URL = process.env.TEST_URL || 'http://localhost:3001'
const OUTPUT_PATH = './lighthouse-report.json'

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...')
  console.log('Target URL:', URL)
  
  try {
    // Write lighthouse config
    const configPath = './lighthouse-config.json'
    fs.writeFileSync(configPath, JSON.stringify(LIGHTHOUSE_CONFIG, null, 2))
    
    console.log('⚡ Running Lighthouse...')
    
    // Run Lighthouse
    const lighthouseCmd = `npx lighthouse ${URL} --output=json --output-path=${OUTPUT_PATH} --config-path=${configPath} --chrome-flags="--headless"`
    
    execSync(lighthouseCmd, { stdio: 'inherit' })
    
    // Parse results
    const report = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    const metrics = report.audits
    
    console.log('\n📊 Performance Results:')
    console.log('=========================')
    
    // Core Web Vitals
    console.log('\n🎯 Core Web Vitals:')
    const lcp = metrics['largest-contentful-paint']?.displayValue || 'N/A'
    const fid = metrics['max-potential-fid']?.displayValue || 'N/A'
    const cls = metrics['cumulative-layout-shift']?.displayValue || 'N/A'
    const fcp = metrics['first-contentful-paint']?.displayValue || 'N/A'
    const tti = metrics['interactive']?.displayValue || 'N/A'
    
    console.log(`LCP (Largest Contentful Paint): ${lcp}`)
    console.log(`FCP (First Contentful Paint): ${fcp}`)
    console.log(`TTI (Time to Interactive): ${tti}`)
    console.log(`FID (First Input Delay): ${fid}`)
    console.log(`CLS (Cumulative Layout Shift): ${cls}`)
    
    // Performance Score
    const perfScore = Math.round(report.categories.performance.score * 100)
    console.log(`\n🏆 Performance Score: ${perfScore}/100`)
    
    // Key Metrics Analysis
    console.log('\n📈 Key Metrics:')
    const speed = metrics['speed-index']?.displayValue || 'N/A'
    const totalBlocking = metrics['total-blocking-time']?.displayValue || 'N/A'
    
    console.log(`Speed Index: ${speed}`)
    console.log(`Total Blocking Time: ${totalBlocking}`)
    
    // Resource Analysis
    console.log('\n📦 Resource Analysis:')
    const unusedCSS = metrics['unused-css-rules']
    const unusedJS = metrics['unused-javascript']
    const imageOptim = metrics['uses-optimized-images']
    const textCompression = metrics['uses-text-compression']
    
    if (unusedCSS?.details?.overallSavingsBytes) {
      console.log(`Unused CSS: ${Math.round(unusedCSS.details.overallSavingsBytes / 1024)}KB could be saved`)
    }
    
    if (unusedJS?.details?.overallSavingsBytes) {
      console.log(`Unused JavaScript: ${Math.round(unusedJS.details.overallSavingsBytes / 1024)}KB could be saved`)
    }
    
    // Recommendations
    console.log('\n💡 Optimization Opportunities:')
    const opportunities = report.categories.performance.auditRefs
      .filter(ref => {
        const audit = metrics[ref.id]
        return audit && audit.score !== null && audit.score < 0.9
      })
      .slice(0, 5)
    
    opportunities.forEach(ref => {
      const audit = metrics[ref.id]
      console.log(`- ${audit.title}: ${audit.displayValue || 'Needs improvement'}`)
    })
    
    // Grade Assessment
    console.log('\n🎯 Performance Grade:')
    if (perfScore >= 90) {
      console.log('✅ EXCELLENT (90-100) - Landing page is very fast!')
    } else if (perfScore >= 75) {
      console.log('⚠️  GOOD (75-89) - Landing page performs well but can be improved')
    } else if (perfScore >= 50) {
      console.log('⚠️  NEEDS IMPROVEMENT (50-74) - Landing page has performance issues')
    } else {
      console.log('❌ POOR (0-49) - Landing page has serious performance problems')
    }
    
    // Target Achievement
    console.log('\n🎯 Target Achievement:')
    const fcpValue = parseFloat(fcp?.replace('s', '') || '0')
    const ttiValue = parseFloat(tti?.replace('s', '') || '0')
    
    console.log(`FCP Target (<1.5s): ${fcpValue < 1.5 ? '✅ ACHIEVED' : '❌ MISSED'} (${fcp})`)
    console.log(`TTI Target (<3.0s): ${ttiValue < 3.0 ? '✅ ACHIEVED' : '❌ MISSED'} (${tti})`)
    console.log(`Score Target (>85): ${perfScore > 85 ? '✅ ACHIEVED' : '❌ MISSED'} (${perfScore}/100)`)
    
    // Cleanup
    fs.unlinkSync(configPath)
    
    console.log('\n📁 Detailed report saved to:', OUTPUT_PATH)
    console.log('\n🔧 Performance test completed!')
    
    return {
      score: perfScore,
      fcp: fcpValue,
      tti: ttiValue,
      lcp: parseFloat(lcp?.replace('s', '') || '0')
    }
    
  } catch (error) {
    console.error('❌ Error running performance test:', error.message)
    return null
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceTest().then(results => {
    if (results) {
      console.log('\n✅ Test completed successfully')
      process.exit(0)
    } else {
      console.log('\n❌ Test failed')
      process.exit(1)
    }
  })
}

module.exports = { runPerformanceTest }