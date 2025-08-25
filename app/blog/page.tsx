import { Suspense, lazy } from 'react'
import Link from 'next/link'
import { Search, Filter, Rss } from 'lucide-react'
import { getAllPosts, getFeaturedPosts, getAllCategories } from '@/app/lib/blog/posts'

// Lazy load blog components
const BlogCard = lazy(() => import('@/components/features/blog/BlogCard').catch(() => ({ default: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div> })));
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default async function BlogPage() {
  const [allPosts, featuredPosts, categories] = await Promise.all([
    getAllPosts(),
    getFeaturedPosts(),
    Promise.resolve(getAllCategories())
  ])

  const regularPosts = allPosts.filter(post => !post.featured)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">TrueCheckIA Blog</h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Stay ahead with the latest insights on AI content detection, writing analysis, and emerging technology trends.
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RSS Link */}
        <div className="flex justify-center">
          <Link href="/blog/rss.xml">
            <Button variant="outline" size="sm">
              <Rss className="h-4 w-4 mr-2" />
              RSS Feed
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <Suspense fallback={
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          }>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} featured />
              ))}
            </div>
          </Suspense>
        </section>
      )}

      {/* All Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <div className="flex gap-2">
            {categories.slice(0, 4).map((category) => (
              <Badge key={category} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                {category}
              </Badge>
            ))}
          </div>
        </div>
        
        <Suspense fallback={
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        }>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center py-12 bg-primary/5 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Try TrueCheckIA AI Detector</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Put our AI detection technology to the test. Analyze your content for AI-generated text with industry-leading accuracy.
        </p>
        <Link href="/analysis">
          <Button size="lg">
            Start Free Analysis
          </Button>
        </Link>
      </section>
    </div>
  )
}