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
  
  // Also set expired cookies to ensure they're cleared (production-optimized)
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const
  }
  
  response.cookies.set('accessToken', '', cookieOptions)
  response.cookies.set('refreshToken', '', cookieOptions)

  return response
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(forceLogoutHandler)
export const GET = withErrorHandler(forceLogoutHandler) // Allow GET for convenience
export const OPTIONS = (request: NextRequest) => handleOptions(request)