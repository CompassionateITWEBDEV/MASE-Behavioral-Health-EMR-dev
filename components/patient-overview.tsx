import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, AlertTriangle, Clock } from "lucide-react"

const patientStats = [
  {
    title: "Total Patients",
    value: "247",
    icon: Users,
    change: "+12 this week",
    changeType: "positive",
  },
  {
    title: "Active Treatment",
    value: "189",
    icon: UserCheck,
    change: "+5 this week",
    changeType: "positive",
  },
  {
    title: "High Risk",
    value: "23",
    icon: AlertTriangle,
    change: "-3 this week",
    changeType: "negative",
  },
  {
    title: "Pending Assessments",
    value: "15",
    icon: Clock,
    change: "+2 today",
    changeType: "neutral",
  },
]

const recentPatients = [
  {
    name: "Sarah Johnson",
    id: "PT-2024-001",
    status: "Active",
    lastVisit: "2 hours ago",
    riskLevel: "Low",
    provider: "Dr. Smith",
  },
  {
    name: "Michael Chen",
    id: "PT-2024-002",
    status: "Assessment Due",
    lastVisit: "1 day ago",
    riskLevel: "Medium",
    provider: "Dr. Johnson",
  },
  {
    name: "Emily Rodriguez",
    id: "PT-2024-003",
    status: "High Risk",
    lastVisit: "3 hours ago",
    riskLevel: "High",
    provider: "Dr. Williams",
  },
]

export function PatientOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patientStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-card-foreground font-[family-name:var(--font-work-sans)]">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-work-sans)]">Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-card-foreground">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      patient.riskLevel === "High"
                        ? "destructive"
                        : patient.riskLevel === "Medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {patient.riskLevel} Risk
                  </Badge>
                  <Badge
                    variant={
                      patient.status === "Active"
                        ? "default"
                        : patient.status === "High Risk"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {patient.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{patient.lastVisit}</p>
                    <p className="text-xs text-muted-foreground">{patient.provider}</p>
                  </div>
                  <Button size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
