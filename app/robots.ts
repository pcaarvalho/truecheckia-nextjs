import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.truecheckia.com'
  const isProduction = process.env.NODE_ENV === 'production'

  // Development robots.txt - restrictive
  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  // Production robots.txt - optimized for SEO
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
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
        disallow: [
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
          '/*?*',  // Exclude URLs with query parameters
          '/auth/*',
          '/.well-known/*',
        ],
        crawlDelay: 1, // Be respectful to crawlers
      },
      // Special rules for Google
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/pricing',
          '/contact',
          '/login',
          '/register',
          '/privacy',
          '/terms',
          '/blog/*',
        ],
        disallow: [
          '/api/*',
          '/dashboard/*',
          '/profile/*',
          '/analysis/*',
          '/history/*',
          '/settings/*',
          '/admin/*',
          '/private/*',
          '/auth/*',
        ],
      },
      // Special rules for Bing
      {
        userAgent: 'bingbot',
        allow: [
          '/',
          '/pricing',
          '/contact',
          '/login',
          '/register',
          '/privacy',
          '/terms',
          '/blog/*',
        ],
        disallow: [
          '/api/*',
          '/dashboard/*',
          '/profile/*',
          '/analysis/*',
          '/history/*',
          '/settings/*',
          '/admin/*',
          '/private/*',
          '/auth/*',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}