import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateTokens } from '@/lib/auth'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/app/lib/middleware'
import { refreshTokenSchema, type RefreshTokenInput } from '@/app/lib/schemas'

async function refreshHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { refreshToken }: RefreshTokenInput = await validateRequest(request, refreshTokenSchema)

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, ERROR_CODES.VALIDATION_ERROR)
  }

  try {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

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
    const tokens = generateTokens(user)
    
    // Create response
    const response = createResponse(tokens)
    
    // Set secure httpOnly cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days - match JWT expiration
      path: '/'
    })

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_EXPIRED)
  }
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(refreshHandler)
export const OPTIONS = handleOptions