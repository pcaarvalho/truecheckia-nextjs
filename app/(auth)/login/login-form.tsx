'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// import { useAnalytics } from '@/app/hooks/use-analytics'
import { useAuthPageView } from '@/app/hooks/use-page-view'
import { Eye, EyeOff, Mail, Lock, Check, Star, AtSign, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/auth/use-auth'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Confetti } from '@/components/ui/confetti'

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [logoClicked, setLogoClicked] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [showAtSymbol, setShowAtSymbol] = useState(false)
  const [googleHovered, setGoogleHovered] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithGoogle } = useAuth()
  // const _analytics = useAnalytics()
  
  // Track page view
  useAuthPageView('login')
  
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const loginButtonRef = useRef<HTMLButtonElement>(null)
  
  const loadingMessages = [
    'Warming up the AI detectors...',
    'Checking your awesome credentials...',
    'Opening the door to truth...',
    'Preparing your digital sanctuary...',
    'Activating truth detection mode...'
  ]

  // Handle intended plan after login and OAuth errors
  useEffect(() => {
    // const _intendedPlan = searchParams.get('plan')
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    
    if (message) {
      toast.success('Welcome!', {
        description: decodeURIComponent(message),
      })
    }
    
    if (error) {
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
      
      toast.error(errorTitle, {
        description: errorMessage,
      })
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setFailedAttempts(prev => prev + 1)
    
    // Track login attempt
    // analytics.trackAuth.loginCompleted({
    //   method: 'email',
    //   user_id: data.email
    // })
    
    // Rotate through fun loading messages
    const messageIndex = Math.floor(Math.random() * loadingMessages.length)
    setLoadingMessage(loadingMessages[messageIndex])
    
    try {
      console.log('[Login] Starting login process...')
      await login(data.email, data.password)
      console.log('[Login] Login successful, preparing redirect...')
      
      // Success animation sequence
      setIsSuccess(true)
      setShowConfetti(true)
      
      // Add delay to show success animation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const intendedPlan = searchParams.get('plan')
      
      if (intendedPlan) {
        console.log('[Login] Redirecting to pricing with plan:', intendedPlan)
        toast.success('Login successful! 🎉', {
          description: `Redirecting to ${intendedPlan} plan...`,
        })
        router.push(`/?plan=${intendedPlan}#pricing`)
      } else {
        console.log('[Login] Redirecting to dashboard...')
        toast.success('Welcome back! 🚀', {
          description: 'Taking you to your dashboard...',
        })
        window.location.href = '/dashboard'
      }
    } catch (error: unknown) {
      let errorMessage = 'Oops! Let\'s try that again 🤔'
      let title = 'Almost there!'
      
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error && typeof error === 'object' && 'message' in error && error.message === 'NETWORK_ERROR') {
        errorMessage = 'Hmm, connection hiccup! Check your internet and give it another shot 🔄'
        title = 'Network adventure'
      }
      
      // Shake the form on error
      if (passwordInputRef.current) {
        passwordInputRef.current.style.animation = 'shake 0.5s ease-in-out'
        setTimeout(() => {
          if (passwordInputRef.current) {
            passwordInputRef.current.style.animation = ''
          }
        }, 500)
      }
      
      toast.error(title, {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
      setIsSuccess(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="glass backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/30 bg-gradient-to-br from-white/10 to-white/5">
        {/* Interactive Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: logoClicked ? [1, 1.2, 1] : 1 }}
            transition={{ duration: logoClicked ? 0.6 : 0.5, delay: 0.1, type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 cursor-pointer relative overflow-hidden group"
            onClick={() => {
              setLogoClicked(true)
              setTimeout(() => setLogoClicked(false), 600)
            }}
            onHoverStart={() => {}}
          >
            <span className="text-3xl font-bold text-white relative z-10 transition-transform group-hover:scale-110">TC</span>
            
            {/* Sparkle effects on logo click */}
            <AnimatePresence>
              {logoClicked && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, 1, 0], 
                        rotate: [0, 180 + i * 45], 
                        x: [0, (Math.cos(i * Math.PI / 4) * 40)],
                        y: [0, (Math.sin(i * Math.PI / 4) * 40)],
                        opacity: [1, 0.8, 0]
                      }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <Star className="w-3 h-3 text-yellow-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
            
            {/* Hover glow effect */}
            <motion.div 
              className="absolute inset-0 bg-white/20 rounded-full blur-md"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-blue-100">Sign in to your TrueCheckIA account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
              <Input
                {...register('email')}
                ref={emailInputRef}
                id="email"
                type="email"
                placeholder="your@email.com"
                className="pl-10 pr-10 h-12 glass bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400 focus:ring-2 focus:bg-white/15 transition-all duration-300 rounded-xl"
                disabled={isLoading}
                data-testid="email-input"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.includes('@') && !showAtSymbol) {
                    setShowAtSymbol(true)
                    setTimeout(() => setShowAtSymbol(false), 1000)
                  }
                }}
              />
              
              {/* Animated @ symbol */}
              <AnimatePresence>
                {showAtSymbol && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.6 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  >
                    <AtSign className="w-5 h-5 text-blue-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              {/* Lock icon that unlocks when typing */}
              <motion.div
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5"
                animate={{ rotate: passwordValue ? [0, 15, -15, 0] : 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                {passwordValue ? (
                  <Unlock className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </motion.div>
              
              <Input
                {...register('password')}
                ref={passwordInputRef}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 glass bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400 focus:ring-2 focus:bg-white/15 transition-all duration-300 rounded-xl"
                disabled={isLoading}
                data-testid="password-input"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              
              {/* Password strength indicator */}
              <AnimatePresence>
                {passwordValue && passwordFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -bottom-8 left-0 text-xs text-blue-200"
                  >
                    {passwordValue.length < 4 ? '🔥 Getting warmer!' : 
                     passwordValue.length < 8 ? '💪 Now we\'re talking!' :
                     '🚀 Looking strong!'}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Eye icon with wiggle on hover */}
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <motion.div whileHover={{ x: 5 }}>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-200 hover:text-white transition-colors font-medium inline-flex items-center gap-1"
              >
                Forgot password?
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  🤷
                </motion.span>
              </Link>
            </motion.div>
          </div>

          <motion.div className="relative">
            <Button
              ref={loginButtonRef}
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-glow relative overflow-hidden"
              data-testid="login-button"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center"
                  >
                    {/* Galaxy loading effect */}
                    <motion.div
                      className="relative mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-4 h-4 relative">
                        <div className="absolute inset-0 rounded-full bg-blue-300 opacity-60"></div>
                        <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2"></div>
                        <div className="absolute left-0 top-1/2 w-1 h-1 bg-white rounded-full transform -translate-y-1/2"></div>
                        <div className="absolute right-0 top-1/2 w-1 h-1 bg-white rounded-full transform -translate-y-1/2"></div>
                      </div>
                    </motion.div>
                    <motion.span
                      key={loadingMessage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {loadingMessage}
                    </motion.span>
                  </motion.div>
                ) : isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, type: 'spring', bounce: 0.6 }}
                      className="mr-2"
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                    Welcome back! 🎉
                  </motion.div>
                ) : (
                  <motion.span
                    key="signin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            
            {/* Ripple effect on button press */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={isLoading ? {
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-blue-200 font-medium">Or</span>
          </div>
        </div>

        {/* Enhanced Google Sign In */}
        <div className="mb-8">
          <motion.div
            onHoverStart={() => setGoogleHovered(true)}
            onHoverEnd={() => setGoogleHovered(false)}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Track Google OAuth initiation
                // analytics.trackAuth.loginCompleted({
                //   method: 'google'
                // })
                
                const intendedPlan = searchParams.get('plan')
                loginWithGoogle('/dashboard', intendedPlan || undefined)
              }}
              className="w-full bg-white/15 border-white/30 text-white hover:bg-white/25 transition-all duration-300 focus:ring-2 focus:ring-blue-400 relative overflow-hidden"
              disabled={isLoading}
            >
              {/* Rainbow gradient on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 to-purple-500/20"
                initial={{ x: '-100%', opacity: 0 }}
                animate={googleHovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              
              {/* Spinning Google logo on hover */}
              <motion.svg 
                className="w-5 h-5 mr-2 relative z-10" 
                viewBox="0 0 24 24"
                animate={googleHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </motion.svg>
              
              {/* Playful text animation */}
              <motion.span
                className="relative z-10"
                animate={googleHovered ? {
                  letterSpacing: ['0em', '0.05em', '0em']
                } : {}}
                transition={{ duration: 0.6 }}
              >
                Sign in with Google
              </motion.span>
            </Button>
          </motion.div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-blue-100">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-white font-semibold hover:text-blue-200 transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-blue-200 hover:text-white transition-colors text-sm font-medium"
        >
          ← Back to home
        </Link>
      </div>
      
      {/* Confetti on successful login */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        duration={2000}
      />
      
      {/* Encouraging message after failed attempts */}
      <AnimatePresence>
        {failedAttempts >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            Take a deep breath, you got this! 💪
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}