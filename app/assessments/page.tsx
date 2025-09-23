"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClipboardList, Plus, Search, Calendar, User, TrendingUp, Brain, Heart, Shield } from "lucide-react"

const assessmentTypes = [
  {
    id: "intake",
    name: "Intake Assessment",
    description: "Initial patient evaluation and screening",
    count: 23,
    avgTime: "45 min",
    color: "bg-blue-500",
    icon: ClipboardList,
  },
  {
    id: "mental-health",
    name: "Mental Health Screening",
    description: "PHQ-9, GAD-7, and other mental health tools",
    count: 67,
    avgTime: "20 min",
    color: "bg-purple-500",
    icon: Brain,
  },
  {
    id: "substance-use",
    name: "Substance Use Assessment",
    description: "AUDIT, DAST-10, and addiction severity",
    count: 45,
    avgTime: "30 min",
    color: "bg-orange-500",
    icon: Heart,
  },
  {
    id: "risk",
    name: "Risk Assessment",
    description: "Suicide risk, violence risk, and safety planning",
    count: 34,
    avgTime: "25 min",
    color: "bg-red-500",
    icon: Shield,
  },
]

const recentAssessments = [
  {
    id: 1,
    type: "Mental Health Screening",
    patient: "Sarah Johnson",
    provider: "Dr. Smith",
    date: "2025-01-09",
    status: "completed",
    score: 85,
    risk: "low",
  },
  {
    id: 2,
    type: "Substance Use Assessment",
    patient: "Michael Chen",
    provider: "Lisa Rodriguez, LMSW",
    date: "2025-01-09",
    status: "in-progress",
    score: null,
    risk: "pending",
  },
  {
    id: 3,
    type: "Risk Assessment",
    patient: "Emily Davis",
    provider: "Dr. Johnson",
    date: "2025-01-08",
    status: "completed",
    score: 92,
    risk: "moderate",
  },
  {
    id: 4,
    type: "Intake Assessment",
    patient: "Robert Wilson",
    provider: "Maria Garcia, RN",
    date: "2025-01-08",
    status: "scheduled",
    score: null,
    risk: "pending",
  },
]

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, color: "text-green-600" },
      "in-progress": { variant: "secondary" as const, color: "text-blue-600" },
      scheduled: { variant: "outline" as const, color: "text-gray-600" },
      overdue: { variant: "destructive" as const, color: "text-red-600" },
    }
    const config = variants[status as keyof typeof variants] || variants.scheduled
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    )
  }

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "default",
      moderate: "secondary",
      high: "destructive",
      pending: "outline",
    } as const
    return <Badge variant={variants[risk as keyof typeof variants]}>{risk} risk</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Clinical Assessments
              </h1>
              <p className="text-muted-foreground mt-2">Standardized screening tools and clinical evaluations</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>

          {/* Assessment Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {assessmentTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg: {type.avgTime}</span>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Progress value={87} className="h-2" />
                  </div>
                  <span className="text-2xl font-bold">87%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.5</div>
                <p className="text-xs text-muted-foreground mt-2">Across all assessment types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">12</div>
                <p className="text-xs text-muted-foreground mt-2">Requiring immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assessments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Assessments</CardTitle>
                  <CardDescription>Latest clinical evaluations and screenings</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{assessment.type}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{assessment.patient}</span>
                          <span>•</span>
                          <span>{assessment.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(assessment.status)}
                          {assessment.risk !== "pending" && getRiskBadge(assessment.risk)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {assessment.date}
                          {assessment.score && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Score: {assessment.score}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
