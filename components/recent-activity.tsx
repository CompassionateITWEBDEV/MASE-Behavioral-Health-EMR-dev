import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "assessment",
    user: "Dr. Sarah Smith",
    userInitials: "SS",
    action: "completed biopsychosocial assessment for",
    patient: "Michael Chen",
    time: "15 minutes ago",
    status: "completed",
  },
  {
    id: 2,
    type: "note",
    user: "RN Jennifer Wilson",
    userInitials: "JW",
    action: "added SOAP note for",
    patient: "Emily Rodriguez",
    time: "32 minutes ago",
    status: "completed",
  },
  {
    id: 3,
    type: "alert",
    user: "AI System",
    userInitials: "AI",
    action: "flagged high-risk status for",
    patient: "David Thompson",
    time: "1 hour ago",
    status: "alert",
  },
  {
    id: 4,
    type: "medication",
    user: "Dr. Mark Johnson",
    userInitials: "MJ",
    action: "updated medication plan for",
    patient: "Sarah Johnson",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 5,
    type: "peer",
    user: "Peer Coach Lisa Brown",
    userInitials: "LB",
    action: "completed community visit with",
    patient: "Robert Wilson",
    time: "3 hours ago",
    status: "completed",
  },
  {
    id: 6,
    type: "uds",
    user: "Collector Tom Davis",
    userInitials: "TD",
    action: "collected UDS sample from",
    patient: "Maria Garcia",
    time: "4 hours ago",
    status: "pending",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={`text-xs ${
                    activity.user === "AI System" ? "bg-accent text-accent-foreground" : "bg-muted"
                  }`}
                >
                  {activity.userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                  <span className="font-medium">{activity.patient}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>

              <Badge
                variant={
                  activity.status === "completed"
                    ? "default"
                    : activity.status === "alert"
                      ? "destructive"
                      : activity.status === "pending"
                        ? "secondary"
                        : "outline"
                }
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
