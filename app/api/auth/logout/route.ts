import { NextRequest, NextResponse } from 'next/server'
import { createResponse, withErrorHandler, handleOptions } from '@/lib/middleware'

async function logoutHandler(request: NextRequest): Promise<NextResponse> {
  // In a production app, you might want to:
  // 1. Invalidate the refresh token in database
  // 2. Add the access token to a blacklist
  // 3. Clear any server-side sessions
  
  // Create response and clear httpOnly cookies
  const response = createResponse(
    null,
    true,
    'Logged out successfully'
  )
  
  // Clear the httpOnly cookies with production-optimized settings
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    expires: new Date(0), // Expire immediately
    path: '/'
  }
  
  response.cookies.set('accessToken', '', cookieOptions)
  response.cookies.set('refreshToken', '', cookieOptions)
  
  return response
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(logoutHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)