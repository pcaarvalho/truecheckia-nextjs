import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { createResponse, createErrorResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

async function validateTokenHandler(request: NextRequest): Promise<NextResponse> {
  // Get token from both cookies and authorization header
  const tokenFromCookie = request.cookies.get('accessToken')?.value
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    throw new AppError('Access token is required', 401, ERROR_CODES.UNAUTHORIZED)
  }

  try {
    // Verify the token
    const payload = verifyAccessToken(token)
    
    // Optionally verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        credits: true,
        emailVerified: true,
      },
    })

    if (!user) {
      throw new AppError('User no longer exists', 401, ERROR_CODES.UNAUTHORIZED)
    }

    return createResponse({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        plan: payload.plan,
      }
    }, true, 'Token is valid')
  } catch {
    // Token is invalid or expired
    const response = createErrorResponse('Invalid or expired token', 401, ERROR_CODES.TOKEN_EXPIRED)
    
    // Clear cookies if token came from cookie
    if (tokenFromCookie) {
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
    }
    
    return response
  }
}

// Export handlers for different HTTP methods
export const GET = withErrorHandler(validateTokenHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)