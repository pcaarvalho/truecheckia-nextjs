'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      // Here you would integrate with your newsletter service
      // For now, we'll simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <Check className="h-5 w-5" />
            <p className="font-medium">Thanks for subscribing! Check your email for confirmation.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Stay Updated
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get the latest insights on AI detection and content analysis delivered to your inbox.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </CardContent>
    </Card>
  )
}