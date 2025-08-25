'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CreditCard, Sparkles, Zap, Crown, Gem } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface CreditsCardProps {
  creditsRemaining: number
  plan: string
}

const PLAN_CREDITS = {
  FREE: 10,
  PRO: 1000,
  ENTERPRISE: 10000,
}

const PLAN_ICONS = {
  FREE: Sparkles,
  PRO: Zap,
  ENTERPRISE: Crown,
}

const PLAN_GRADIENTS = {
  FREE: 'from-gray-500 to-gray-600',
  PRO: 'from-purple-500 to-indigo-600',
  ENTERPRISE: 'from-amber-500 to-orange-600',
}

export function CreditsCard({ creditsRemaining, plan }: CreditsCardProps) {
  const router = useRouter()
  const [animatedCredits, setAnimatedCredits] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  const maxCredits = PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS] || 10
  const progressPercentage = (creditsRemaining / maxCredits) * 100
  const PlanIcon = PLAN_ICONS[plan as keyof typeof PLAN_ICONS] || Sparkles
  const planGradient = PLAN_GRADIENTS[plan as keyof typeof PLAN_GRADIENTS]
  
  // Animate credits number
  useEffect(() => {
    setIsVisible(true)
    const duration = 1500
    const steps = 60
    const increment = creditsRemaining / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= creditsRemaining) {
        setAnimatedCredits(creditsRemaining)
        clearInterval(timer)
      } else {
        setAnimatedCredits(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [creditsRemaining])
  
  const getProgressColor = () => {
    if (progressPercentage > 50) return "from-emerald-500 to-green-500"
    if (progressPercentage > 20) return "from-amber-500 to-yellow-500" 
    return "from-red-500 to-pink-500"
  }
  
  const getProgressGlow = () => {
    if (progressPercentage > 50) return "shadow-emerald-500/50"
    if (progressPercentage > 20) return "shadow-amber-500/50" 
    return "shadow-red-500/50"
  }

  const getResetDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return nextMonth.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    })
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  return (
    <Card className="card-premium hover-lift group relative overflow-hidden animate-bounce-in">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className={cn(
          "absolute top-0 right-0 w-40 h-40 rounded-full animate-float",
          `bg-gradient-to-br ${planGradient} opacity-20 -translate-y-20 translate-x-20`
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 w-32 h-32 rounded-full animate-float",
          `bg-gradient-to-tr ${planGradient} opacity-10 translate-y-16 -translate-x-16`
        )} style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Gem
            key={i}
            className={cn(
              "absolute w-2 h-2 text-white/30 animate-pulse",
              i % 2 === 0 ? "animate-float" : ""
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
              <div className={cn(
                "p-1.5 rounded-lg bg-gradient-to-br",
                planGradient
              )}>
                <PlanIcon className="h-4 w-4 text-white animate-glow" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Credits
              </span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-1">
              <span>Current plan:</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r text-white",
                planGradient
              )}>
                {plan}
              </span>
            </CardDescription>
          </div>
          {plan === 'FREE' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleUpgrade}
              className="shrink-0 hover:scale-105 transition-all duration-300 group/btn"
            >
              <CreditCard className="h-4 w-4 mr-1 group-hover/btn:rotate-12 transition-transform duration-300" />
              <span>Upgrade</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* Credits display */}
        <div className="text-center space-y-2">
          <div className={cn(
            "transition-all duration-1000 ease-out",
            isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}>
            <div className="text-4xl font-bold counter mb-1">
              {animatedCredits.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              of {maxCredits.toLocaleString()} credits remaining
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Usage</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
                  `bg-gradient-to-r ${getProgressColor()}`
                )}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Glow effect */}
            <div 
              className={cn(
                "absolute inset-0 h-3 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100",
                `shadow-lg ${getProgressGlow()}`
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Reset date */}
        {getResetDate() && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Credits reset on {getResetDate()}
              </span>
            </div>
          </div>
        )}

        {/* Low credits warning */}
        {creditsRemaining < 5 && plan === 'FREE' && (
          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="p-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Running low on credits!
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Consider upgrading for unlimited analyses.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}