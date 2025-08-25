import crypto from 'crypto'

// Cache interface for different implementations
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  clear(): Promise<void>
}

// In-memory cache implementation (for development)
class InMemoryCache implements CacheProvider {
  private cache = new Map<string, { value: any; expires: number }>()
  private readonly defaultTTL = 3600 // 1 hour

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTTL): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  // Cleanup expired entries periodically
  startCleanup(intervalMs = 300000): void { // 5 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expires) {
          this.cache.delete(key)
        }
      }
    }, intervalMs)
  }
}

// Redis cache implementation (for production)
class RedisCache implements CacheProvider {
  private redis: any
  private readonly defaultTTL = 3600 // 1 hour

  constructor() {
    // Only import Redis if we're in production or have Redis URL
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { Redis } = require('@upstash/redis')
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
      } catch (error) {
        console.warn('Redis not available, falling back to in-memory cache')
        return new InMemoryCache() as any
      }
    } else {
      console.warn('Redis configuration not found, using in-memory cache')
      return new InMemoryCache() as any
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTTL): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis del error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false
    
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async clear(): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.flushall()
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }
}

// Cache key generators
export const CacheKeys = {
  analysis: (textHash: string, language: string) => `analysis:${textHash}:${language}`,
  userStats: (userId: string) => `user_stats:${userId}`,
  rateLimitUser: (userId: string) => `rate_limit:user:${userId}`,
  rateLimitIP: (ip: string) => `rate_limit:ip:${ip}`,
  openaiHealth: () => 'openai:health',
  userCredits: (userId: string) => `user_credits:${userId}`,
}

// Cache TTL settings (in seconds)
export const CacheTTL = {
  analysis: 7 * 24 * 3600, // 7 days - analysis results are immutable
  userStats: 300, // 5 minutes
  rateLimit: 3600, // 1 hour
  openaiHealth: 60, // 1 minute
  userCredits: 300, // 5 minutes
}

// Generate cache key for text analysis
export function generateTextHash(text: string, language: string): string {
  const content = `${text.trim().toLowerCase()}:${language}`
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
}

// Cache manager singleton
class CacheManager {
  private provider: CacheProvider
  
  constructor() {
    // Choose cache provider based on environment
    if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
      this.provider = new RedisCache()
    } else {
      const inMemoryCache = new InMemoryCache()
      inMemoryCache.startCleanup()
      this.provider = inMemoryCache
    }
  }

  // Analysis caching with deduplication
  async getCachedAnalysis(text: string, language: string) {
    const textHash = generateTextHash(text, language)
    const key = CacheKeys.analysis(textHash, language)
    return await this.provider.get(key)
  }

  async setCachedAnalysis(text: string, language: string, result: any) {
    const textHash = generateTextHash(text, language)
    const key = CacheKeys.analysis(textHash, language)
    await this.provider.set(key, result, CacheTTL.analysis)
  }

  // User stats caching
  async getCachedUserStats(userId: string) {
    const key = CacheKeys.userStats(userId)
    return await this.provider.get(key)
  }

  async setCachedUserStats(userId: string, stats: any) {
    const key = CacheKeys.userStats(userId)
    await this.provider.set(key, stats, CacheTTL.userStats)
  }

  async invalidateUserStats(userId: string) {
    const key = CacheKeys.userStats(userId)
    await this.provider.del(key)
  }

  // Rate limiting cache
  async getRateLimit(key: string): Promise<number> {
    const count = await this.provider.get<number>(key)
    return count || 0
  }

  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    const current = await this.getRateLimit(key)
    const newCount = current + 1
    await this.provider.set(key, newCount, windowSeconds)
    return newCount
  }

  // OpenAI health check cache
  async getOpenAIHealth(): Promise<boolean | null> {
    const key = CacheKeys.openaiHealth()
    return await this.provider.get<boolean>(key)
  }

  async setOpenAIHealth(isHealthy: boolean) {
    const key = CacheKeys.openaiHealth()
    await this.provider.set(key, isHealthy, CacheTTL.openaiHealth)
  }

  // User credits caching
  async getCachedUserCredits(userId: string) {
    const key = CacheKeys.userCredits(userId)
    return await this.provider.get(key)
  }

  async setCachedUserCredits(userId: string, credits: number) {
    const key = CacheKeys.userCredits(userId)
    await this.provider.set(key, credits, CacheTTL.userCredits)
  }

  async invalidateUserCredits(userId: string) {
    const key = CacheKeys.userCredits(userId)
    await this.provider.del(key)
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    return await this.provider.get<T>(key)
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.provider.set(key, value, ttlSeconds)
  }

  async del(key: string): Promise<void> {
    await this.provider.del(key)
  }

  async exists(key: string): Promise<boolean> {
    return await this.provider.exists(key)
  }

  async clear(): Promise<void> {
    await this.provider.clear()
  }

  // Cache statistics
  async getStats() {
    // This would be implemented differently for each provider
    return {
      provider: this.provider.constructor.name,
      available: true,
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Export for testing
export { InMemoryCache, RedisCache }