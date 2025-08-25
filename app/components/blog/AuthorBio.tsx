import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface AuthorBioProps {
  author: {
    name: string
    image: string
    bio?: string
  }
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full flex-shrink-0">
            <Image
              src={author.image}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">About {author.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {author.bio || 
                `${author.name} is a technology writer and expert in AI content detection. With years of experience in digital content analysis, they help businesses and individuals understand the evolving landscape of AI-generated content.`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}