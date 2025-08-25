import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: {
    name: string
    image: string
    bio?: string
  }
  category: string
  tags: string[]
  keywords: string[]
  readingTime: string
  featured?: boolean
  image?: string
  content: string
}

export interface BlogPostMetadata {
  slug: string
  title: string
  description: string
  date: string
  author: {
    name: string
    image: string
    bio?: string
  }
  category: string
  tags: string[]
  keywords: string[]
  readingTime: string
  featured?: boolean
  image?: string
}

const postsDirectory = path.join(process.cwd(), 'app/blog/posts')

export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPosts = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        const { text: readingTimeText } = readingTime(content)

        return {
          slug,
          title: data.title,
          description: data.description,
          date: data.date,
          author: data.author,
          category: data.category,
          tags: data.tags || [],
          keywords: data.keywords || [],
          readingTime: readingTimeText,
          featured: data.featured || false,
          image: data.image || null,
        }
      })

    // Sort posts by date (newest first)
    return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const { text: readingTimeText } = readingTime(content)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      category: data.category,
      tags: data.tags || [],
      keywords: data.keywords || [],
      readingTime: readingTimeText,
      featured: data.featured || false,
      image: data.image || null,
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export async function getFeaturedPosts(): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.featured)
}

export async function getPostsByCategory(category: string): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.category.toLowerCase() === category.toLowerCase())
}

export async function getPostsByTag(tag: string): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.tags.includes(tag))
}

export async function getRelatedPosts(currentSlug: string, category: string, tags: string[], limit: number = 3): Promise<BlogPostMetadata[]> {
  const allPosts = await getAllPosts()
  
  // Filter out current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug)
  
  // Score posts based on relevance
  const scoredPosts = otherPosts.map((post) => {
    let score = 0
    
    // Same category gets higher score
    if (post.category === category) {
      score += 3
    }
    
    // Shared tags get points
    const sharedTags = post.tags.filter((tag) => tags.includes(tag))
    score += sharedTags.length * 2
    
    return { ...post, score }
  })
  
  // Sort by score and return top results
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function getAllCategories(): string[] {
  return [
    'AI Detection',
    'Content Analysis',
    'Technology',
    'Best Practices',
    'Tutorials',
    'Industry News'
  ]
}

export function getAllTags(): string[] {
  return [
    'AI',
    'ChatGPT',
    'Detection',
    'Content',
    'Writing',
    'Technology',
    'Education',
    'Tutorial',
    'Guide',
    'SEO'
  ]
}