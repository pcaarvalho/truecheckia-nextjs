import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { hashPassword } from '../../../lib/auth'
import { validateRequest, createResponse, withErrorHandler, handleOptions, AppError, ERROR_CODES } from '../../../lib/middleware'
import { resetPasswordSchema, type ResetPasswordInput } from '../../../lib/schemas'

async function resetPasswordHandler(request: NextRequest): Promise<NextResponse> {
  // Validate request body
  const { token, password }: ResetPasswordInput = await validateRequest(request, resetPasswordSchema)

  if (!token || !password) {
    throw new AppError('Token and password are required', 400, ERROR_CODES.VALIDATION_ERROR)
  }

  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, ERROR_CODES.VALIDATION_ERROR)
  }

  // Hash new password
  const hashedPassword = await hashPassword(password)

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  return createResponse(
    null,
    true,
    'Password reset successfully. You can now login with your new password.'
  )
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(resetPasswordHandler)
export const OPTIONS = handleOptions