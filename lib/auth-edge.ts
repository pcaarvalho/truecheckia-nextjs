/**
 * Edge Runtime compatible JWT utilities
 * Uses the `jose` library which works in both Edge and Node.js runtimes
 */

import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose'

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

// Convert base64 secrets to Uint8Array for jose
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)
const REFRESH_SECRET_KEY = new TextEncoder().encode(JWT_REFRESH_SECRET)

// JWT Payload interface with index signature for jose compatibility
export interface JWTPayload {
  userId: string
  email: string
  role: 'USER' | 'ADMIN'
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  [key: string]: any // Index signature for jose compatibility
}

// Extended payload for jose compatibility
interface ExtendedJWTPayload extends JoseJWTPayload, JWTPayload {}

/**
 * Convert expiration string to seconds
 */
function expirationToSeconds(expiration: string): number {
  const unit = expiration.slice(-1)
  const value = parseInt(expiration.slice(0, -1))
  
  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 60 * 60 * 24
    case 'w': return value * 60 * 60 * 24 * 7
    default: return value
  }
}

/**
 * Generate JWT access and refresh tokens for a user (Edge Runtime compatible)
 */
export async function generateTokensEdge(user: any) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'USER',
    plan: user.plan || 'FREE',
  }

  const now = Math.floor(Date.now() / 1000)
  const accessTokenExp = now + expirationToSeconds(JWT_EXPIRES_IN)
  const refreshTokenExp = now + expirationToSeconds(JWT_REFRESH_EXPIRES_IN)

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(accessTokenExp)
    .sign(SECRET_KEY)

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(refreshTokenExp)
    .sign(REFRESH_SECRET_KEY)

  return { accessToken, refreshToken }
}

/**
 * Verify JWT access token (Edge Runtime compatible)
 */
export async function verifyAccessTokenEdge(token: string): Promise<JWTPayload> {
  try {
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth Edge Debug] Token verification:', {
        token_length: token?.length || 0,
        token_preview: token ? `${token.substring(0, 30)}...` : 'undefined',
        JWT_SECRET_length: JWT_SECRET?.length || 0,
        JWT_SECRET_preview: JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'undefined',
        runtime: 'edge',
      })
    }
    
    const { payload } = await jwtVerify(token, SECRET_KEY)
    const decoded = payload as ExtendedJWTPayload
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth Edge Debug] Token verification successful:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        plan: decoded.plan,
      })
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth Edge Debug] Token verification failed:', {
        error: error instanceof Error ? error.message : String(error),
        token_length: token?.length || 0,
        JWT_SECRET_length: JWT_SECRET?.length || 0,
        runtime: 'edge',
      })
    }
    throw new Error('Invalid access token')
  }
}

/**
 * Verify JWT refresh token (Edge Runtime compatible)
 */
export async function verifyRefreshTokenEdge(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET_KEY)
    const decoded = payload as ExtendedJWTPayload
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth Edge Debug] Refresh token verification failed:', {
        error: error instanceof Error ? error.message : String(error),
        runtime: 'edge',
      })
    }
    throw new Error('Invalid refresh token')
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Debug logging for JWT secrets (only in development)
 */
if (process.env.NODE_ENV === 'development') {
  console.log('[Auth Edge Debug] Environment variables loaded:', {
    hasJWT_SECRET: !!JWT_SECRET,
    JWT_SECRET_length: JWT_SECRET?.length || 0,
    JWT_SECRET_preview: JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'undefined',
    hasJWT_REFRESH_SECRET: !!JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
    runtime: 'edge-compatible',
  })
}