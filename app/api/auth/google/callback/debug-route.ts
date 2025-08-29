import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Debug endpoint to check what's happening with Google OAuth
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  console.log('=== GOOGLE OAUTH DEBUG ===')
  console.log('URL:', request.url)
  console.log('Code:', code)
  console.log('All params:', Object.fromEntries(url.searchParams))
  
  // Check environment variables
  console.log('Has GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID)
  console.log('Has GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET)
  
  if (code) {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/api/auth/google/callback/debug`,
          grant_type: 'authorization_code',
        }),
      })
      
      const tokens = await tokenResponse.json()
      console.log('Token response:', tokens)
      
      if (tokens.access_token) {
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })
        
        const googleUser = await userResponse.json()
        console.log('Google user info:', googleUser)
        
        return NextResponse.json({
          success: true,
          googleUser,
          message: 'Check console logs for debug information'
        })
      }
    } catch (error) {
      console.error('Debug error:', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
  }
  
  return NextResponse.json({ 
    error: 'No code provided',
    params: Object.fromEntries(url.searchParams)
  })
}