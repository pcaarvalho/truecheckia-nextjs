import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshTokenEdge, generateTokensEdge } from '@/lib/auth-edge'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/lib/middleware'
import { refreshTokenSchema, type RefreshTokenInput } from '@/lib/schemas'

async function refreshHandler(request: NextRequest): Promise<NextResponse> {
  // Get refresh token from httpOnly cookie instead of request body
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, ERROR_CODES.VALIDATION_ERROR)
  }
  
  console.log('[Refresh Handler] Attempting token refresh for cookie token:', {
    hasRefreshToken: !!refreshToken,
    tokenLength: refreshToken?.length || 0,
    userAgent: request.headers.get('user-agent')?.substring(0, 50),
    origin: request.headers.get('origin'),
    timestamp: new Date().toISOString()
  })

  try {
    // Verify refresh token
    const payload = await verifyRefreshTokenEdge(refreshToken)

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
      },
    })

    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
    }

    // Generate new tokens
    const tokens = await generateTokensEdge(user)
    
    console.log('[Refresh Handler] Token refresh successful:', {
      userId: user.id,
      email: user.email,
      newTokenLength: tokens.accessToken.length,
      timestamp: new Date().toISOString()
    })
    
    // Create response with proper CORS headers
    const response = createResponse(tokens)
    
    // Set CORS headers for production
    const origin = request.headers.get('origin')
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else if (!isProduction) {
      response.headers.set('Access-Control-Allow-Origin', '*')
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Cookie settings optimized for production
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/'
    }
    
    // Set secure httpOnly cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 30 * 60, // 30 minutes - match JWT expiration
    })

    response.cookies.set('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days - refresh token
    })

    return response
  } catch (error) {
    console.error('[Refresh Handler] Token refresh failed:', {
      error: error instanceof Error ? error.message : String(error),
      hasRefreshToken: !!refreshToken,
      timestamp: new Date().toISOString()
    })
    throw new AppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_EXPIRED)
  }
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(refreshHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)