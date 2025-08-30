/**
 * Standardized cookie configuration for authentication tokens
 * Optimized for production with proper HTTPS/SameSite settings
 */

export interface CookieConfig {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  path: string
  maxAge?: number
  expires?: Date
}

/**
 * Get cookie configuration for authentication tokens
 */
export function getAuthCookieConfig(isProduction: boolean = process.env.NODE_ENV === 'production'): Omit<CookieConfig, 'maxAge' | 'expires'> {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for HTTPS cross-origin
    path: '/'
  }
}

/**
 * Get access token cookie configuration (15 minutes)
 */
export function getAccessTokenCookieConfig(isProduction?: boolean): CookieConfig {
  return {
    ...getAuthCookieConfig(isProduction),
    maxAge: 15 * 60, // 15 minutes - matches JWT expiration
  }
}

/**
 * Get refresh token cookie configuration (7 days)
 */
export function getRefreshTokenCookieConfig(isProduction?: boolean): CookieConfig {
  return {
    ...getAuthCookieConfig(isProduction),
    maxAge: 7 * 24 * 60 * 60, // 7 days
  }
}

/**
 * Get cookie configuration for clearing/expiring cookies
 */
export function getClearCookieConfig(isProduction?: boolean): CookieConfig {
  return {
    ...getAuthCookieConfig(isProduction),
    expires: new Date(0), // Expire immediately
  }
}

/**
 * Log cookie configuration for debugging
 */
export function logCookieConfig(type: 'access' | 'refresh' | 'clear', config: CookieConfig) {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_AUTH === 'true') {
    console.log(`[Cookie Config] ${type.toUpperCase()} token config:`, {
      httpOnly: config.httpOnly,
      secure: config.secure,
      sameSite: config.sameSite,
      path: config.path,
      maxAge: config.maxAge,
      hasExpires: !!config.expires,
      environment: process.env.NODE_ENV,
    })
  }
}