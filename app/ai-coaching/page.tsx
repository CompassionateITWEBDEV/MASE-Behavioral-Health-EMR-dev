"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Brain, MessageSquare, TrendingUp, Lightbulb, Target, BookOpen, Award, Clock, Zap } from "lucide-react"

const coachingModules = [
  {
    id: "documentation",
    name: "Documentation Excellence",
    description: "Improve clinical note quality and compliance",
    progress: 75,
    lessons: 8,
    completed: 6,
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    id: "assessment",
    name: "Assessment Mastery",
    description: "Advanced assessment techniques and tools",
    progress: 60,
    lessons: 12,
    completed: 7,
    icon: Target,
    color: "bg-green-500",
  },
  {
    id: "treatment",
    name: "Treatment Planning",
    description: "Evidence-based treatment planning strategies",
    progress: 40,
    lessons: 10,
    completed: 4,
    icon: Lightbulb,
    color: "bg-purple-500",
  },
  {
    id: "compliance",
    name: "Regulatory Compliance",
    description: "Stay current with healthcare regulations",
    progress: 90,
    lessons: 6,
    completed: 5,
    icon: Award,
    color: "bg-orange-500",
  },
]

const aiSuggestions = [
  {
    id: 1,
    type: "improvement",
    title: "Documentation Efficiency",
    message:
      "Your SOAP notes could benefit from more structured assessment sections. Consider using the AI template suggestions.",
    priority: "medium",
    action: "Review Templates",
  },
  {
    id: 2,
    type: "alert",
    title: "Compliance Reminder",
    message: "Patient consent forms need renewal for 3 patients this week.",
    priority: "high",
    action: "View Patients",
  },
  {
    id: 3,
    type: "tip",
    title: "Best Practice",
    message: "Consider incorporating motivational interviewing techniques in your next session with Patient #247.",
    priority: "low",
    action: "Learn More",
  },
]

const recentActivity = [
  {
    id: 1,
    type: "lesson",
    title: "Completed: Advanced SOAP Note Writing",
    time: "2 hours ago",
    points: 50,
  },
  {
    id: 2,
    type: "suggestion",
    title: "AI suggested improvement for Patient Assessment",
    time: "4 hours ago",
    points: 0,
  },
  {
    id: 3,
    type: "achievement",
    title: "Earned: Documentation Expert Badge",
    time: "1 day ago",
    points: 100,
  },
]

export default function AICoachingPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "achievement":
        return <Award className="h-4 w-4 text-green-500" />
      default:
        return <Brain className="h-4 w-4 text-gray-500" />
    }
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
                AI Clinical Coaching
              </h1>
              <p className="text-muted-foreground mt-2">
                Personalized AI-powered coaching to enhance your clinical skills
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with AI Coach
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-muted-foreground">Coaching Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Badges Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-xs text-muted-foreground">Improvement Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-xs text-muted-foreground">Learning Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Suggestions and Coaching Modules */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                    AI Suggestions
                  </CardTitle>
                  <CardDescription>Personalized recommendations to improve your practice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                          {suggestion.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Coaching Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Modules</CardTitle>
                  <CardDescription>Structured learning paths to enhance your skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coachingModules.map((module) => {
                      const IconComponent = module.icon
                      return (
                        <div
                          key={module.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${module.color}`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{module.name}</h4>
                              <p className="text-xs text-muted-foreground">{module.description}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{module.progress}%</span>
                            </div>
                            <Progress value={module.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {module.completed}/{module.lessons} lessons
                              </span>
                              <Button variant="outline" size="sm">
                                Continue
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Chat */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    AI Coach Chat
                  </CardTitle>
                  <CardDescription>Ask questions and get instant guidance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>AI Coach:</strong>{" "}
                      {
                        "I noticed you've been working on documentation efficiency. Would you like some tips for faster SOAP note completion?"
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Input placeholder="Ask your AI coach..." className="flex-1" />
                    <Button size="sm">Send</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest coaching interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                            {activity.points > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{activity.points} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Learning Library
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="mr-2 h-4 w-4" />
                    Set Learning Goals
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Award className="mr-2 h-4 w-4" />
                    View Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
