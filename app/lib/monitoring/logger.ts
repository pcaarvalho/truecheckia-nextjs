// Enhanced logging system for TrueCheckIA

export interface LogContext {
  userId?: string
  requestId?: string
  action?: string
  resource?: string
  ip?: string
  userAgent?: string
  duration?: number
  cost?: number
  tokensUsed?: number
  [key: string]: any
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }
  }

  private output(entry: LogEntry): void {
    if (this.isProduction) {
      // In production, output structured JSON logs
      console.log(JSON.stringify(entry))
    } else {
      // In development, output human-readable logs
      const { level, message, timestamp, context } = entry
      const contextStr = context ? ` ${JSON.stringify(context)}` : ''
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`)
    }
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatMessage(LogLevel.INFO, message, context)
    this.output(entry)
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.formatMessage(LogLevel.WARN, message, context)
    this.output(entry)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatMessage(LogLevel.ERROR, message, context)
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    
    this.output(entry)
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.formatMessage(LogLevel.DEBUG, message, context)
      this.output(entry)
    }
  }

  // Specialized logging methods for common use cases
  
  apiRequest(method: string, path: string, context: LogContext): void {
    this.info(`API ${method} ${path}`, {
      ...context,
      action: 'api_request',
      resource: path,
    })
  }

  apiResponse(method: string, path: string, statusCode: number, context: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    const entry = this.formatMessage(
      level,
      `API ${method} ${path} - ${statusCode}`,
      {
        ...context,
        action: 'api_response',
        resource: path,
        statusCode,
      }
    )
    this.output(entry)
  }

  analysisStarted(userId: string, textLength: number, language: string, context?: LogContext): void {
    this.info('Analysis started', {
      ...context,
      userId,
      action: 'analysis_started',
      textLength,
      language,
    })
  }

  analysisCompleted(
    userId: string,
    aiScore: number,
    processingTime: number,
    tokensUsed: number,
    cost: number,
    cached: boolean,
    context?: LogContext
  ): void {
    this.info('Analysis completed', {
      ...context,
      userId,
      action: 'analysis_completed',
      aiScore,
      duration: processingTime,
      tokensUsed,
      cost,
      cached,
    })
  }

  analysisFailed(userId: string, error: Error, context?: LogContext): void {
    this.error('Analysis failed', error, {
      ...context,
      userId,
      action: 'analysis_failed',
    })
  }

  rateLimitExceeded(userId: string | null, ip: string, plan: string, context?: LogContext): void {
    this.warn('Rate limit exceeded', {
      ...context,
      userId: userId || undefined,
      ip,
      plan,
      action: 'rate_limit_exceeded',
    })
  }

  openaiError(error: Error, context?: LogContext): void {
    this.error('OpenAI API error', error, {
      ...context,
      action: 'openai_error',
      service: 'openai',
    })
  }

  cacheHit(key: string, context?: LogContext): void {
    this.debug('Cache hit', {
      ...context,
      action: 'cache_hit',
      cacheKey: key,
    })
  }

  cacheMiss(key: string, context?: LogContext): void {
    this.debug('Cache miss', {
      ...context,
      action: 'cache_miss',
      cacheKey: key,
    })
  }

  userRegistered(userId: string, plan: string, context?: LogContext): void {
    this.info('User registered', {
      ...context,
      userId,
      plan,
      action: 'user_registered',
    })
  }

  planUpgraded(userId: string, fromPlan: string, toPlan: string, context?: LogContext): void {
    this.info('Plan upgraded', {
      ...context,
      userId,
      fromPlan,
      toPlan,
      action: 'plan_upgraded',
    })
  }

  creditsDeducted(userId: string, remainingCredits: number, context?: LogContext): void {
    this.info('Credits deducted', {
      ...context,
      userId,
      remainingCredits,
      action: 'credits_deducted',
    })
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: LogContext): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN
    const entry = this.formatMessage(level, `Security event: ${event}`, {
      ...context,
      action: 'security_event',
      severity,
    })
    this.output(entry)
  }

  performanceMetric(metric: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance metric: ${metric}`, {
      ...context,
      action: 'performance_metric',
      metric,
      value,
      unit,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Request ID generator for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to extract client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

// Middleware helper for logging requests
export function createLogContext(request: Request, userId?: string): LogContext {
  const requestId = generateRequestId()
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return {
    requestId,
    userId,
    ip,
    userAgent,
  }
}