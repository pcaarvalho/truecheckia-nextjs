/**
 * Centralized SEO configuration for TrueCheckIA
 */

export const SEO_CONFIG = {
  siteName: 'TrueCheckIA',
  siteDescription: 'Professional AI content detection with 99.7% accuracy. Detect ChatGPT, GPT-4, Claude, and other AI models.',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com',
  
  // Brand colors for OG images
  brandColors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
  },

  // Default images
  images: {
    ogDefault: '/images/og-default.jpg',
    ogHome: '/images/og-home.jpg',
    ogPricing: '/images/og-pricing.jpg',
    ogBlog: '/images/og-blog.jpg',
    logo: '/images/logo.png',
    logoWhite: '/images/logo-white.png',
  },

  // Social media handles
  social: {
    twitter: '@truecheckia',
    linkedin: 'company/truecheckia',
    github: 'truecheckia',
  },

  // Company information
  company: {
    name: 'TrueCheckIA',
    email: 'support@truecheckia.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 AI Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'United States',
    },
  },

  // SEO keywords by category
  keywords: {
    primary: [
      'ai detector',
      'detect chatgpt',
      'ai content checker',
      'chatgpt detector',
      'ai detection tool',
      'artificial intelligence detector',
    ],
    secondary: [
      'gpt detector',
      'claude detector',
      'ai writing detection',
      'content verification',
      'plagiarism checker ai',
      'ai content analysis',
    ],
    multilingual: {
      portuguese: [
        'detector de ia',
        'verificador de chatgpt',
        'detector de inteligencia artificial',
        'verificar conteudo ia',
        'detector de chatgpt',
      ],
      spanish: [
        'detector de ia',
        'verificador de chatgpt',
        'detector de inteligencia artificial',
        'analisis de contenido ia',
        'verificador de ia',
      ],
    },
  },

  // Page-specific configurations
  pages: {
    home: {
      priority: 1.0,
      changeFrequency: 'daily' as const,
    },
    pricing: {
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    },
    blog: {
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    },
    auth: {
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    },
    legal: {
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },
  },

  // Robots.txt configuration
  robots: {
    allowed: [
      '/',
      '/pricing',
      '/contact',
      '/login',
      '/register',
      '/privacy',
      '/terms',
      '/blog/*',
      '/*.css',
      '/*.js',
      '/*.png',
      '/*.jpg',
      '/*.jpeg',
      '/*.webp',
      '/*.svg',
      '/*.ico',
      '/*.woff',
      '/*.woff2',
    ],
    disallowed: [
      '/api/*',
      '/dashboard/*',
      '/profile/*',
      '/analysis/*',
      '/history/*',
      '/settings/*',
      '/_next/*',
      '/admin/*',
      '/private/*',
      '/*.json',
      '/test*',
      '/debug*',
      '/*?*',
      '/auth/*',
      '/.well-known/*',
    ],
  },

  // Language configuration
  languages: {
    default: 'en',
    supported: ['en', 'pt', 'es'],
    locales: {
      en: 'en-US',
      pt: 'pt-BR',
      es: 'es-ES',
    },
  },

  // Performance and caching
  cache: {
    sitemap: 3600, // 1 hour
    robots: 86400, // 24 hours
    ogImages: 604800, // 1 week
  },

  // Analytics and tracking
  tracking: {
    googleAnalyticsId: 'GA_MEASUREMENT_ID', // Replace with actual ID
    googleTagManagerId: 'GTM_ID', // Replace with actual ID
    facebookPixelId: 'FB_PIXEL_ID', // Replace with actual ID
  },

  // Feature flags for SEO
  features: {
    enableStructuredData: true,
    enableBreadcrumbs: true,
    enableMultilingual: true,
    enableAMP: false, // Set to true when AMP pages are implemented
    enablePWA: true,
  },
}

/**
 * Get page-specific SEO config
 */
export function getPageSEOConfig(page: keyof typeof SEO_CONFIG.pages) {
  return {
    ...SEO_CONFIG,
    page: SEO_CONFIG.pages[page],
  }
}

/**
 * Generate multilingual keywords
 */
export function getMultilingualKeywords(language: string = 'en'): string[] {
  const primaryKeywords = SEO_CONFIG.keywords.primary
  const secondaryKeywords = SEO_CONFIG.keywords.secondary
  
  let multilingualKeywords: string[] = []
  
  if (language === 'pt' && SEO_CONFIG.keywords.multilingual.portuguese) {
    multilingualKeywords = SEO_CONFIG.keywords.multilingual.portuguese
  } else if (language === 'es' && SEO_CONFIG.keywords.multilingual.spanish) {
    multilingualKeywords = SEO_CONFIG.keywords.multilingual.spanish
  }
  
  return [...primaryKeywords, ...secondaryKeywords, ...multilingualKeywords]
}

/**
 * Generate page URL with proper locale
 */
export function generatePageUrl(path: string, locale: string = 'en'): string {
  const baseUrl = SEO_CONFIG.siteUrl
  
  if (locale === 'en' || locale === SEO_CONFIG.languages.default) {
    return `${baseUrl}${path}`
  }
  
  return `${baseUrl}/${locale}${path}`
}

/**
 * Get structured data for the organization
 */
export function getOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.company.name,
    description: SEO_CONFIG.siteDescription,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.logo}`,
    sameAs: [
      `https://twitter.com/${SEO_CONFIG.social.twitter.replace('@', '')}`,
      `https://linkedin.com/${SEO_CONFIG.social.linkedin}`,
      `https://github.com/${SEO_CONFIG.social.github}`,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: SEO_CONFIG.company.email,
      telephone: SEO_CONFIG.company.phone,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SEO_CONFIG.company.address.street,
      addressLocality: SEO_CONFIG.company.address.city,
      addressRegion: SEO_CONFIG.company.address.state,
      postalCode: SEO_CONFIG.company.address.zip,
      addressCountry: SEO_CONFIG.company.address.country,
    },
    foundingDate: '2023',
    numberOfEmployees: '1-10',
    knowsAbout: [
      'AI Content Detection',
      'ChatGPT Detection',
      'Artificial Intelligence',
      'Content Analysis',
      'Plagiarism Detection',
      'Machine Learning',
    ],
  }
}