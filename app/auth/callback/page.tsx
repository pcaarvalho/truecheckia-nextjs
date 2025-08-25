'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/use-auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateUser } = useAuth()
  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) return
    processedRef.current = true

    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const refresh = searchParams.get('refresh')
        const userParam = searchParams.get('user')
        const error = searchParams.get('error')
        const plan = searchParams.get('plan')

        if (error) {
          console.error('[Auth Callback] OAuth error:', error)
          
          let errorTitle = 'Authentication Error'
          let errorMessage = 'Please try again.'
          
          switch (error) {
            case 'oauth_denied':
              errorTitle = 'Google Sign-in Cancelled'
              errorMessage = 'You cancelled the Google sign-in process.'
              break
            case 'oauth_failed':
              errorTitle = 'Google Sign-in Failed'
              errorMessage = 'Google authentication failed. Please try again.'
              break
            case 'oauth_email_error':
              errorTitle = 'Email Access Error'
              errorMessage = 'Unable to access your email from Google. Please ensure you grant email permissions.'
              break
            case 'oauth_token_error':
              errorTitle = 'Authentication Token Error'
              errorMessage = 'There was an issue with the authentication token. Please try again.'
              break
          }
          
          toast.error(errorTitle, { description: errorMessage })
          
          const redirectUrl = plan ? `/login?plan=${plan}` : '/login'
          router.push(redirectUrl)
          return
        }

        if (token && refresh && userParam) {
          console.log('[Auth Callback] Processing successful OAuth login')
          
          try {
            const user = JSON.parse(userParam)
            
            // Store tokens in localStorage
            localStorage.setItem('accessToken', token)
            localStorage.setItem('refreshToken', refresh)
            localStorage.setItem('user', JSON.stringify(user))
            
            // Update auth context
            updateUser(user)
            
            console.log('[Auth Callback] OAuth login successful:', user.email)
            
            // Show success message
            toast.success('Welcome! 🎉', {
              description: user.name ? `Welcome back, ${user.name}!` : 'Successfully signed in with Google',
            })
            
            // Delay to ensure state is saved
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Redirect based on plan or to dashboard
            if (plan) {
              console.log('[Auth Callback] Redirecting to pricing with plan:', plan)
              router.push(`/?plan=${plan}#pricing`)
            } else {
              console.log('[Auth Callback] Redirecting to dashboard')
              // Force page reload to ensure middleware picks up the new auth state
              window.location.href = '/dashboard'
            }
          } catch (e) {
            console.error('[Auth Callback] Error parsing user data:', e)
            toast.error('Authentication Error', {
              description: 'There was an issue processing your login. Please try again.',
            })
            router.push('/login')
          }
        } else {
          console.error('[Auth Callback] Missing required parameters')
          toast.error('Authentication Error', {
            description: 'Missing authentication data. Please try signing in again.',
          })
          router.push('/login')
        }
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error)
        toast.error('Unexpected Error', {
          description: 'An unexpected error occurred. Please try again.',
        })
        router.push('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, updateUser])

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20 text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6"
        >
          <Loader2 className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Processing your sign-in...
        </h1>
        
        <p className="text-blue-100">
          Just a moment while we set up your account
        </p>
        
        <motion.div
          className="mt-8 flex justify-center space-x-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}