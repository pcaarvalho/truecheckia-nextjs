'use client'

import { useEffect } from 'react'

export interface Metric {
  id: string
  name: string
  value: number
  delta: number
  entries?: PerformanceEntry[]
}

// Report Web Vitals metrics (compatible with web-vitals v5)
function reportWebVital(metric: any) {
  reportWebVitals({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    entries: metric.entries
  })
}

// Report Web Vitals to multiple analytics services
function reportWebVitals(metric: Metric) {
  // Store metrics globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).__PERFORMANCE_METRICS__ = (window as any).__PERFORMANCE_METRICS__ || []
    ;(window as any).__PERFORMANCE_METRICS__.push(metric)
  }

  // Report to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      custom_map: { metric_id: 'custom_metric' },
      custom_metric: metric.value,
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true
    })
  }

  // Report to Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('trackCustom', 'WebVitals', {
      metric_name: metric.name,
      value: metric.value,
      page_url: window.location.pathname
    })
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      displayValue: `${metric.value.toFixed(2)}ms`,
      rating: getVitalRating(metric.name, metric.value),
      ...metric
    })
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.pathname,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.warn('Failed to report Web Vitals:', error)
    })
  }
}

// Get performance rating based on Web Vitals thresholds
function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    'CLS': { good: 0.1, poor: 0.25 },
    'FID': { good: 100, poor: 300 },
    'FCP': { good: 1800, poor: 3000 },
    'LCP': { good: 2500, poor: 4000 },
    'TTFB': { good: 800, poor: 1800 },
    'INP': { good: 200, poor: 500 }
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Web Vitals component
export function WebVitals() {
  useEffect(() => {
    // Dynamic import of web-vitals library
    import('web-vitals').then((vitals) => {
      vitals.onCLS(reportWebVital)
      vitals.onINP(reportWebVital) // INP replaced FID in v5
      vitals.onFCP(reportWebVital)
      vitals.onLCP(reportWebVital)
      vitals.onTTFB(reportWebVital)
    }).catch(error => {
      console.warn('Failed to load web-vitals:', error)
    })

    // Custom metrics
    if (typeof window !== 'undefined' && window.performance) {
      // Time to Interactive approximation
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            // Simple TTI approximation - when FCP happens and no long tasks
            setTimeout(() => {
              const longTaskEntries = performance.getEntriesByType('longtask')
              const lastLongTask = longTaskEntries[longTaskEntries.length - 1]
              const tti = lastLongTask 
                ? lastLongTask.startTime + lastLongTask.duration
                : entry.startTime
              
              reportWebVitals({
                id: 'custom-tti',
                name: 'TTI',
                value: tti,
                delta: 0
              })
            }, 100)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['paint', 'longtask'] })
      } catch (e) {
        // Some browsers might not support all entry types
        console.warn('Performance observer failed:', e)
      }
    }
  }, [])

  return null // This component doesn't render anything
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window === 'undefined' || !(window as any).__PERFORMANCE_METRICS__) {
    return null
  }

  const metrics = (window as any).__PERFORMANCE_METRICS__
  const budget = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800
  }

  const violations = []
  
  for (const metric of metrics) {
    const limit = budget[metric.name as keyof typeof budget]
    if (limit && metric.value > limit) {
      violations.push({
        metric: metric.name,
        value: metric.value,
        limit,
        exceeded: metric.value - limit
      })
    }
  }

  return violations
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    const logNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        console.log('[Performance] Network Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }
    }

    const logMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('[Performance] Memory Info:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      logNetworkInfo()
      logMemoryInfo()
      
      // Log performance budget violations
      setTimeout(() => {
        const violations = checkPerformanceBudget()
        if (violations && violations.length > 0) {
          console.warn('[Performance] Budget Violations:', violations)
        }
      }, 5000)
    }
  }, [])
}