'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/auth/use-auth'

export default function DebugAuthPage() {
  const { user, isAuthenticated } = useAuth()
  const [storageData, setStorageData] = useState<any>({})
  const [cookieData, setCookieData] = useState<string>('')

  useEffect(() => {
    // Get all localStorage data
    const data: any = {}
    data.accessToken = localStorage.getItem('accessToken')
    data.refreshToken = localStorage.getItem('refreshToken')
    data.user = localStorage.getItem('user')
    
    try {
      if (data.user) {
        data.parsedUser = JSON.parse(data.user)
      }
    } catch (e) {
      data.userParseError = String(e)
    }
    
    setStorageData(data)
    setCookieData(document.cookie)
  }, [])
  
  const clearAllAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    window.location.reload()
  }
  
  const fixMockedData = () => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        // If the name is João or any mocked data, prompt for real data
        if (userData.name === 'João' || userData.name === 'John Doe' || userData.email?.includes('test')) {
          const realName = prompt('Enter your real name:')
          const realEmail = prompt('Enter your real email:')
          
          if (realName && realEmail) {
            userData.name = realName
            userData.email = realEmail
            localStorage.setItem('user', JSON.stringify(userData))
            window.location.reload()
          }
        }
      } catch (e) {
        console.error('Error fixing data:', e)
      }
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
      
      <div className="grid gap-6">
        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Auth Context</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                isAuthenticated,
                user
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        {/* LocalStorage Data */}
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(storageData, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {cookieData || 'No cookies found'}
            </pre>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={clearAllAuth}
                variant="destructive"
              >
                Clear All Auth Data
              </Button>
              
              <Button 
                onClick={fixMockedData}
                variant="outline"
              >
                Fix Mocked Data
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="default"
              >
                Go to Login
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                variant="default"
              >
                Go to Dashboard
              </Button>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm">
                <strong>Debug Info:</strong> If you see "João" or mocked data, click "Fix Mocked Data" to update with your real information.
                If authentication is broken, click "Clear All Auth Data" and login again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}