import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: {
      name: string;
      image: string;
      bio?: string;
    };
    category: string;
    tags: string[];
    readingTime: string;
    featured?: boolean;
    image?: string;
  };
  featured?: boolean;
}

export default function BlogCard({ post, featured }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700">
      {post.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
          {(featured || post.featured) && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-3 leading-tight">
          <Link 
            href={`/blog/${post.slug}`}
            className="text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group-hover:underline"
          >
            {post.title}
          </Link>
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <img
              src={post.author.image}
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <time dateTime={post.date}>{formattedDate}</time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}