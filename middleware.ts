import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessTokenEdge, type JWTPayload } from './lib/auth-edge';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/analysis', '/history', '/profile', '/settings'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/auth-test'];

// Routes that should never redirect (to prevent loops)
const noRedirectRoutes = ['/api', '/_next', '/favicon.ico', '/manifest.json'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Processing request for:', pathname);

  // Skip middleware for API routes and static files
  if (noRedirectRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route === '/' && pathname === '/')
  );

  // Get authentication token from both cookies and authorization header
  const tokenFromCookie = request.cookies.get('accessToken')?.value;
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  const token = tokenFromCookie || tokenFromHeader;

  console.log('[Middleware] Initial auth check:', {
    pathname,
    isProtectedRoute,
    isPublicRoute,
    hasTokenFromCookie: !!tokenFromCookie,
    hasTokenFromHeader: !!tokenFromHeader,
    hasAnyToken: !!token
  });

  // Validate token if it exists
  let isValidToken = false;
  let tokenPayload: JWTPayload | null = null;
  
  if (token) {
    try {
      tokenPayload = await verifyAccessTokenEdge(token);
      isValidToken = true;
      console.log('[Middleware] Token validation successful:', {
        userId: tokenPayload.userId,
        email: tokenPayload.email,
        role: tokenPayload.role,
        plan: tokenPayload.plan
      });
    } catch (error) {
      console.log('[Middleware] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
      isValidToken = false;
      
      // If token is invalid, clear the cookie and redirect to login (but only for protected routes)
      if (tokenFromCookie && isProtectedRoute) {
        console.log('[Middleware] Clearing invalid token cookie and redirecting to login');
        const response = NextResponse.redirect(new URL('/login?error=token_expired', request.url));
        response.cookies.set('accessToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('refreshToken', '', { expires: new Date(0), path: '/' });
        return response;
      } else if (tokenFromCookie && !isProtectedRoute) {
        // Clear invalid cookies but don't redirect for public routes
        console.log('[Middleware] Clearing invalid token cookie for public route');
        const response = NextResponse.next();
        response.cookies.set('accessToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('refreshToken', '', { expires: new Date(0), path: '/' });
        return response;
      }
    }
  }

  // If accessing protected route without valid token, redirect to login
  if (isProtectedRoute && !isValidToken) {
    console.log('[Middleware] Redirecting to login - no valid token for protected route');
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    
    // Clear any invalid cookies
    const response = NextResponse.redirect(url);
    if (tokenFromCookie) {
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
    }
    return response;
  }

  // If accessing auth pages with valid token, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && isValidToken) {
    console.log('[Middleware] Redirecting to dashboard - authenticated user on auth page');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('[Middleware] Allowing request to proceed', {
    isValidToken,
    userEmail: tokenPayload?.email
  });
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icon-).*)',
  ],
};