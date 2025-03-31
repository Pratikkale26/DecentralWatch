import { Activity, BarChart, Bell, Code, Network, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FeatureCardProps {
  title: string
  description: string
  icon: "Activity" | "Network" | "BarChart" | "Bell" | "Users" | "Code"
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const IconComponent = {
    Activity,
    Network,
    BarChart,
    Bell,
    Users,
    Code,
  }[icon]

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

