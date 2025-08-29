import { NextResponse } from 'next/server'
import { generateRSSFeed } from '@/lib/blog/rss'

export async function GET() {
  try {
    const feed = await generateRSSFeed()
    
    return new NextResponse(feed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}