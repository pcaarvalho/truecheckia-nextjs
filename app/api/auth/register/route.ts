import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../lib/prisma'
import { generateTokens, hashPassword } from '../../../lib/auth'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '../../../lib/middleware'
import { registerSchema, type RegisterInput } from '../../../lib/schemas'

// Free credits configuration
const FREE_CREDITS = 10

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { name, email, password }: RegisterInput = await validateRequest(request, registerSchema)

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new AppError('This email is already registered. Please try logging in instead.', 409, ERROR_CODES.EMAIL_EXISTS)
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex')
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      credits: FREE_CREDITS,
      creditsResetAt: new Date(),
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      credits: true,
      emailVerified: true,
    },
  })

  // TODO: Send verification email asynchronously
  // This would be implemented with a queue system or email service
  console.log('TODO: Send verification email to:', email, 'with token:', emailVerificationToken)

  // Generate tokens for immediate login (soft verification)
  const { accessToken, refreshToken } = generateTokens(user)

  return createResponse({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  }, true, 'Account created successfully. You can start using TrueCheckIA immediately!', 201)
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(registerHandler)
export const OPTIONS = handleOptions