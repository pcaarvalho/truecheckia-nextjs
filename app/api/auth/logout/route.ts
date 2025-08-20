import { NextRequest, NextResponse } from 'next/server'
import { createResponse, withErrorHandler, handleOptions } from '../../../lib/middleware'

async function logoutHandler(request: NextRequest): Promise<NextResponse> {
  // In a production app, you might want to:
  // 1. Invalidate the refresh token in database
  // 2. Add the access token to a blacklist
  // 3. Clear any server-side sessions
  
  // For now, we'll just return success
  // The frontend will handle token removal from localStorage/cookies
  
  return createResponse(
    null,
    true,
    'Logged out successfully'
  )
}

// Export handlers for different HTTP methods
export const POST = withErrorHandler(logoutHandler)
export const OPTIONS = handleOptions