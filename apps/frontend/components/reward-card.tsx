import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface RewardCardProps {
  title: string
  description: string
  value: string
  unit: string
}

export function RewardCard({ title, description, value, unit }: RewardCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}

