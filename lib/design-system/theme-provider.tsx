'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cssVariables } from './tokens';

/**
 * TrueCheckIA Theme Provider
 * 
 * Manages theme state and provides design system tokens throughout the application.
 * Supports light/dark mode with smooth transitions and localStorage persistence.
 */

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableTransitions?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'truecheckia-theme',
  enableTransitions = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document
  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(resolvedTheme);
    
    // Apply CSS custom properties
    const variables = cssVariables[resolvedTheme];
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add transition class for smooth theme changes
    if (enableTransitions && mounted) {
      root.classList.add('theme-transition');
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null;
      const initialTheme = savedTheme || defaultTheme;
      
      setThemeState(initialTheme);
      const resolved = resolveTheme(initialTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      const resolved = resolveTheme(defaultTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
    
    setMounted(true);
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <svg
        className={`h-5 w-5 transition-all duration-300 ${
          resolvedTheme === 'dark' ? 'rotate-180 scale-0' : 'rotate-0 scale-100'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        className={`absolute h-5 w-5 transition-all duration-300 ${
          resolvedTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}

// CSS for smooth theme transitions
export const themeTransitionStyles = `
  .theme-transition * {
    transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
`;