import type { MDXComponents } from 'mdx/types'
import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Callout Component
interface CalloutProps {
  children: ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
}

const Callout = ({ children, type = 'info' }: CalloutProps) => {
  return (
    <div
      className={cn(
        'my-6 flex items-start space-x-3 rounded-lg border-l-4 bg-background p-4',
        {
          'border-blue-500 bg-blue-50 dark:bg-blue-950/20': type === 'info',
          'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20': type === 'warning',
          'border-red-500 bg-red-50 dark:bg-red-950/20': type === 'error',
          'border-green-500 bg-green-50 dark:bg-green-950/20': type === 'success',
        }
      )}
    >
      <div className="flex-1 text-sm">{children}</div>
    </div>
  )
}

// Custom Link Component
const CustomLink = (props: any) => {
  const href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

// Code Block Component
const CodeBlock = ({ children, className, ...props }: any) => {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg bg-muted p-4 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </pre>
  )
}

// Table Component
const Table = ({ children, ...props }: any) => (
  <div className="my-6 w-full overflow-y-auto">
    <table className="w-full" {...props}>{children}</table>
  </div>
)

const THead = ({ children, ...props }: any) => (
  <thead className="border-b border-border" {...props}>
    <tr className="m-0 p-0 even:bg-muted">{children}</tr>
  </thead>
)

const TBody = ({ children, ...props }: any) => (
  <tbody {...props}>{children}</tbody>
)

const TR = ({ children, ...props }: any) => (
  <tr className="m-0 border-t border-border p-0 even:bg-muted" {...props}>{children}</tr>
)

const TH = ({ children, ...props }: any) => (
  <th className="border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props}>
    {children}
  </th>
)

const TD = ({ children, ...props }: any) => (
  <td className="border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props}>
    {children}
  </td>
)

// Image Component
const CustomImage = ({ src, alt, ...props }: any) => {
  return (
    <div className="my-6">
      <Image
        src={src}
        alt={alt}
        className="rounded-lg"
        width={800}
        height={400}
        {...props}
      />
    </div>
  )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Typography
    h1: ({ children }) => (
      <h1 className="mb-6 mt-8 scroll-m-20 text-4xl font-bold tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-8 scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-4 scroll-m-20 text-xl font-semibold tracking-tight">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7 [&:not(:first-child)]:mt-6">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mb-6 border-l-4 border-border pl-6 italic">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) =>
      className ? (
        <CodeBlock className={className}>{children}</CodeBlock>
      ) : (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {children}
        </code>
      ),
    pre: CodeBlock,
    
    // Links and Images
    a: CustomLink,
    img: CustomImage,
    
    // Tables
    table: Table,
    thead: THead,
    tbody: TBody,
    tr: TR,
    th: TH,
    td: TD,
    
    // Custom Components
    Callout,
    
    ...components,
  }
}