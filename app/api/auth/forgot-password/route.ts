import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { validateRequest, createResponse, withErrorHandler, handleOptions } from '@/lib/middleware'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas'
import { sendPasswordResetEmail } from '@/lib/email/resend-client'

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

  // Build reset URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
  
  // Send password reset email asynchronously (non-blocking)
  sendPasswordResetEmail(
    email, 
    user.name || email.split('@')[0], 
    resetUrl
  ).catch(error => {
    console.error('Failed to send password reset email:', error)
    // Don't fail the request if email fails
  })

  return createResponse(
    null,
    true,
    'If an account exists with this email, you will receive password reset instructions.'
  )
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(forgotPasswordHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)