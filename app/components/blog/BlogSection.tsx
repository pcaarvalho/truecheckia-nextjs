import Link from 'next/link'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFeaturedPosts } from '@/lib/blog/posts'

export async function BlogSection() {
  const featuredPosts = await getFeaturedPosts()
  const postsToShow = featuredPosts.slice(0, 3)

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Latest Insights
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Ahead with AI Detection Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest trends, techniques, and best practices in AI content detection from our expert team.
          </p>
        </div>

        {postsToShow.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {postsToShow.map((post) => (
                <Card key={post.slug} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <Link href={`/blog/${post.slug}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.date}>
                          {format(new Date(post.date), 'MMM dd, yyyy')}
                        </time>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{post.readingTime}</span>
                      </div>
                      
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{post.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                          <span>Read more</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/blog">
                  View All Articles
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Blog Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                We're preparing insightful articles about AI detection, content analysis, and industry trends.
              </p>
              <Button asChild>
                <Link href="/analysis">
                  Try Our AI Detector
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}