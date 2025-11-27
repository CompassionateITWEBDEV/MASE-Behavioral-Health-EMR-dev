'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'

const complianceMetrics = [
  {
    category: "Documentation",
    score: 94,
    status: "excellent",
    details: "235/250 notes completed on time",
  },
  {
    category: "ASAM Assessments",
    score: 87,
    status: "good",
    details: "43/50 assessments current",
  },
  {
    category: "Treatment Plans",
    score: 76,
    status: "needs-attention",
    details: "38/50 plans updated quarterly",
  },
  {
    category: "Safety Protocols",
    score: 98,
    status: "excellent",
    details: "49/50 safety screenings complete",
  },
]

const recentAudits = [
  {
    date: "2024-01-15",
    type: "Monthly Chart Audit",
    result: "Passed",
    score: "92%",
  },
  {
    date: "2024-01-10",
    type: "HIPAA Compliance",
    result: "Passed",
    score: "98%",
  },
  {
    date: "2024-01-05",
    type: "SAMHSA Review",
    result: "Action Required",
    score: "85%",
  },
]

export function ComplianceTracker() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('[v0] Compliance tracker loaded successfully')
      } catch (err) {
        console.error('[v0] Error loading compliance tracker:', err)
        setError('Failed to load compliance data')
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
            <Shield className="h-5 w-5 text-primary" />
            <span>Compliance Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
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
          <Shield className="h-5 w-5 text-primary" />
          <span>Compliance Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {complianceMetrics.map((metric) => (
            <div key={metric.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">{metric.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{metric.score}%</span>
                  {metric.status === "excellent" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : metric.status === "needs-attention" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
              <Progress value={metric.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{metric.details}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-card-foreground mb-3">Recent Audits</h4>
          <div className="space-y-2">
            {recentAudits.map((audit, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-card-foreground">{audit.type}</p>
                  <p className="text-muted-foreground">{audit.date}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      audit.result === "Passed"
                        ? "default"
                        : audit.result === "Action Required"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {audit.result}
                  </Badge>
                  <p className="text-muted-foreground mt-1">{audit.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
