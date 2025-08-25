interface ShareButtonsProps {
  title: string;
  url: string;
  description: string;
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  return (
    <div className="flex gap-4 mt-6">
      <div className="text-sm text-gray-600">Share this article</div>
    </div>
  );
}