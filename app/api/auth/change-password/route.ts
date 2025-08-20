import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { hashPassword, comparePassword } from '../../../lib/auth'
import { validateRequest, createResponse, withErrorHandler, handleOptions, authenticateRequest, AppError, ERROR_CODES } from '../../../lib/middleware'
import { changePasswordSchema, type ChangePasswordInput } from '../../../lib/schemas'

async function changePasswordHandler(request: NextRequest): Promise<NextResponse> {
  // Authenticate user
  const { userId } = await authenticateRequest(request)

  // Validate request body
  const { currentPassword, newPassword }: ChangePasswordInput = await validateRequest(request, changePasswordSchema)

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND)
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password)

  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })

  return createResponse(
    null,
    true,
    'Password changed successfully'
  )
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(changePasswordHandler)
export const OPTIONS = handleOptions