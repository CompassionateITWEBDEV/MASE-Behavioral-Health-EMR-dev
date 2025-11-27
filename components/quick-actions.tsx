'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Calendar, ClipboardList, TestTube, CreditCard, FileCheck, Pill } from 'lucide-react'
import { AlertTriangle } from 'lucide-react' // Added import for AlertTriangle

const quickActions = [
  {
    title: "New Patient Intake",
    description: "Start biopsychosocial assessment",
    icon: UserPlus,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "SOAP Note",
    description: "Document patient session",
    icon: FileText,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "Schedule Appointment",
    description: "Book patient visit",
    icon: Calendar,
    color: "bg-accent text-accent-foreground",
  },
  {
    title: "ASAM Assessment",
    description: "Complete ASAM criteria",
    icon: ClipboardList,
    color: "bg-chart-1 text-white",
  },
  {
    title: "Insurance Verification",
    description: "Check patient coverage",
    icon: CreditCard,
    color: "bg-chart-2 text-white",
  },
  {
    title: "Prior Authorization",
    description: "Submit new auth request",
    icon: FileCheck,
    color: "bg-chart-3 text-white",
  },
  {
    title: "PMP Check",
    description: "Search prescription history",
    icon: Pill,
    color: "bg-chart-4 text-white",
  },
  {
    title: "UDS Collection",
    description: "Record drug screening",
    icon: TestTube,
    color: "bg-chart-5 text-white",
  },
]

import { useState, useEffect } from 'react'

export function QuickActions() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log('[v0] Quick actions loaded successfully')
    } catch (err) {
      console.error('[v0] Error loading quick actions:', err)
      setError('Failed to load quick actions')
    }
  }, [])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
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
        <CardTitle className="font-[family-name:var(--font-work-sans)]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted bg-transparent"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-card-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
