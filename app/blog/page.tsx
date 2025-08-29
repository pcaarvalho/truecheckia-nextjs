import { Suspense, lazy } from 'react'
import Link from 'next/link'
import { Search, Filter, Rss } from 'lucide-react'
import { getAllPosts, getFeaturedPosts, getAllCategories } from '@/lib/blog/posts'

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
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
          <span>Knowledge Hub</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          TrueCheckIA Blog
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
          Stay ahead with the latest insights on AI content detection, writing analysis, and emerging technology trends from our experts.
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
              className="pl-10 h-12 text-base border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-48 h-12 text-base border-slate-200 dark:border-slate-700">
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
            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20">
              <Rss className="h-4 w-4 mr-2" />
              RSS Feed
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Featured Articles</h2>
          </div>
          <Suspense fallback={
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl"></div>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Latest Articles</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 4).map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-400 transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        
        <Suspense fallback={
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl"></div>
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
      <section className="mt-20 text-center py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ready to Detect AI Content?
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Put our industry-leading AI detection technology to the test. Analyze your content with 95% accuracy and detailed insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analysis">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Start Free Analysis
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}