/**
 * SEO utility functions for TrueCheckIA
 */

/**
 * Generate Open Graph image URL
 */
export function generateOGImageUrl(params: {
  title: string
  description?: string
  theme?: 'light' | 'dark'
  type?: 'default' | 'blog' | 'pricing'
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  const { title, description, theme = 'light', type = 'default' } = params
  
  // This would integrate with a dynamic OG image generation service
  // For now, return a static image path
  return `${baseUrl}/images/og/${type}-${theme}.jpg`
}

/**
 * Clean text for SEO purposes (remove HTML, limit length)
 */
export function cleanTextForSEO(text: string, maxLength: number = 160): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, maxLength)
    .replace(/\s+\S*$/, '') // Remove partial word at end
    + (text.length > maxLength ? '...' : '')
}

/**
 * Generate keywords from text content
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const commonWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
    'these', 'those', 'i', 'me', 'we', 'us', 'you', 'he', 'him', 'she', 'her',
    'it', 'they', 'them', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'must', 'shall'
  ]

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))

  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

/**
 * Generate URL slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Validate and format URL
 */
export function formatUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Calculate reading time for blog posts
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Generate breadcrumb items from pathname
 */
export function generateBreadcrumbs(pathname: string): Array<{ name: string; url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  const segments = pathname.split('/').filter(Boolean)
  
  const breadcrumbs = [
    { name: 'Home', url: baseUrl }
  ]

  let currentPath = ''
  segments.forEach(segment => {
    currentPath += `/${segment}`
    
    // Convert segment to readable name
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({
      name,
      url: `${baseUrl}${currentPath}`
    })
  })

  return breadcrumbs
}

/**
 * Check if content is duplicate
 */
export function isDuplicateContent(content1: string, content2: string, threshold: number = 0.8): boolean {
  const words1 = new Set(content1.toLowerCase().split(/\s+/))
  const words2 = new Set(content2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])
  
  const similarity = intersection.size / union.size
  return similarity >= threshold
}

/**
 * Generate canonical URL with proper trailing slash handling
 */
export function generateCanonicalUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  
  // Remove trailing slash except for root
  const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '')
  
  return `${baseUrl}${cleanPath}`
}

/**
 * Generate hreflang alternates
 */
export function generateHreflangAlternates(pathname: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  
  const languages = {
    'en': baseUrl + pathname,
    'en-US': baseUrl + pathname,
    'pt-BR': baseUrl + '/pt' + pathname,
    'es-ES': baseUrl + '/es' + pathname,
    'x-default': baseUrl + pathname, // Default for unspecified regions
  }

  return languages
}

/**
 * Validate structured data
 */
export function validateStructuredData(data: any): boolean {
  try {
    // Basic validation for required fields
    if (!data['@context'] || !data['@type']) {
      return false
    }
    
    // Ensure no undefined values that could break JSON
    const jsonString = JSON.stringify(data)
    return jsonString.indexOf('undefined') === -1
  } catch {
    return false
  }
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate review/rating structured data
 */
export function generateReviewStructuredData(reviews: Array<{
  author: string
  rating: number
  text: string
  date: string
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'TrueCheckIA AI Detector',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: review.text,
      datePublished: review.date,
    })),
    url: baseUrl,
  }
}