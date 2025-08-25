'use client'

import { useState } from 'react'
import { Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
}

export function ShareButtons({ title, url, description = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://truecheckia.com'}${url}`
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)
  const encodedUrl = encodeURIComponent(shareUrl)
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`,
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full cursor-pointer"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Share on Twitter
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full cursor-pointer"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Share on LinkedIn
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full cursor-pointer"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Share on Facebook
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}