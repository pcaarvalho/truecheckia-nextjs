import { cacheManager, CacheKeys } from '../cache/manager'
import { AppError, ERROR_CODES } from '../middleware'

// Rate limit configurations by plan
export const RATE_LIMITS = {
  FREE: {
    requests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Rate limit exceeded for free plan. Please upgrade to continue.',
  },
  PRO: {
    requests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Rate limit exceeded for pro plan. Please wait before making more requests.',
  },
  ENTERPRISE: {
    requests: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Rate limit exceeded for enterprise plan. Please contact support if you need higher limits.',
  },
  // IP-based rate limiting (for unauthenticated requests)
  IP: {
    requests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP. Please try again later or create an account.',
  },
} as const

// Rate limit result interface
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

// Rate limit manager
export class RateLimitManager {
  // Check user rate limit
  async checkUserRateLimit(
    userId: string,
    plan: keyof typeof RATE_LIMITS
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[plan]
    if (!config) {
      throw new AppError('Invalid plan type', 400, ERROR_CODES.VALIDATION_ERROR)
    }

    const key = CacheKeys.rateLimitUser(userId)
    const windowSeconds = Math.floor(config.windowMs / 1000)
    
    const current = await cacheManager.incrementRateLimit(key, windowSeconds)
    const remaining = Math.max(0, config.requests - current)
    const resetTime = Date.now() + config.windowMs

    return {
      allowed: current <= config.requests,
      remaining,
      resetTime,
      limit: config.requests,
    }
  }

  // Check IP rate limit
  async checkIPRateLimit(ip: string): Promise<RateLimitResult> {
    const config = RATE_LIMITS.IP
    const key = CacheKeys.rateLimitIP(ip)
    const windowSeconds = Math.floor(config.windowMs / 1000)
    
    const current = await cacheManager.incrementRateLimit(key, windowSeconds)
    const remaining = Math.max(0, config.requests - current)
    const resetTime = Date.now() + config.windowMs

    return {
      allowed: current <= config.requests,
      remaining,
      resetTime,
      limit: config.requests,
    }
  }

  // Get rate limit headers for HTTP response
  getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    }
  }

  // Reset user rate limit (for admin use)
  async resetUserRateLimit(userId: string): Promise<void> {
    const key = CacheKeys.rateLimitUser(userId)
    await cacheManager.del(key)
  }

  // Reset IP rate limit (for admin use)
  async resetIPRateLimit(ip: string): Promise<void> {
    const key = CacheKeys.rateLimitIP(ip)
    await cacheManager.del(key)
  }

  // Get current rate limit status without incrementing
  async getUserRateLimitStatus(
    userId: string,
    plan: keyof typeof RATE_LIMITS
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[plan]
    const key = CacheKeys.rateLimitUser(userId)
    
    const current = await cacheManager.getRateLimit(key)
    const remaining = Math.max(0, config.requests - current)
    
    return {
      allowed: current < config.requests,
      remaining,
      resetTime: Date.now() + config.windowMs,
      limit: config.requests,
    }
  }
}

// Export singleton instance
export const rateLimitManager = new RateLimitManager()

// Middleware function for rate limiting
export async function withRateLimit(
  userId: string | null,
  userPlan: string | null,
  clientIP: string
): Promise<RateLimitResult> {
  // If user is authenticated, use user rate limiting
  if (userId && userPlan) {
    const plan = userPlan.toUpperCase() as keyof typeof RATE_LIMITS
    if (plan in RATE_LIMITS) {
      return await rateLimitManager.checkUserRateLimit(userId, plan)
    }
  }
  
  // Fall back to IP rate limiting
  return await rateLimitManager.checkIPRateLimit(clientIP)
}

// Cost-based rate limiting for OpenAI API usage
export class CostRateLimitManager {
  private readonly maxCostPerHour = {
    FREE: 0.01, // $0.01 per hour
    PRO: 0.50, // $0.50 per hour
    ENTERPRISE: 5.00, // $5.00 per hour
  }

  async checkCostRateLimit(
    userId: string,
    plan: keyof typeof this.maxCostPerHour,
    estimatedCost: number
  ): Promise<{ allowed: boolean; remainingCost: number }> {
    const maxCost = this.maxCostPerHour[plan]
    const key = `cost_limit:${userId}:${new Date().getHours()}`
    
    const currentCost = await cacheManager.get<number>(key) || 0
    const newCost = currentCost + estimatedCost
    
    if (newCost > maxCost) {
      return {
        allowed: false,
        remainingCost: Math.max(0, maxCost - currentCost),
      }
    }
    
    // Update cost tracking
    await cacheManager.set(key, newCost, 3600) // 1 hour TTL
    
    return {
      allowed: true,
      remainingCost: maxCost - newCost,
    }
  }

  async recordCost(userId: string, cost: number): Promise<void> {
    const key = `cost_limit:${userId}:${new Date().getHours()}`
    const currentCost = await cacheManager.get<number>(key) || 0
    await cacheManager.set(key, currentCost + cost, 3600)
  }
}

export const costRateLimitManager = new CostRateLimitManager()