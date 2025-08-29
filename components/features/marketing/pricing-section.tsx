'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'

export default function PricingSection() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)

  const handlePlanSelect = async (planSlug: string, interval: 'monthly' | 'yearly' = 'monthly') => {
    if (planSlug === 'ENTERPRISE') {
      router.push('/contact')
      return
    }
    
    if (planSlug === 'FREE') {
      router.push('/register?plan=FREE')
      return
    }

    // Handle Pro plan with Stripe checkout
    if (planSlug === 'PRO') {
      // If not authenticated, show email input or redirect to register
      if (!isAuthenticated) {
        if (!showEmailInput) {
          setShowEmailInput(true)
          return
        }
        
        if (!email) {
          toast.error('Please provide your email address')
          return
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          toast.error('Please provide a valid email address')
          return
        }
      }
      
      setIsLoading('PRO')
      try {
        // Choose endpoint based on authentication status
        const endpoint = isAuthenticated ? '/api/stripe/checkout' : '/api/stripe/checkout-public'
        const requestBody = isAuthenticated 
          ? {
              plan: 'PRO',
              interval
            }
          : {
              plan: 'PRO',
              interval,
              email
            }

        // Get token from localStorage for authenticated requests
        const token = isAuthenticated ? localStorage.getItem('accessToken') : null
        
        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(requestBody)
        })

        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to create checkout session')
        }

        // Handle the API response structure { success: true, data: { url, sessionId } }
        const checkoutData = result.data || result
        
        if (checkoutData.url) {
          window.location.href = checkoutData.url
        } else {
          console.error('No checkout URL in response:', result)
          throw new Error('No checkout URL received')
        }
      } catch (error: any) {
        console.error('Checkout error:', error)
        toast.error(error.message || 'Failed to start checkout. Please try again.')
        setIsLoading(null)
      }
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Choose the ideal plan for you
          </h2>
          <p className="text-xl text-muted-foreground">
            Transparent pricing and powerful features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold">Free</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Perfect to start and test our platform
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <p className="text-primary font-medium mt-2">10 analyses/month</p>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">10 analyses per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic analyses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">30-day history</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button 
                className="w-full" 
                variant="outline" 
                size="lg"
                onClick={() => handlePlanSelect('FREE')}
              >
                Start Free
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative ring-2 ring-primary shadow-xl scale-105 border-primary/20 hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold">Pro</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Ideal for professionals and small teams
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-primary font-medium mt-2">1,000 analyses/month</p>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">1,000 analyses per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analyses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Complete history</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Multi-language detection</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-6 space-y-3">
              {!isAuthenticated && showEmailInput && (
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handlePlanSelect('PRO')
                      }
                    }}
                  />
                </div>
              )}
              <Button 
                className="w-full group" 
                size="lg"
                onClick={() => handlePlanSelect('PRO')}
                disabled={isLoading === 'PRO'}
              >
                {isLoading === 'PRO' ? 'Loading...' : (!isAuthenticated && !showEmailInput) ? 'Get Started' : 'Start Pro Trial'}
                {isLoading !== 'PRO' && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
              {!isAuthenticated && showEmailInput && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEmailInput(false)
                    setEmail('')
                  }}
                >
                  Cancel
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                For companies that need personalized solutions
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-primary font-medium mt-2">Unlimited credits</p>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited analyses</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Guaranteed SLA</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Team management</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button 
                className="w-full" 
                variant="outline" 
                size="lg"
                onClick={() => handlePlanSelect('ENTERPRISE')}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}