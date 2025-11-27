'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

const aiSuggestions = [
  {
    type: "alert",
    priority: "high",
    title: "Missing Suicide Screening",
    description: "Patient Sarah Johnson (PT-2024-001) has no suicide screening completed in the last 30 days.",
    action: "Complete Assessment",
    icon: AlertCircle,
  },
  {
    type: "suggestion",
    priority: "medium",
    title: "Pain Score Follow-up",
    description: "Michael Chen reported pain ≥ 7. Consider intervention or medication review.",
    action: "Review Case",
    icon: Clock,
  },
  {
    type: "compliance",
    priority: "low",
    title: "Treatment Plan Update Due",
    description: "Quarterly update required for Emily Rodriguez treatment plan.",
    action: "Update Plan",
    icon: CheckCircle,
  },
]

export function AICoachingPanel() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('[v0] AI coaching panel loaded successfully')
      } catch (err) {
        console.error('[v0] Error loading AI coaching panel:', err)
        setError('Failed to load AI suggestions')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-accent" />
            <span>AI Coaching</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-[family-name:var(--font-work-sans)]">
          <Brain className="h-5 w-5 text-accent" />
          <span>AI Coaching</span>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            5 Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiSuggestions.map((suggestion, index) => (
          <div key={index} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex items-start space-x-3">
              <suggestion.icon
                className={`h-5 w-5 mt-0.5 ${
                  suggestion.priority === "high"
                    ? "text-destructive"
                    : suggestion.priority === "medium"
                      ? "text-accent"
                      : "text-muted-foreground"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-card-foreground">{suggestion.title}</h4>
                  <Badge
                    variant={
                      suggestion.priority === "high"
                        ? "destructive"
                        : suggestion.priority === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                <Button size="sm" variant={suggestion.priority === "high" ? "default" : "outline"}>
                  {suggestion.action}
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full bg-transparent">
          View All AI Suggestions
        </Button>
      </CardContent>
    </Card>
  )
}
