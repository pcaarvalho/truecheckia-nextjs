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
    
    // Create response
    const response = createResponse(tokens)
    
    // Set secure httpOnly cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes - match JWT expiration
      path: '/'
    })

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days - refresh token
      path: '/'
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
export const OPTIONS = handleOptions