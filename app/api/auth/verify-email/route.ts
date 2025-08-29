import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokensEdge } from '@/lib/auth-edge'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/lib/middleware'
import { verifyEmailSchema, type VerifyEmailInput } from '@/lib/schemas'

async function verifyEmailHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { token }: VerifyEmailInput = await validateRequest(request, verifyEmailSchema)

  if (!token) {
    throw new AppError('Verification token is required', 400, ERROR_CODES.VALIDATION_ERROR)
  }

  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400, ERROR_CODES.VALIDATION_ERROR)
  }

  // Update user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  })

  // TODO: Send welcome email
  console.log('TODO: Send welcome email to:', user.email)

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokensEdge(user)

  return createResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    },
    accessToken,
    refreshToken,
  }, true, 'Email verified successfully')
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(verifyEmailHandler)
export const OPTIONS = handleOptions