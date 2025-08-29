import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  canonical?: string
  noindex?: boolean
  locale?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  authors?: Array<{ name: string; url?: string }>
  section?: string
  tags?: string[]
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'

// Default SEO configuration
const defaultConfig: Partial<SEOConfig> = {
  keywords: [
    'ai detector',
    'detect chatgpt',
    'ai content checker',
    'artificial intelligence detection',
    'content analysis',
    'plagiarism detection',
    'detector de ia',
    'verificador de chatgpt',
    'verificar conteudo ia',
    'detector de inteligencia artificial',
    'detector de chatgpt',
    'analisis de contenido ia',
    'verificador de ia',
  ],
  image: `${baseUrl}/images/og-default.jpg`,
  locale: 'en_US',
  type: 'website',
}

/**
 * Generates comprehensive metadata for pages
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    canonical,
    noindex = false,
    locale = 'en_US',
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
  } = { ...defaultConfig, ...config }

  const fullTitle = title.includes('TrueCheckIA') 
    ? title 
    : `${title} | TrueCheckIA - AI Content Detection`

  const canonicalUrl = canonical || baseUrl
  const ogImage = image || `${baseUrl}/images/og-default.jpg`
  
  // Combine default keywords with page-specific keywords
  const allKeywords = [
    ...defaultConfig.keywords!,
    ...keywords,
    ...((tags || []).map(tag => tag.toLowerCase())),
  ].filter((keyword, index, self) => self.indexOf(keyword) === index) // Remove duplicates

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: authors || [{ name: 'TrueCheckIA Team' }],
    creator: 'TrueCheckIA',
    publisher: 'TrueCheckIA',
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-US': canonicalUrl,
        'pt-BR': canonicalUrl.replace(baseUrl, `${baseUrl}/pt`),
        'es-ES': canonicalUrl.replace(baseUrl, `${baseUrl}/es`),
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'TrueCheckIA',
      locale,
      type: type as any,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors: authors.map(author => author.name) }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@truecheckia',
      images: [ogImage],
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }

  return metadata
}

/**
 * Predefined metadata for common pages
 */
export const pageMetadata = {
  home: {
    title: 'TrueCheckIA - Professional AI Content Detection & Analysis',
    description: 'Detect AI-generated content with 99.7% accuracy. Professional AI detector for ChatGPT, GPT-4, Claude, and other AI models. Try our free AI content checker now.',
    keywords: [
      'ai detector',
      'detect chatgpt',
      'ai content checker',
      'chatgpt detector',
      'ai detection tool',
      'artificial intelligence detector',
      'content verification',
      'plagiarism checker',
      'ai writing detection',
    ],
  },
  
  pricing: {
    title: 'Pricing Plans - TrueCheckIA AI Detection',
    description: 'Choose the perfect AI detection plan for your needs. Free tier available. Professional plans starting at $12/month with unlimited AI content analysis.',
    keywords: [
      'ai detector pricing',
      'chatgpt detector price',
      'ai detection plans',
      'content analysis pricing',
      'professional ai checker',
    ],
  },
  
  login: {
    title: 'Login - Access Your AI Detection Dashboard',
    description: 'Sign in to your TrueCheckIA account to access advanced AI content detection tools, analysis history, and premium features.',
    keywords: [
      'ai detector login',
      'chatgpt checker access',
      'content analysis login',
      'ai detection dashboard',
    ],
  },
  
  register: {
    title: 'Sign Up - Start Detecting AI Content Today',
    description: 'Create your free TrueCheckIA account and start detecting AI-generated content immediately. No credit card required for free tier.',
    keywords: [
      'ai detector signup',
      'free ai checker',
      'create ai detection account',
      'chatgpt detector registration',
    ],
  },
  
  contact: {
    title: 'Contact Us - TrueCheckIA Support',
    description: 'Get in touch with TrueCheckIA support team. Questions about AI detection, pricing, or technical issues? We\'re here to help.',
    keywords: [
      'ai detector support',
      'chatgpt detector help',
      'content analysis support',
      'ai detection contact',
    ],
  },
  
  privacy: {
    title: 'Privacy Policy - TrueCheckIA',
    description: 'Learn how TrueCheckIA protects your privacy and handles your data during AI content analysis. We prioritize your security and confidentiality.',
    keywords: [
      'ai detector privacy',
      'content analysis privacy',
      'data protection ai',
    ],
    noindex: true,
  },
  
  terms: {
    title: 'Terms of Service - TrueCheckIA',
    description: 'Read TrueCheckIA\'s terms of service for using our AI content detection platform. Understand your rights and responsibilities.',
    keywords: [
      'ai detector terms',
      'content analysis terms',
      'ai detection service terms',
    ],
    noindex: true,
  },
}

/**
 * Generate structured data for pages
 */
export function generateStructuredData(type: 'Organization' | 'WebSite' | 'Product' | 'Article', data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseStructuredData,
        '@type': 'Organization',
        name: 'TrueCheckIA',
        description: 'Professional AI content detection and analysis platform',
        url: baseUrl,
        logo: `${baseUrl}/images/logo.png`,
        sameAs: [
          'https://twitter.com/truecheckia',
          'https://linkedin.com/company/truecheckia',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@truecheckia.com',
        },
        ...data,
      }

    case 'WebSite':
      return {
        ...baseStructuredData,
        '@type': 'WebSite',
        name: 'TrueCheckIA',
        url: baseUrl,
        description: 'Professional AI content detection and analysis platform',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }

    case 'Product':
      return {
        ...baseStructuredData,
        '@type': 'Product',
        name: 'TrueCheckIA AI Detector',
        description: 'Professional AI content detection with 99.7% accuracy',
        brand: {
          '@type': 'Brand',
          name: 'TrueCheckIA',
        },
        offers: {
          '@type': 'Offer',
          price: '12.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '150',
          bestRating: '5',
          worstRating: '1',
        },
        ...data,
      }

    case 'Article':
      return {
        ...baseStructuredData,
        '@type': 'Article',
        publisher: {
          '@type': 'Organization',
          name: 'TrueCheckIA',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo.png`,
          },
        },
        ...data,
      }

    default:
      return baseStructuredData
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}