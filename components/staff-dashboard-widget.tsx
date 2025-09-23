"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertTriangle, Users, FileText } from "lucide-react"
import Link from "next/link"

interface StaffMetrics {
  total_tasks: number
  pending_tasks: number
  overdue_tasks: number
  completed_today: number
  active_staff: number
  avg_completion_time: number
  productivity_score: number
}

interface RecentTask {
  id: string
  title: string
  assigned_to_name: string
  status: string
  due_date: string
  priority: string
}

export function StaffDashboardWidget() {
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null)
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  // const { user } = useAuth()

  useEffect(() => {
    loadMetrics()
    loadRecentTasks()
  }, [])

  const loadMetrics = async () => {
    // Mock data - replace with actual API call
    setMetrics({
      total_tasks: 47,
      pending_tasks: 12,
      overdue_tasks: 3,
      completed_today: 8,
      active_staff: 24,
      avg_completion_time: 2.5,
      productivity_score: 87,
    })
  }

  const loadRecentTasks = async () => {
    // Mock data - replace with actual API call
    setRecentTasks([
      {
        id: "task-001",
        title: "Patient Intake Assessment",
        assigned_to_name: "Dr. Smith",
        status: "in_progress",
        due_date: "2024-01-18T17:00:00Z",
        priority: "high",
      },
      {
        id: "task-002",
        title: "Medication Review",
        assigned_to_name: "Nurse Wilson",
        status: "overdue",
        due_date: "2024-01-17T15:00:00Z",
        priority: "urgent",
      },
      {
        id: "task-003",
        title: "Compliance Check",
        assigned_to_name: "Counselor Davis",
        status: "pending",
        due_date: "2024-01-19T12:00:00Z",
        priority: "medium",
      },
    ])
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Loading staff metrics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Staff Dashboard
        </CardTitle>
        <CardDescription>Team productivity and task management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Staff Metrics Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{metrics.pending_tasks}</div>
            <div className="text-xs text-muted-foreground">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.overdue_tasks}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completed_today}</div>
            <div className="text-xs text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.active_staff}</div>
            <div className="text-xs text-muted-foreground">Active Staff</div>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Team Productivity</span>
            <span className="text-sm text-muted-foreground">{metrics.productivity_score}%</span>
          </div>
          <Progress value={metrics.productivity_score} className="h-2" />
        </div>

        {/* Overdue Tasks Alert */}
        {metrics.overdue_tasks > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Overdue Tasks Require Attention</div>
              {metrics.overdue_tasks} task(s) are overdue and need immediate review.{" "}
              <Link href="/workflows?tab=overdue" className="underline font-medium">
                View overdue tasks
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Link href="/workflows">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            View All Tasks
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
