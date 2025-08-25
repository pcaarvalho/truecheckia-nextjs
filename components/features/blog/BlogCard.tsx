import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    description: string;
    publishedAt?: string;
    category: string;
    readingTime?: string;
    featured?: boolean;
  };
  featured?: boolean;
}

export default function BlogCard({ post, featured }: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">{post.category}</Badge>
        {featured && <Badge variant="default">Featured</Badge>}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        <Link 
          href={`/blog/${post.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {post.title}
        </Link>
      </h3>
      
      <p className="text-gray-600 mb-4">{post.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{post.publishedAt || 'No date'}</span>
        <span>{post.readingTime || 'Quick read'}</span>
      </div>
    </article>
  );
}