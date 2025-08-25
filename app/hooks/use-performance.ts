'use client'

import { useEffect, useState } from 'react'
import { memoryCache, generateCacheKey } from '@/app/lib/performance/cache'
import { initializeCriticalPerformance } from '@/app/lib/performance/critical-css'

// Performance optimization hook
export function usePerformanceOptimization() {
  useEffect(() => {
    // Initialize critical performance optimizations
    initializeCriticalPerformance()

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        
        // Clear cache if memory usage is high
        if (usedMB > 100) {
          memoryCache.clear()
          console.log('[Performance] Cleared memory cache due to high usage')
        }
      }
    }

    const interval = setInterval(monitorMemory, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])
}

// Image optimization hook
export function useImageOptimization() {
  const [supportsWebP, setSupportsWebP] = useState(false)
  const [supportsAVIF, setSupportsAVIF] = useState(false)

  useEffect(() => {
    // Check WebP support
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    setSupportsWebP(webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0)

    // Check AVIF support
    const avifImg = new Image()
    avifImg.onload = () => setSupportsAVIF(true)
    avifImg.onerror = () => setSupportsAVIF(false)
    avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  }, [])

  const getOptimizedSrc = (src: string) => {
    if (supportsAVIF && !src.includes('.svg')) {
      return src.replace(/\.(jpg|jpeg|png)$/, '.avif')
    }
    if (supportsWebP && !src.includes('.svg')) {
      return src.replace(/\.(jpg|jpeg|png)$/, '.webp')
    }
    return src
  }

  return { supportsWebP, supportsAVIF, getOptimizedSrc }
}

// Network optimization hook
export function useNetworkOptimization() {
  const [connectionType, setConnectionType] = useState<string>('4g')
  const [isSlowNetwork, setIsSlowNetwork] = useState(false)

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      const updateConnectionInfo = () => {
        setConnectionType(connection.effectiveType || '4g')
        setIsSlowNetwork(
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.saveData
        )
      }

      updateConnectionInfo()
      connection.addEventListener('change', updateConnectionInfo)

      return () => {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  return { connectionType, isSlowNetwork }
}

// Cache hook for API responses
export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300000 // 5 minutes default
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    // Check cache first
    const cachedData = memoryCache.get(key)
    if (cachedData) {
      setData(cachedData)
      return cachedData
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      memoryCache.set(key, result, ttl)
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [key])

  return { data, loading, error, refetch: fetchData }
}

// Performance budget monitoring
export function usePerformanceBudget() {
  const [violations, setViolations] = useState<any[]>([])

  useEffect(() => {
    const checkBudget = () => {
      if (typeof window !== 'undefined' && (window as any).__PERFORMANCE_METRICS__) {
        const budget = {
          LCP: 2500,
          FID: 100,
          CLS: 0.1,
          FCP: 1800
        }

        const currentViolations = []
        
        for (const metric of (window as any).__PERFORMANCE_METRICS__) {
          const limit = budget[metric.name as keyof typeof budget]
          if (limit && metric.value > limit) {
            currentViolations.push({
              metric: metric.name,
              value: metric.value,
              limit,
              exceeded: metric.value - limit
            })
          }
        }

        setViolations(currentViolations)
      }
    }

    // Check budget after page loads
    setTimeout(checkBudget, 5000)
    
    // Check budget periodically
    const interval = setInterval(checkBudget, 30000)
    return () => clearInterval(interval)
  }, [])

  return violations
}

// Resource preloading hook
export function useResourcePreloading(resources: { href: string; as: string; type?: string }[]) {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      if (resource.type) link.type = resource.type
      document.head.appendChild(link)
    })

    // Cleanup
    return () => {
      resources.forEach(resource => {
        const existingLink = document.querySelector(`link[href="${resource.href}"]`)
        if (existingLink) {
          existingLink.remove()
        }
      })
    }
  }, [resources])
}

// Intersection observer hook for performance
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })

    setObserver(obs)

    return () => {
      obs.disconnect()
    }
  }, [callback, options])

  return observer
}

// Lazy loading visibility hook
export function useLazyVisibility(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const [element, setElement] = useState<HTMLElement | null>(null)

  const observer = useIntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    },
    { threshold }
  )

  useEffect(() => {
    if (element && observer) {
      observer.observe(element)
    }

    return () => {
      if (element && observer) {
        observer.unobserve(element)
      }
    }
  }, [element, observer])

  return { isVisible, setElement }
}