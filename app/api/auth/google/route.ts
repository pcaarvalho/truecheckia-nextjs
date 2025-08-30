import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/lib/middleware'

async function googleAuthHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Google OAuth is configured
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      throw new AppError('Google OAuth is not configured', 500, ERROR_CODES.INTERNAL_ERROR)
    }

    const url = new URL(request.url)
    const redirectPath = url.searchParams.get('redirect') || '/dashboard'
    const plan = url.searchParams.get('plan')
    
    // Create state parameter with redirect info
    const state = JSON.stringify({ 
      redirect: redirectPath,
      ...(plan && { plan })
    })
    
    const baseUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state
    })

    console.log('[Google OAuth] Redirecting to:', googleAuthUrl)
    return NextResponse.redirect(googleAuthUrl)
  } catch (error) {
    console.error('[Google OAuth] Error initiating OAuth:', error)
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }
}

// Export handlers for different HTTP methods
export const GET = withErrorHandler(googleAuthHandler)
export const OPTIONS = (request: NextRequest) => handleOptions(request)