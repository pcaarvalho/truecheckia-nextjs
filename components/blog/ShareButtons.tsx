'use client'

import { Share2, Twitter, Linkedin, Facebook, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShareButtonsProps {
  title: string;
  url: string;
  description: string;
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://truecheckia.com'}${url}`;
  
  const handleShare = (platform: string) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedDescription = encodeURIComponent(description);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (error) {
        // User canceled or error occurred
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Share this article
      </span>
      <div className="flex gap-2">
        {/* Native Share (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            size="sm"
            onClick={nativeShare}
            className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        
        {/* Twitter */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        
        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        
        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        
        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-slate-800"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}