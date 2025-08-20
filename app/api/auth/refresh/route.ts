import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyRefreshToken, generateTokens } from '../../../lib/auth'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '../../../lib/middleware'
import { refreshTokenSchema, type RefreshTokenInput } from '../../../lib/schemas'

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

    return createResponse(tokens)
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_EXPIRED)
  }
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(refreshHandler)
export const OPTIONS = handleOptions