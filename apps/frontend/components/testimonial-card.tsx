import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatar: string
}

export function TestimonialCard({ quote, author, role, avatar }: TestimonialCardProps) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 text-lg font-medium leading-relaxed">`{quote}`</div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4">
          <Image src={avatar || "/placeholder.svg"} alt={author} width={40} height={40} className="rounded-full" />
          <div>
            <div className="font-medium">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

