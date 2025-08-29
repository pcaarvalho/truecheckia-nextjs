import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

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

    // Process MDX to HTML with custom components
    let processedContent = content;
    
    // Replace custom Callout components with HTML
    processedContent = processedContent.replace(
      /<Callout type="(\w+)">/g,
      '<div class="callout callout-$1 my-6 p-4 rounded-lg border-l-4">'
    );
    processedContent = processedContent.replace(/<\/Callout>/g, '</div>');
    
    // Process markdown to HTML
    const processedMarkdown = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(processedContent);
    
    const htmlContent = processedMarkdown.toString();
    
    // Add custom styling classes to HTML elements
    const styledContent = htmlContent
      .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mt-8 mb-4 text-slate-900 dark:text-slate-100">')
      .replace(/<h3>/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-slate-900 dark:text-slate-100">')
      .replace(/<p>/g, '<p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">')
      .replace(/<ul>/g, '<ul class="mb-4 space-y-2 list-disc list-inside">')
      .replace(/<ol>/g, '<ol class="mb-4 space-y-2 list-decimal list-inside">')
      .replace(/<li>/g, '<li class="text-slate-700 dark:text-slate-300">')
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic">')
      .replace(/<code>/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono">')
      .replace(/<pre><code/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto my-4"><code')
      .replace(/class="callout callout-info/g, 'class="callout callout-info bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100')
      .replace(/class="callout callout-warning/g, 'class="callout callout-warning bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-900 dark:text-amber-100')
      .replace(/class="callout callout-success/g, 'class="callout callout-success bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100')
      .replace(/class="callout callout-error/g, 'class="callout callout-error bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100');

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
      content: styledContent,
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