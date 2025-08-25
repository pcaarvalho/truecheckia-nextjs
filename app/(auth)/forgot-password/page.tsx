'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email')
      }

      setIsSuccess(true)
      toast.success('Reset email sent!', {
        description: 'Check your inbox for password reset instructions.',
      })
    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error('Failed to send reset email', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-gradient-x"></div>
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="glass backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/30 bg-gradient-to-br from-white/10 to-white/5">
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-glow"
                >
                  <Mail className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-blue-100">We&apos;ll send you reset instructions</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className="pl-10 h-12 glass bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400 focus:ring-2 focus:bg-white/15 transition-all duration-300 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-glow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-blue-100 mb-6">
                We&apos;ve sent password reset instructions to your email address.
              </p>
              <p className="text-blue-200 text-sm">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-blue-200 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}