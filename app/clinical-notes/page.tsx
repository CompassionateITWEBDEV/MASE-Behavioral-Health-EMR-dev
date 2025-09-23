"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  Edit3,
  Save,
  Mic,
  MicOff,
  Brain,
  FileText,
} from "lucide-react"

const noteTemplates = [
  {
    id: "soap",
    name: "SOAP Note",
    description: "Subjective, Objective, Assessment, Plan",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    id: "progress",
    name: "Progress Note",
    description: "Session progress and observations",
    icon: Clock,
    color: "bg-green-500",
  },
  {
    id: "intake",
    name: "Intake Note",
    description: "Initial patient evaluation",
    icon: User,
    color: "bg-purple-500",
  },
  {
    id: "discharge",
    name: "Discharge Summary",
    description: "Treatment completion summary",
    icon: Stethoscope,
    color: "bg-orange-500",
  },
]

const recentNotes = [
  {
    id: 1,
    type: "SOAP Note",
    patient: "Sarah Johnson",
    provider: "Dr. Smith",
    date: "2025-01-09",
    time: "10:30 AM",
    status: "completed",
    aiAssisted: true,
  },
  {
    id: 2,
    type: "Progress Note",
    patient: "Michael Chen",
    provider: "Lisa Rodriguez, LMSW",
    date: "2025-01-09",
    time: "09:15 AM",
    status: "draft",
    aiAssisted: true,
  },
  {
    id: 3,
    type: "Intake Note",
    patient: "Emily Davis",
    provider: "Dr. Johnson",
    date: "2025-01-08",
    time: "02:00 PM",
    status: "completed",
    aiAssisted: false,
  },
]

export default function ClinicalNotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [currentNote, setCurrentNote] = useState("")

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      draft: "secondary",
      pending: "outline",
    } as const
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
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
                Clinical Notes
              </h1>
              <p className="text-muted-foreground mt-2">AI-assisted clinical documentation and note-taking</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                AI Templates
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Note Templates and Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Note Templates</CardTitle>
                  <CardDescription>Quick start with AI-powered templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {noteTemplates.map((template) => {
                    const IconComponent = template.icon
                    return (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-4 bg-transparent"
                      >
                        <div className={`p-2 rounded-lg ${template.color} mr-3`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Recording</CardTitle>
                  <CardDescription>AI-powered transcription and note generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <div className="text-center">
                      <div className="animate-pulse text-red-500 text-sm">● Recording in progress...</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        AI is listening and will generate notes automatically
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <strong>Assessment:</strong> Patient shows improvement in mood stability
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <strong>Plan:</strong> Continue current medication regimen
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <strong>Follow-up:</strong> Schedule in 2 weeks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Note Editor and Recent Notes */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="editor" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="editor">Note Editor</TabsTrigger>
                  <TabsTrigger value="recent">Recent Notes</TabsTrigger>
                  <TabsTrigger value="templates">My Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="editor">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Clinical Note Editor</CardTitle>
                          <CardDescription>AI-assisted documentation with real-time suggestions</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Brain className="mr-2 h-4 w-4" />
                            AI Assist
                          </Button>
                          <Button size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Patient</label>
                          <Input placeholder="Select patient..." />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Note Type</label>
                          <Input placeholder="Select note type..." />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Clinical Note</label>
                        <Textarea
                          placeholder="Start typing your clinical note... AI will provide suggestions as you write."
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          className="min-h-[300px] mt-2"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>AI suggestions will appear as you type</span>
                        <span>{currentNote.length} characters</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recent">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Recent Clinical Notes</CardTitle>
                          <CardDescription>Your latest documentation entries</CardDescription>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentNotes.map((note) => (
                          <div
                            key={note.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{note.type}</h4>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{note.patient}</span>
                                  <span>•</span>
                                  <span>{note.provider}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1">
                                  {getStatusBadge(note.status)}
                                  {note.aiAssisted && (
                                    <Badge variant="outline" className="text-xs">
                                      <Brain className="mr-1 h-3 w-3" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {note.date} {note.time}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Templates</CardTitle>
                      <CardDescription>Custom note templates and AI-generated formats</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Custom Templates</h3>
                        <p className="text-muted-foreground mb-4">
                          Create custom templates to speed up your documentation
                        </p>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
