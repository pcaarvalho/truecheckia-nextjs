'use client';

import { useRef, useCallback, useEffect } from 'react';

interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
  preventScroll?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useTouchGestures(config: TouchGestureConfig = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onPinch,
    threshold = 50,
    preventScroll = false,
  } = config;

  const elementRef = useRef<HTMLDivElement>(null);
  const startTouch = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const initialDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // Handle pinch gesture start
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  }, [preventScroll, onPinch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = currentDistance / initialDistance.current;
      onPinch(scale);
    }
  }, [preventScroll, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startTouch.current) return;

    const touch = e.changedTouches[0];
    const endTouch: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    const deltaX = endTouch.x - startTouch.current.x;
    const deltaY = endTouch.y - startTouch.current.y;
    const deltaTime = endTouch.timestamp - startTouch.current.timestamp;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Tap detection
    if (distance < threshold && deltaTime < 300) {
      const timeSinceLastTap = endTouch.timestamp - lastTap.current;
      
      if (timeSinceLastTap < 300 && onDoubleTap) {
        onDoubleTap();
        lastTap.current = 0; // Reset to prevent triple tap
      } else {
        if (onTap) {
          // Delay single tap to allow for double tap detection
          setTimeout(() => {
            if (endTouch.timestamp - lastTap.current > 300) {
              onTap();
            }
          }, 300);
        }
        lastTap.current = endTouch.timestamp;
      }
      return;
    }

    // Swipe detection
    if (distance > threshold) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    startTouch.current = null;
    initialDistance.current = 0;
  }, [threshold, onTap, onDoubleTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return elementRef;
}

// Utility hook for swipe navigation
export function useSwipeNavigation(
  onNext?: () => void,
  onPrevious?: () => void,
  threshold: number = 100
) {
  return useTouchGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    threshold,
    preventScroll: false,
  });
}

// Utility hook for card swipe actions (like delete, archive)
export function useCardSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 150
) {
  return useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold,
    preventScroll: true,
  });
}

// Utility hook for pull-to-refresh
export function usePullToRefresh(
  onRefresh: () => void,
  threshold: number = 100
) {
  return useTouchGestures({
    onSwipeDown: () => {
      // Only trigger if we're at the top of the page
      if (window.scrollY === 0) {
        onRefresh();
      }
    },
    threshold,
    preventScroll: false,
  });
}