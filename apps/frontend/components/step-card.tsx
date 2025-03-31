import { Globe, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface StepCardProps {
  step: string
  title: string
  description: string
  icon: "Globe" | "Shield" | "Zap"
}

export function StepCard({ step, title, description, icon }: StepCardProps) {
  const IconComponent = {
    Globe,
    Shield,
    Zap,
  }[icon]

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rotate-45 bg-muted opacity-20 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Step {step}</div>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

