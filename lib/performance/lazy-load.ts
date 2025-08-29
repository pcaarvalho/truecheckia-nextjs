/**
 * Lazy loading utilities for components and resources
 */

import React, { lazy, Suspense, ComponentType, ReactNode } from 'react'

// Generic lazy loading wrapper
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFunc)
  
  return (props: any) => React.createElement(
    Suspense,
    { fallback: fallback || React.createElement('div', {}, 'Loading...') },
    React.createElement(LazyComponent, props)
  )
}

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Lazy load images with intersection observer
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = createIntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      img.src = src
      img.onload = () => {
        img.classList.add('loaded')
      }
      observer.disconnect()
    }
  })

  observer.observe(img)
}

// Progressive image loading
export const progressiveImageLoad = (
  element: HTMLElement,
  lowResSrc: string,
  highResSrc: string
) => {
  // Load low-res image first
  const lowResImg = new Image()
  lowResImg.onload = () => {
    element.style.backgroundImage = `url(${lowResSrc})`
    
    // Then load high-res image
    const highResImg = new Image()
    highResImg.onload = () => {
      element.style.backgroundImage = `url(${highResSrc})`
      element.classList.add('high-res-loaded')
    }
    highResImg.src = highResSrc
  }
  lowResImg.src = lowResSrc
}

// Code splitting boundaries
export const LAZY_BOUNDARIES = {
  // Heavy components that should be lazy loaded
  Dashboard: () => import('@/app/(dashboard)/dashboard/page'),
  Analysis: () => import('@/app/(dashboard)/analysis/page'),
  Profile: () => import('@/app/(dashboard)/profile/page'),
  History: () => import('@/app/(dashboard)/history/page'),
  
  // Third-party components
  ReactQueryDevtools: () => import('@tanstack/react-query-devtools'),
  
  // Analytics components (load after user interaction)
  Analytics: () => import('@/components/analytics/GoogleAnalytics'),
  
  // Non-critical animations
  EasterEggs: () => import('@/components/animations/easter-eggs'),
  Confetti: () => import('@/components/ui/confetti')
}

// Viewport-based lazy loading
export const useViewportLazyLoad = (threshold = 0.1) => {
  const observer = createIntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport')
        }
      })
    },
    { threshold }
  )

  return observer
}