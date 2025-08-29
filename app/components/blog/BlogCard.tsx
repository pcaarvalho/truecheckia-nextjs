'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Clock, Calendar, User, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { BlogPostMetadata } from '@/lib/blog/posts'

interface BlogCardProps {
  post: BlogPostMetadata
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <Card className={`group overflow-hidden transition-all hover:shadow-lg ${featured ? 'md:col-span-2 lg:col-span-2' : ''}`}>
      <Link href={`/blog/${post.slug}`}>
        {post.image && (
          <div className={`relative overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {post.featured && (
              <div className="absolute left-4 top-4">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMM dd, yyyy')}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
          </div>
          
          <h3 className={`font-bold leading-tight group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={post.author.image}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{post.author.name}</span>
                  <Badge variant="outline" className="text-xs w-fit">
                    {post.category}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
              <span>Read more</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}