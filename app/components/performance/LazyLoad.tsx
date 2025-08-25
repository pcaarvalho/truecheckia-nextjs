'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { createIntersectionObserver } from '@/app/lib/performance/lazy-load'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
  className?: string
  onVisible?: () => void
}

export function LazyLoad({
  children,
  fallback = null,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  onVisible
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = createIntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true)
          setHasTriggered(true)
          onVisible?.()
          
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold, triggerOnce, hasTriggered, onVisible])

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  )
}

// Hook for lazy loading with visibility tracking
export function useLazyLoad(options: {
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = createIntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { isVisible, elementRef }
}