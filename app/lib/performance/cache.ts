/**
 * Cache configuration and utilities
 */

// Cache headers configuration
export const CACHE_HEADERS = {
  // Static assets - long cache with immutable
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Vary': 'Accept-Encoding'
  },
  
  // API responses - short cache with revalidation
  api: {
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
    'Vary': 'Accept-Encoding, Authorization'
  },
  
  // Pages - medium cache with revalidation
  pages: {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    'Vary': 'Accept-Encoding'
  },
  
  // Dynamic content - no cache
  dynamic: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

// Service Worker caching strategies
export const SW_CACHE_STRATEGIES = {
  // Critical resources - cache first
  critical: {
    strategy: 'cacheFirst',
    cacheName: 'truecheckia-critical',
    maxAgeSeconds: 86400 * 30, // 30 days
    maxEntries: 50
  },
  
  // API calls - network first with fallback
  api: {
    strategy: 'networkFirst',
    cacheName: 'truecheckia-api',
    maxAgeSeconds: 86400, // 1 day
    maxEntries: 100
  },
  
  // Images - cache first with fallback
  images: {
    strategy: 'cacheFirst',
    cacheName: 'truecheckia-images',
    maxAgeSeconds: 86400 * 7, // 7 days
    maxEntries: 200
  },
  
  // Fonts - cache first (immutable)
  fonts: {
    strategy: 'cacheFirst',
    cacheName: 'truecheckia-fonts',
    maxAgeSeconds: 86400 * 365, // 1 year
    maxEntries: 10
  }
}

// Memory cache for client-side data
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  delete(key: string) {
    this.cache.delete(key)
  }
  
  size() {
    return this.cache.size
  }
}

// Global memory cache instance
export const memoryCache = new MemoryCache()

// Cache key generators
export const generateCacheKey = {
  user: (userId: string) => `user:${userId}`,
  analysis: (id: string) => `analysis:${id}`,
  apiResponse: (endpoint: string, params: object = {}) => 
    `api:${endpoint}:${JSON.stringify(params)}`,
  page: (path: string, params: object = {}) => 
    `page:${path}:${JSON.stringify(params)}`
}

// Cache invalidation patterns
export const invalidateCache = {
  user: (userId: string) => {
    const keys = Array.from(memoryCache['cache'].keys())
    keys.filter(key => key.includes(userId)).forEach(key => 
      memoryCache.delete(key)
    )
  },
  
  analysis: () => {
    const keys = Array.from(memoryCache['cache'].keys())
    keys.filter(key => key.startsWith('analysis:')).forEach(key => 
      memoryCache.delete(key)
    )
  },
  
  all: () => memoryCache.clear()
}

// HTTP cache utilities
export const setCacheHeaders = (response: Response, cacheType: keyof typeof CACHE_HEADERS) => {
  const headers = CACHE_HEADERS[cacheType]
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Browser cache management
export const manageBrowserCache = {
  // Clear old caches
  clear: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
  },
  
  // Get cache usage
  getUsage: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate()
    }
    return { usage: 0, quota: 0 }
  }
}