import { getRelatedPosts } from '@/app/lib/blog/posts'
import { BlogCard } from './BlogCard'

interface RelatedPostsProps {
  currentSlug: string
  category: string
  tags: string[]
  limit?: number
}

export async function RelatedPosts({
  currentSlug,
  category,
  tags,
  limit = 3,
}: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentSlug, category, tags, limit)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}