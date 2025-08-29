import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { getPostBySlug, getAllPosts } from '@/lib/blog/posts'
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

  // Get the processed content without frontmatter
  const processedContent = post.content

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
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
      <header className="mb-12">
        {post.image && (
          <div className="relative h-72 md:h-96 lg:h-[32rem] rounded-2xl overflow-hidden mb-12 shadow-2xl">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {post.category}
            </Badge>
            {post.featured && (
              <Badge variant="default" className="px-3 py-1 text-sm">
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-slate-100">
            {post.title}
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-700">
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{post.author.name}</span>
                <span className="text-sm">Author</span>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <time dateTime={post.date} className="font-medium">
                {format(new Date(post.date), 'MMMM dd, yyyy')}
              </time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">{post.readingTime}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm px-3 py-1 rounded-full">
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
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 prose-pre:rounded-xl">
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
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
          <section className="mt-16 text-center py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Ready to Detect AI Content?
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Experience the power of our AI detection technology. Get detailed analysis with industry-leading 95% accuracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Analyze Your Content
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-600">
                    Read More Articles
                  </Button>
                </Link>
              </div>
            </div>
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