interface RelatedPostsProps {
  currentSlug: string;
  category: string;
  tags: string[];
}

export default function RelatedPosts({ currentSlug, category, tags }: RelatedPostsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Related Posts</h3>
      <div className="text-sm text-gray-600">
        Related posts for category: {category}
      </div>
    </div>
  );
}