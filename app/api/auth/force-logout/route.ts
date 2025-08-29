import { NextRequest, NextResponse } from 'next/server'
import { createResponse, withErrorHandler, handleOptions } from '@/lib/middleware'

async function forceLogoutHandler(_request: NextRequest): Promise<NextResponse> {
  // Create response with success message
  const response = createResponse(
    null,
    true,
    'Logged out successfully'
  )
  
  // Clear all authentication cookies
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')
  
  // Also set expired cookies to ensure they're cleared
  response.cookies.set('accessToken', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  response.cookies.set('refreshToken', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return response
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(forceLogoutHandler)
export const GET = withErrorHandler(forceLogoutHandler) // Allow GET for convenience
export const OPTIONS = handleOptions