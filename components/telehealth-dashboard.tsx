"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Mic, Clock, FileText, Edit, Check } from "lucide-react"
import { TelehealthSession } from "@/components/telehealth-session"
import { AutoDictationPanel } from "@/components/auto-dictation-panel"

export function TelehealthDashboard() {
  const [activeSession, setActiveSession] = useState<string | null>(null)

  const upcomingAppointments = [
    {
      id: "1",
      patient: "Sarah Johnson",
      time: "2:00 PM",
      type: "Individual Therapy",
      provider: "Dr. Smith (LMSW)",
      status: "scheduled",
    },
    {
      id: "2",
      patient: "Michael Chen",
      time: "3:30 PM",
      type: "Group Therapy",
      provider: "Lisa Brown (RN)",
      status: "waiting",
    },
    {
      id: "3",
      patient: "Emma Davis",
      time: "4:00 PM",
      type: "Medication Management",
      provider: "Dr. Wilson (MD)",
      status: "scheduled",
    },
  ]

  const activeSessions = [
    {
      id: "session-1",
      patient: "John Doe",
      provider: "Dr. Smith",
      startTime: "1:45 PM",
      duration: "15 min",
      type: "telehealth",
      status: "in-progress",
    },
    {
      id: "session-2",
      patient: "Jane Wilson",
      provider: "Sarah Johnson (Peer Coach)",
      startTime: "2:15 PM",
      duration: "8 min",
      type: "in-person",
      status: "recording",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
            Telehealth & Session Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage virtual and in-person sessions with AI-powered documentation
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-primary hover:bg-primary/90">
            <Video className="mr-2 h-4 w-4" />
            Start Session
          </Button>
          <Button variant="outline">
            <Mic className="mr-2 h-4 w-4" />
            Audio Only
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="appointments">Upcoming</TabsTrigger>
          <TabsTrigger value="dictation">Auto-Dictation</TabsTrigger>
          <TabsTrigger value="recordings">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {activeSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.patient}</CardTitle>
                    <Badge variant={session.type === "telehealth" ? "default" : "secondary"}>
                      {session.type === "telehealth" ? "Virtual" : "In-Person"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Provider: {session.provider} • Started: {session.startTime}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Duration: {session.duration}
                    </span>
                    <Badge variant={session.status === "recording" ? "destructive" : "default"}>
                      {session.status === "recording" ? "Recording" : "In Progress"}
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => setActiveSession(session.id)} className="flex-1">
                      <Video className="mr-2 h-4 w-4" />
                      Join Session
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeSession && <TelehealthSession sessionId={activeSession} onClose={() => setActiveSession(null)} />}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Scheduled telehealth and in-person sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time} • {appointment.type}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.provider}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Video className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                      <Button size="sm" variant="ghost">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dictation">
          <AutoDictationPanel />
        </TabsContent>

        <TabsContent value="recordings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Recordings & Transcripts</CardTitle>
              <CardDescription>Review and edit AI-generated documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Session with Patient #{i}</p>
                        <p className="text-sm text-muted-foreground">Today, 2:00 PM • 45 minutes • Dr. Smith</p>
                        <p className="text-sm text-muted-foreground">Status: Pending Review</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
