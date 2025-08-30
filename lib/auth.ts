import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

// JWT Payload interface
export interface JWTPayload {
  userId: string
  email: string
  role: 'USER' | 'ADMIN'
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}

/**
 * Generate JWT access and refresh tokens for a user
 */
export function generateTokens(user: any) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'USER',
    plan: user.plan || 'FREE',
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as SignOptions)

  return { accessToken, refreshToken }
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
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