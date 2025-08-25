import { google } from 'googleapis'

// Google OAuth configuration with validation
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'

// Validate required environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required Google OAuth configuration: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set')
}

// Enforce HTTPS in production (skip during build time)
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  if (!GOOGLE_CALLBACK_URL.startsWith('https://')) {
    throw new Error('Google OAuth callback URL must use HTTPS in production')
  }
  
  if (!GOOGLE_CALLBACK_URL.includes('www.truecheckia.com') && !GOOGLE_CALLBACK_URL.includes('truecheckia.com')) {
    console.warn('[Google OAuth] Warning: Callback URL should use a truecheckia.com domain')
  }
}

console.log('[Google OAuth] Configuration loaded:', {
  clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'missing',
  callbackUrl: GOOGLE_CALLBACK_URL,
  isProduction: process.env.NODE_ENV === 'production'
})

// Initialize OAuth2 client
export const googleOAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
)

// Google OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

/**
 * Generate Google OAuth authorization URL with enhanced security
 */
export function generateGoogleAuthUrl(state?: string) {
  // Add timestamp to state for security validation
  let enhancedState = state
  if (state) {
    try {
      const parsedState = JSON.parse(state)
      enhancedState = JSON.stringify({
        ...parsedState,
        timestamp: Date.now()
      })
    } catch (e) {
      // If state is not JSON, wrap it with timestamp
      enhancedState = JSON.stringify({
        originalState: state,
        timestamp: Date.now()
      })
    }
  }
  
  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true,
    state: enhancedState || undefined,
    // Force consent to ensure we get a refresh token
    prompt: 'consent'
  })
  
  console.log('[Google OAuth] Generated auth URL for callback:', GOOGLE_CALLBACK_URL)
  return authUrl
}

/**
 * Exchange authorization code for tokens with error handling
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    console.log('[Google OAuth] Exchanging code for tokens with callback URL:', GOOGLE_CALLBACK_URL)
    const { tokens } = await googleOAuth2Client.getToken(code)
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google')
    }
    
    console.log('[Google OAuth] Successfully received tokens from Google')
    return tokens
  } catch (error) {
    console.error('[Google OAuth] Error exchanging code for tokens:', error)
    throw new Error(`Failed to exchange authorization code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get user information from Google with enhanced validation
 */
export async function getGoogleUserInfo(accessToken: string) {
  try {
    googleOAuth2Client.setCredentials({ access_token: accessToken })
    
    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()
    
    if (!userInfo.email) {
      throw new Error('Unable to get email from Google - email is required')
    }
    
    if (!userInfo.id) {
      throw new Error('Unable to get user ID from Google - ID is required')
    }
    
    console.log('[Google OAuth] Successfully retrieved user info:', {
      id: userInfo.id,
      email: userInfo.email,
      verified: userInfo.verified_email
    })
    
    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || null,
      picture: userInfo.picture || null,
      verified_email: userInfo.verified_email || false,
    }
  } catch (error) {
    console.error('[Google OAuth] Error getting user info:', error)
    throw new Error(`Failed to get user information from Google: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export interface GoogleUserInfo {
  id: string
  email: string
  name: string | null
  picture: string | null
  verified_email: boolean
}