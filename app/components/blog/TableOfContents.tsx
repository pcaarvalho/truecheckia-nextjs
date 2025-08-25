'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the page
    const elements = Array.from(document.querySelectorAll('h2, h3, h4'))
    const headingsList: Heading[] = elements.map((element) => ({
      id: element.id,
      text: element.textContent || '',
      level: parseInt(element.tagName.charAt(1)),
    }))

    setHeadings(headingsList)

    // Set up intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0% -80%',
        threshold: 0.5,
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80 // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (headings.length === 0) return null

  return (
    <nav className={cn('space-y-2', className)}>
      <h4 className="font-semibold text-sm text-foreground mb-4">Table of Contents</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                'block w-full text-left text-muted-foreground hover:text-foreground transition-colors',
                {
                  'ml-0': heading.level === 2,
                  'ml-4': heading.level === 3,
                  'ml-8': heading.level === 4,
                  'text-primary font-medium': activeId === heading.id,
                }
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}