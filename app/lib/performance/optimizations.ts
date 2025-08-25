// Code splitting utilities for production optimization

export const CodeSplittingConfig = {
  // Route-based code splitting
  dashboardChunkName: 'dashboard',
  blogChunkName: 'blog',
  authChunkName: 'auth',
  
  // Bundle size thresholds
  maxChunkSize: 200000, // 200KB
  minChunkSize: 20000,  // 20KB
  
  // Prefetch strategy
  prefetchTimeout: 2000,
  prefetchOnHover: true,
  prefetchOnVisible: true,
};

// Performance optimization utilities
export const PerformanceUtils = {
  // Lazy loading intersection observer
  createIntersectionObserver: (callback: (entries: IntersectionObserverEntry[]) => void) => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
      });
    }
    return null;
  },
  
  // Debounce utility for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },
  
  // Throttle utility for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  },
};

export default PerformanceUtils;