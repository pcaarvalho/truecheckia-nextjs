'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut, 
  Search,
  History,
  User,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/layout/header/header'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [stats, setStats] = useState({
    totalAnalysis: 0,
    creditsRemaining: user?.credits || 10,
    plan: user?.plan || 'FREE',
    lastAnalysis: null
  })

  useEffect(() => {
    // Update stats from user data (no API call needed)
    if (user) {
      setStats(prev => ({
        ...prev,
        creditsRemaining: user.credits || 0,
        plan: user.plan || 'FREE'
      }))
    }
    
    // Handle checkout success/cancellation
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      // Show success modal or toast
      toast.success('Checkout successful!', {
        description: 'Your subscription has been activated.',
      })
      setTimeout(() => {
        // Remove the URL parameter to avoid showing again
        window.history.replaceState({}, '', '/dashboard')
      }, 100)
    } else if (canceled === 'true') {
      // Show cancellation feedback
      toast.info('Checkout canceled', {
        description: 'No charges were made.',
      })
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard')
      }, 100)
    }
  }, [searchParams, user])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navigateToAnalysis = () => {
    router.push('/analysis')
  }

  const navigateToHistory = () => {
    router.push('/history')
  }

  const navigateToProfile = () => {
    router.push('/profile')
  }

  const navigateToSubscription = () => {
    router.push('/subscription')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to TrueCheckIA
          </h1>
          <p className="text-gray-600">
            Detect AI-generated content with precision and confidence
          </p>
        </div>

        {/* Email Verification Banner - TODO: Implement EmailVerificationBanner */}
        {user && !user.emailVerified && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please verify your email address to access all features.
            </p>
          </div>
        )}

        {/* Credit Alert - TODO: Implement CreditAlert */}
        {user && user.credits !== undefined && user.credits < 5 && (
          <div className="mb-6 p-4 bg-orange-100 border border-orange-200 rounded-lg">
            <p className="text-orange-800">
              You have {user.credits} credits remaining. Consider upgrading your plan.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credits Remaining
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.credits !== undefined ? user.credits : '---'}
              </div>
              <p className="text-xs text-muted-foreground">
                Plan: {user?.plan || 'FREE'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Analyses Completed
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalysis}</div>
              <p className="text-xs text-muted-foreground">
                Total history
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Account {user?.emailVerified ? 'verified' : 'pending verification'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={navigateToAnalysis}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg">New Analysis</CardTitle>
              <CardDescription>
                Check if text was generated by AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={navigateToHistory}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <History className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">History</CardTitle>
              <CardDescription>
                View previous analyses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={navigateToProfile}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">My Profile</CardTitle>
              <CardDescription>
                Manage personal data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={navigateToSubscription}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>
                Manage plan and payments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        {stats.lastAnalysis && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Last Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Performed on: {new Date(stats.lastAnalysis).toLocaleString('en-US')}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}