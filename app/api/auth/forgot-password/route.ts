import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions } from '../../../lib/middleware'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../../lib/schemas'

async function forgotPasswordHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { email }: ForgotPasswordInput = await validateRequest(request, forgotPasswordSchema)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Don't reveal if email exists for security
    return createResponse(
      null,
      true,
      'If an account exists with this email, you will receive password reset instructions.'
    )
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Save token to user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires,
    },
  })

  // TODO: Send reset email
  // This would be implemented with a queue system or email service
  console.log('TODO: Send password reset email to:', email, 'with token:', resetToken)

  return createResponse(
    null,
    true,
    'If an account exists with this email, you will receive password reset instructions.'
  )
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(forgotPasswordHandler)
export const OPTIONS = handleOptions