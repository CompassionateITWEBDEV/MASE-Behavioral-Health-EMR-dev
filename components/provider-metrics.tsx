import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, FileText, Clock } from "lucide-react"

const providerStats = [
  {
    name: "Dr. Sarah Smith",
    role: "LMSW",
    patients: 45,
    completionRate: 94,
    avgTime: "18 min",
    status: "excellent",
  },
  {
    name: "Dr. Mark Johnson",
    role: "MD",
    patients: 32,
    completionRate: 89,
    avgTime: "22 min",
    status: "good",
  },
  {
    name: "RN Jennifer Wilson",
    role: "RN",
    patients: 67,
    completionRate: 91,
    avgTime: "15 min",
    status: "excellent",
  },
  {
    name: "Lisa Brown",
    role: "Peer Coach",
    patients: 28,
    completionRate: 87,
    avgTime: "35 min",
    status: "good",
  },
]

const teamMetrics = [
  {
    title: "Documentation Rate",
    value: 92,
    target: 95,
    icon: FileText,
  },
  {
    title: "Patient Satisfaction",
    value: 88,
    target: 90,
    icon: Users,
  },
  {
    title: "Response Time",
    value: 85,
    target: 80,
    icon: Clock,
  },
]

export function ProviderMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
          <TrendingUp className="h-5 w-5" />
          <span>Provider Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {teamMetrics.map((metric) => (
            <div key={metric.title} className="text-center space-y-2">
              <metric.icon className="h-6 w-6 mx-auto text-primary" />
              <div>
                <p className="text-2xl font-bold text-card-foreground">{metric.value}%</p>
                <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
              </div>
              <p className="text-xs font-medium text-card-foreground">{metric.title}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-card-foreground mb-4">Individual Performance</h4>
          <div className="space-y-4">
            {providerStats.map((provider) => (
              <div key={provider.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {provider.role} • {provider.patients} patients
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        provider.status === "excellent"
                          ? "default"
                          : provider.status === "good"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {provider.completionRate}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{provider.avgTime}</span>
                  </div>
                </div>
                <Progress value={provider.completionRate} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
