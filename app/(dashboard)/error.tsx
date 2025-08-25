'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, LogOut, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  const handleClearSessionAndRedirect = async () => {
    try {
      // Clear session via API
      await fetch('/api/auth/force-logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Clear any local storage tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      
      // Redirect to login
      window.location.href = '/login'
    } catch (logoutError) {
      console.error('Error during logout:', logoutError)
      // Force redirect anyway
      window.location.href = '/login'
    }
  }

  const isAuthError = error.message.includes('auth') || 
                      error.message.includes('token') || 
                      error.message.includes('unauthorized') ||
                      error.message.includes('401')

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {isAuthError ? 'Authentication Error' : 'Something went wrong'}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {isAuthError 
              ? 'There was a problem with your authentication. Please log in again.'
              : 'An unexpected error occurred while loading the dashboard.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 font-medium mb-1">Error Details:</p>
            <p className="text-xs text-gray-600 break-words">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {isAuthError ? (
              <>
                <Button 
                  onClick={handleClearSessionAndRedirect}
                  className="w-full"
                  variant="default"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Clear Session & Login
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={reset}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={handleClearSessionAndRedirect}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout & Login Again
                </Button>
                <Button 
                  asChild
                  variant="ghost"
                  className="w-full"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Additional help */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If this problem persists, please{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}