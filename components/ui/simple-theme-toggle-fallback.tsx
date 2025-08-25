'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Simple Theme Toggle Component
 * 
 * A fallback theme toggle that works without complex dependencies
 * and provides basic light/dark mode functionality.
 */

interface SimpleThemeToggleProps {
  className?: string
}

export function SimpleThemeToggle({ className }: SimpleThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)

  // Handle mounting
  React.useEffect(() => {
    setMounted(true)
    // Check if dark mode is enabled
    const darkMode = document.documentElement.classList.contains('dark')
    setIsDark(darkMode)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-9 w-9 px-0", className)}
        disabled
        aria-label="Loading theme toggle"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 px-0 transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}