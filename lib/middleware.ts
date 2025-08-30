import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from './auth'
import { z } from 'zod'

// Error codes for consistent error handling
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

// Custom error class
export class AppError extends Error {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = ERROR_CODES.INTERNAL_ERROR) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Create a standardized JSON response
 */
export function createResponse<T>(
  data?: T,
  success: boolean = true,
  message?: string,
  statusCode: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success,
    ...(message && { message }),
    ...(data && { data }),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Validate request body against Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      )
    }
    throw new AppError('Invalid JSON body', 400, ERROR_CODES.VALIDATION_ERROR)
  }
}

/**
 * Authentication middleware for API routes
 */
export async function authenticateRequest(request: NextRequest): Promise<{ userId: string; user: any }> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw new AppError('Access token is required', 401, ERROR_CODES.UNAUTHORIZED)
  }

  try {
    const payload = verifyAccessToken(token)
    // In a real implementation, you might want to verify the user still exists in the database
    return { 
      userId: payload.userId,
      user: payload
    }
  } catch (error) {
    throw new AppError('Invalid or expired token', 401, ERROR_CODES.TOKEN_EXPIRED)
  }
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof AppError) {
        return createErrorResponse(error.message, error.statusCode, error.code)
      }

      // Handle unexpected errors
      return createErrorResponse(
        'An unexpected error occurred',
        500,
        ERROR_CODES.INTERNAL_ERROR
      )
    }
  }
}

/**
 * CORS headers for API responses - production-safe
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction && origin) {
    // In production, only allow specific origins
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://truecheckia.vercel.app',
      'https://truecheckia-nextjs.vercel.app'
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  } else {
    // In development, allow all origins
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

/**
 * Handle OPTIONS requests for CORS preflight - production-safe
 */
export function handleOptions(request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin')
  const isProduction = process.env.NODE_ENV === 'production'
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
  
  if (isProduction && origin) {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://truecheckia.vercel.app',
      'https://truecheckia-nextjs.vercel.app'
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
    }
  } else {
    headers['Access-Control-Allow-Origin'] = '*'
  }
  
  return new NextResponse(null, {
    status: 200,
    headers,
  })
}