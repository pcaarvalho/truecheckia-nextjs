import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Blog - TrueCheckIA',
    template: '%s | TrueCheckIA Blog'
  },
  description: 'Latest insights on AI content detection, writing analysis, and technology trends',
  keywords: [
    'AI detection',
    'content analysis',
    'ChatGPT detector',
    'AI writing detection',
    'artificial intelligence',
    'content verification',
    'plagiarism detection'
  ],
  authors: [{ name: 'TrueCheckIA Team' }],
  openGraph: {
    type: 'website',
    siteName: 'TrueCheckIA Blog',
    title: 'TrueCheckIA Blog - AI Detection & Content Analysis Insights',
    description: 'Stay updated with the latest developments in AI content detection and analysis',
    images: [
      {
        url: '/blog-og-image.png',
        width: 1200,
        height: 630,
        alt: 'TrueCheckIA Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@truecheckia',
    creator: '@truecheckia',
  },
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': '/blog/rss.xml',
    },
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}