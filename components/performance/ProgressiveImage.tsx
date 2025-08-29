'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  lowResSrc?: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

export function ProgressiveImage({
  src,
  lowResSrc,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 90
}: ProgressiveImageProps) {
  const [isHighResLoaded, setIsHighResLoaded] = useState(false)
  const [isLowResLoaded, setIsLowResLoaded] = useState(false)

  // Generate low-res placeholder if not provided
  const defaultLowResSrc = lowResSrc || `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>`
  ).toString('base64')}`

  useEffect(() => {
    // Preload high-res image
    const img = new window.Image()
    img.onload = () => setIsHighResLoaded(true)
    img.src = src
  }, [src])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Low-res/placeholder image */}
      <Image
        src={defaultLowResSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'transition-opacity duration-500 absolute inset-0',
          isHighResLoaded ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLowResLoaded(true)}
      />

      {/* High-res image */}
      {isHighResLoaded && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          className={cn(
            'transition-opacity duration-500',
            isHighResLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Loading skeleton */}
      {!isLowResLoaded && !isHighResLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
    </div>
  )
}