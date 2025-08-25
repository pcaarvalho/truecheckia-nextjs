import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, handleOptions, AppError, ERROR_CODES } from '@/app/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateTokens } from '@/lib/auth'

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
  email_verified: boolean
}

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
  id_token: string
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new AppError('Google OAuth configuration missing', 500, ERROR_CODES.INTERNAL_ERROR)
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('[Google OAuth] Token exchange error:', errorText)
    throw new AppError('Failed to exchange code for tokens', 400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  return tokenResponse.json()
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!userResponse.ok) {
    const errorText = await userResponse.text()
    console.error('[Google OAuth] User info error:', errorText)
    throw new AppError('Failed to get user information', 400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  return userResponse.json()
}

async function googleCallbackHandler(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const stateParam = url.searchParams.get('state')

  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  let redirectPath = '/dashboard'
  let plan: string | undefined

  // Parse state parameter
  if (stateParam) {
    try {
      const state = JSON.parse(stateParam)
      redirectPath = state.redirect || '/dashboard'
      plan = state.plan
    } catch (e) {
      console.warn('[Google OAuth] Failed to parse state parameter:', e)
    }
  }

  // Handle OAuth errors
  if (error) {
    console.error('[Google OAuth] OAuth error:', error)
    let errorCode = 'oauth_failed'
    
    switch (error) {
      case 'access_denied':
        errorCode = 'oauth_denied'
        break
      default:
        errorCode = 'oauth_failed'
    }
    
    const redirectUrl = plan 
      ? `${frontendUrl}/login?error=${errorCode}&plan=${plan}`
      : `${frontendUrl}/login?error=${errorCode}`
    
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    console.error('[Google OAuth] No authorization code received')
    const redirectUrl = plan
      ? `${frontendUrl}/login?error=oauth_failed&plan=${plan}`
      : `${frontendUrl}/login?error=oauth_failed`
    
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${frontendUrl}/api/auth/google/callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    
    // Get user information from Google
    const googleUser = await getUserInfo(tokens.access_token)
    
    console.log('[Google OAuth] User info received:', { 
      email: googleUser.email, 
      name: googleUser.name,
      emailVerified: googleUser.email_verified 
    })

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        credits: true,
        emailVerified: true,
        googleId: true,
      },
    })

    if (user) {
      // Update existing user's Google ID and email verification if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          emailVerified: true,
          name: user.name || googleUser.name, // Only update name if not already set
        },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          credits: true,
          emailVerified: true,
          googleId: true,
        },
      })
      console.log('[Google OAuth] Updated existing user:', user.email)
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          emailVerified: true,
          plan: 'FREE',
          role: 'USER',
          credits: 3, // Free tier gets 3 credits
        },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          credits: true,
          emailVerified: true,
          googleId: true,
        },
      })
      console.log('[Google OAuth] Created new user:', user.email)
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user)
    
    // Create redirect URL with success
    let redirectUrl: string
    const successParams = new URLSearchParams({
      token: accessToken,
      refresh: refreshToken,
      user: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        role: user.role,
        emailVerified: user.emailVerified,
      }),
    })
    
    if (plan) {
      successParams.append('plan', plan)
    }
    
    redirectUrl = `${frontendUrl}/auth/callback?${successParams.toString()}`
    
    console.log('[Google OAuth] Redirecting to:', `${frontendUrl}/auth/callback with tokens`)
    
    // Create response and set cookies
    const response = NextResponse.redirect(redirectUrl)
    
    // Set secure cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('[Google OAuth] Callback error:', error)
    
    let errorCode = 'oauth_failed'
    if (error instanceof AppError) {
      switch (error.code) {
        case ERROR_CODES.INVALID_CREDENTIALS:
          errorCode = 'oauth_token_error'
          break
        default:
          errorCode = 'oauth_failed'
      }
    }
    
    const redirectUrl = plan
      ? `${frontendUrl}/login?error=${errorCode}&plan=${plan}`
      : `${frontendUrl}/login?error=${errorCode}`
    
    return NextResponse.redirect(redirectUrl)
  }
}

// Export handlers for different HTTP methods
export const GET = withErrorHandler(googleCallbackHandler)
export const OPTIONS = handleOptions