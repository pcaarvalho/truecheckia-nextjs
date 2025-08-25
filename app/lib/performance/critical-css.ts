/**
 * Critical CSS utilities for above-the-fold optimization
 */

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
/* Critical layout styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Critical typography */
h1, h2, h3 {
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem 0;
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}

/* Critical button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

/* Critical header styles */
header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Critical navigation */
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

/* Critical hero section */
.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

/* Critical grid */
.grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Critical loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Critical dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #0a0a0a;
    --text-color: #ffffff;
    --border-color: rgba(255, 255, 255, 0.1);
  }
  
  body {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  
  .skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
  }
}

/* Critical font loading */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-bold.woff2') format('woff2');
}
`

// Inline critical CSS in document head
export function inlineCriticalCSS() {
  if (typeof window === 'undefined') return

  const style = document.createElement('style')
  style.textContent = CRITICAL_CSS
  style.id = 'critical-css'
  document.head.appendChild(style)
}

// Remove critical CSS once main stylesheet loads
export function removeCriticalCSS() {
  if (typeof window === 'undefined') return

  const criticalStyle = document.getElementById('critical-css')
  if (criticalStyle) {
    criticalStyle.remove()
  }
}

// Critical resource hints
export function addCriticalResourceHints() {
  if (typeof window === 'undefined') return

  const hints = [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://api.openai.com', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://js.stripe.com', crossOrigin: 'anonymous' },
  ]

  hints.forEach(({ rel, href, crossOrigin }) => {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    if (crossOrigin) link.crossOrigin = crossOrigin
    document.head.appendChild(link)
  })
}

// Critical image preloading
export function preloadCriticalImages() {
  const criticalImages = [
    '/hero-bg.webp',
    '/logo.svg'
  ]

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

// Above-the-fold optimization
export function optimizeAboveTheFold() {
  // Run all critical optimizations
  inlineCriticalCSS()
  addCriticalResourceHints()
  preloadCriticalImages()

  // Remove critical CSS once main stylesheet loads
  window.addEventListener('load', () => {
    setTimeout(removeCriticalCSS, 100)
  })
}

// Performance timing helper
export function measureCriticalTiming() {
  if (typeof window === 'undefined' || !window.performance) return

  const timing = window.performance.timing
  const measurements = {
    // DNS lookup time
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    
    // TCP connection time
    tcpConnection: timing.connectEnd - timing.connectStart,
    
    // Server response time
    serverResponse: timing.responseEnd - timing.requestStart,
    
    // DOM processing time
    domProcessing: timing.domComplete - timing.responseEnd,
    
    // Total page load time
    totalLoad: timing.loadEventEnd - timing.navigationStart
  }

  console.log('[Critical Timing]', measurements)
  return measurements
}

// Critical performance observer
export function observeCriticalPerformance() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return

  // Observe long tasks that block main thread
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Long Task] ${entry.name}: ${entry.duration}ms`)
        }
      }
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    // Long task API not supported
  }

  // Observe layout shifts
  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any
        if (layoutShiftEntry.value > 0.1) {
          console.warn(`[Layout Shift] Value: ${layoutShiftEntry.value}`)
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    // Layout shift API not supported
  }
}

// Resource loading optimization
export function optimizeResourceLoading() {
  if (typeof window === 'undefined') return

  // Preload next route when user hovers over navigation
  const navLinks = document.querySelectorAll('a[href^="/"]')
  
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href')
      if (href) {
        const linkEl = document.createElement('link')
        linkEl.rel = 'prefetch'
        linkEl.href = href
        document.head.appendChild(linkEl)
      }
    }, { once: true })
  })
}

// Initialize all critical optimizations
export function initializeCriticalPerformance() {
  optimizeAboveTheFold()
  observeCriticalPerformance()
  
  // Defer non-critical optimizations
  requestIdleCallback ? requestIdleCallback(optimizeResourceLoading) : 
    setTimeout(optimizeResourceLoading, 2000)
}