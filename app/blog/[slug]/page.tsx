import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { getPostBySlug, getAllPosts } from '@/app/lib/blog/posts'
import ShareButtons from '@/components/blog/ShareButtons'
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPosts from '@/components/blog/RelatedPosts';
import AuthorBio from '@/components/blog/AuthorBio';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const publishedTime = new Date(post.date).toISOString()
  const modifiedTime = new Date(post.date).toISOString()

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime,
      modifiedTime,
      authors: [post.author.name],
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Import the MDX content dynamically
  const { default: MDXContent } = await import(`../posts/${slug}.mdx`)

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        {post.image && (
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            {post.featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-medium text-foreground">{post.author.name}</span>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMMM dd, yyyy')}
              </time>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <ShareButtons
              title={post.title}
              url={`/blog/${post.slug}`}
              description={post.description}
            />
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Table of Contents - Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MDXContent />
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12">
            <NewsletterSignup />
          </div>

          {/* Author Bio */}
          <AuthorBio author={post.author} />

          {/* Related Posts */}
          <RelatedPosts
            currentSlug={post.slug}
            category={post.category}
            tags={post.tags}
          />

          {/* CTA Section */}
          <section className="mt-12 text-center py-8 bg-primary/5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Ready to detect AI content?</h3>
            <p className="text-muted-foreground mb-4">
              Try our advanced AI detection tool and see the technology in action.
            </p>
            <Link href="/analysis">
              <Button size="lg">
                Analyze Your Content
              </Button>
            </Link>
          </section>
        </main>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            image: post.image ? `${process.env.NEXT_PUBLIC_BASE_URL}${post.image}` : undefined,
            datePublished: post.date,
            dateModified: post.date,
            author: {
              '@type': 'Person',
              name: post.author.name,
              image: post.author.image,
            },
            publisher: {
              '@type': 'Organization',
              name: 'TrueCheckIA',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`,
            },
          }),
        }}
      />
    </article>
  )
}