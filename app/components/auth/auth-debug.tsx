'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, RefreshCw, LogOut, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Debug component to test authentication system
 */
export function AuthDebug() {
  const { user, isLoading, isAuthenticated, error, validateAuth, logout, clearError, refreshAuth } = useAuth()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Auth Debug
        </CardTitle>
        <CardDescription>
          Current authentication state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {isLoading ? (
            <Badge variant="secondary">Loading...</Badge>
          ) : isAuthenticated ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Authenticated
            </Badge>
          )}
        </div>

        {/* User info */}
        {user && (
          <div className="space-y-2">
            <div className="text-sm">
              <strong>User:</strong> {user.name}
            </div>
            <div className="text-sm">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="text-sm">
              <strong>Plan:</strong> {user.plan}
            </div>
            <div className="text-sm">
              <strong>Credits:</strong> {user.credits}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <div className="font-medium">Error:</div>
                <div>{error}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Clear Error
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAuth}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Auth
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={logout}
              disabled={isLoading}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>

        {/* Additional debug info */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded text-xs">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              hasUser: !!user,
              hasError: !!error,
              timestamp: new Date().toISOString()
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}