import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalloutProps {
  type: 'info' | 'warning' | 'success' | 'error'
  children: React.ReactNode
  className?: string
}

const calloutStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-900 dark:text-amber-100',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100'
}

const calloutIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle
}

export default function Callout({ type, children, className }: CalloutProps) {
  const Icon = calloutIcons[type]
  
  return (
    <div className={cn('my-6 p-4 rounded-lg border-l-4 flex gap-3', calloutStyles[type], className)}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}