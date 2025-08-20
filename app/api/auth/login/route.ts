import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { generateTokens, comparePassword } from '../../../lib/auth'
import { validateRequest, createResponse, createErrorResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '../../../lib/middleware'
import { loginSchema, type LoginInput } from '../../../lib/schemas'

async function loginHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { email, password }: LoginInput = await validateRequest(request, loginSchema)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      plan: true,
      role: true,
      credits: true,
      emailVerified: true,
    },
  })

  if (!user) {
    throw new AppError('No account found with this email address.', 401, ERROR_CODES.INVALID_CREDENTIALS)
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password)

  if (!isValidPassword) {
    throw new AppError('Incorrect password. Please check your password and try again.', 401, ERROR_CODES.INVALID_CREDENTIALS)
  }

  // Generate tokens (email verification no longer required)
  const { accessToken, refreshToken } = generateTokens(user)

  return createResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  })
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(loginHandler)
export const OPTIONS = handleOptions