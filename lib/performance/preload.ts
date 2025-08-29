/**
 * Performance utilities for resource preloading and optimization
 */

// Critical resource preloading
export const preloadCriticalResources = () => {
  // Preload key fonts
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  fontLink.as = 'style'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)

  // Preconnect to critical domains
  const domains = [
    'https://api.openai.com',
    'https://js.stripe.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ]

  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// DNS prefetch for third-party resources
export const prefetchDNS = () => {
  const prefetchDomains = [
    'https://www.clarity.ms',
    'https://connect.facebook.net',
    'https://snap.licdn.com',
    'https://cdn4.mxpnl.com'
  ]

  prefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Module preloading for critical chunks
export const preloadModules = () => {
  const criticalModules = [
    '/dashboard',
    '/analysis'
  ]

  criticalModules.forEach(module => {
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = module
    document.head.appendChild(link)
  })
}

// Image preloading with intersection observer
export const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

// Resource hints configuration
export const RESOURCE_HINTS = {
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.openai.com',
    'https://js.stripe.com'
  ],
  'dns-prefetch': [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://www.clarity.ms',
    'https://connect.facebook.net',
    'https://snap.licdn.com',
    'https://cdn4.mxpnl.com'
  ]
}