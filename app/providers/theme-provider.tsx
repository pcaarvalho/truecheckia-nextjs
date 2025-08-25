'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * TrueCheckIA Theme Provider
 * 
 * Features:
 * - Light/Dark mode support with system preference detection
 * - Smooth transitions between themes
 * - LocalStorage persistence
 * - Custom theme attributes and configurations
 * - Optimized for Next.js App Router
 * 
 * The provider wraps the entire application and provides theme context
 * to all components. It automatically detects system preferences and
 * persists user selections across sessions.
 */

interface CustomThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ 
  children, 
  ...props 
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="truecheckia-theme"
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * Theme Hook
 * 
 * Custom hook that provides theme utilities and state management.
 * This hook wraps the useTheme from next-themes and adds additional
 * functionality specific to TrueCheckIA.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = require('next-themes').useTheme()
  
  const isDark = resolvedTheme === 'dark'
  const isLight = resolvedTheme === 'light'
  const isSystem = theme === 'system'
  
  const toggleTheme = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])
  
  const setLightTheme = React.useCallback(() => {
    setTheme('light')
  }, [setTheme])
  
  const setDarkTheme = React.useCallback(() => {
    setTheme('dark')
  }, [setTheme])
  
  const setSystemTheme = React.useCallback(() => {
    setTheme('system')
  }, [setTheme])
  
  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  }
}

/**
 * Theme Detection Hook
 * 
 * Hook for detecting when the theme has mounted and is ready to use.
 * This prevents hydration mismatches in Next.js SSR.
 */
export function useThemeDetection() {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  return {
    mounted,
    theme: mounted ? resolvedTheme : 'light', // Default to light for SSR
  }
}