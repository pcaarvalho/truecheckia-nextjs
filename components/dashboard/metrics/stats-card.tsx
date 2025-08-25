'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  className?: string
  gradient?: boolean
  glowColor?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  gradient = false,
  glowColor = 'primary'
}: StatsCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)
  
  // Animation for number values
  useEffect(() => {
    setIsVisible(true)
    
    if (typeof value === 'number') {
      const duration = 1000
      const steps = 60
      const increment = value / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setAnimatedValue(value)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [value])
  
  const getGlowClass = () => {
    switch (glowColor) {
      case 'accent': return 'glow-accent'
      case 'success': return 'glow-success'
      default: return 'glow-primary'
    }
  }
  
  const getIconGradient = () => {
    switch (glowColor) {
      case 'accent': return 'from-cyan-500 to-blue-500'
      case 'success': return 'from-emerald-500 to-green-500'
      case 'warning': return 'from-amber-500 to-orange-500'
      case 'error': return 'from-red-500 to-pink-500'
      default: return 'from-purple-500 to-indigo-500'
    }
  }

  return (
    <Card className={cn(
      "card-premium hover-lift group relative overflow-hidden animate-bounce-in",
      "transition-all duration-500 ease-out hover:scale-[1.02]",
      gradient && "gradient-primary",
      className
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br animate-shimmer",
          `${getIconGradient()} opacity-5`
        )} />
      </div>
      
      {/* Floating orb decoration */}
      <div className={cn(
        "absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 animate-float",
        `bg-gradient-to-br ${getIconGradient()}`
      )} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-br transition-all duration-300",
          `${getIconGradient()} group-hover:scale-110 group-hover:rotate-3`
        )}>
          <Icon className="h-4 w-4 text-white icon-glow" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className={cn(
          "text-2xl font-bold mb-1 transition-all duration-500",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <span className="counter">
            {typeof value === 'number' ? animatedValue.toLocaleString() : value}
          </span>
        </div>
        
        {description && (
          <p className={cn(
            "text-xs text-muted-foreground transition-all duration-500 delay-100",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}>
            {description}
          </p>
        )}
        
        {trend && (
          <div className={cn(
            "flex items-center space-x-1 text-xs mt-3 p-2 rounded-lg backdrop-blur-sm",
            "transition-all duration-500 delay-200",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            trend.isPositive === true && "bg-green-500/10 text-green-600 dark:text-green-400",
            trend.isPositive === false && "bg-red-500/10 text-red-600 dark:text-red-400",
            trend.isPositive === undefined && "bg-muted/50 text-muted-foreground"
          )}>
            {trend.isPositive === true && <TrendingUp className="h-3 w-3" />}
            {trend.isPositive === false && <TrendingDown className="h-3 w-3" />}
            <span className="font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="opacity-75">{trend.label}</span>
          </div>
        )}
      </CardContent>
      
      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        getGlowClass()
      )} />
    </Card>
  )
}