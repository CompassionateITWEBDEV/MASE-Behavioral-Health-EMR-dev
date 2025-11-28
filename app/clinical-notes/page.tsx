"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import useSWR from "swr"
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
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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

const templateContent: Record<string, string> = {
  soap: `SUBJECTIVE:
[Patient's chief complaint, symptoms, history]

OBJECTIVE:
[Vital signs, physical exam findings, lab results]

ASSESSMENT:
[Diagnosis, clinical impression]

PLAN:
[Treatment plan, medications, follow-up]`,
  progress: `SESSION DATE: ${new Date().toLocaleDateString()}
SESSION DURATION: 

PROGRESS OBSERVATIONS:


INTERVENTIONS USED:


PATIENT RESPONSE:


GOALS ADDRESSED:


NEXT STEPS:
`,
  intake: `CHIEF COMPLAINT:


HISTORY OF PRESENT ILLNESS:


PAST MEDICAL HISTORY:


PAST PSYCHIATRIC HISTORY:


SUBSTANCE USE HISTORY:


SOCIAL HISTORY:


FAMILY HISTORY:


MENTAL STATUS EXAM:


ASSESSMENT:


DIAGNOSIS:


PLAN:
`,
  discharge: `ADMISSION DATE:
DISCHARGE DATE: ${new Date().toLocaleDateString()}

REASON FOR ADMISSION:


TREATMENT SUMMARY:


MEDICATIONS AT DISCHARGE:


DISCHARGE DIAGNOSIS:


PROGNOSIS:


FOLLOW-UP PLAN:


PATIENT EDUCATION PROVIDED:
`,
}

export default function ClinicalNotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [currentNote, setCurrentNote] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedNoteType, setSelectedNoteType] = useState("progress")
  const [aiAction, setAiAction] = useState<string | null>(null)
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/clinical-notes", fetcher)
  const { data: patientsData } = useSWR("/api/patients", fetcher)

  const handleAiAssist = useCallback(
    async (action: string) => {
      if (!currentNote.trim()) {
        toast.error("Please enter some note content first")
        return
      }
      setAiAction(action)
      setShowAiDialog(true)
      try {
        const response = await fetch("/api/clinical-notes/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteContent: currentNote,
            noteType: selectedNoteType,
            action,
          }),
        })
        const result = await response.json()
        if (result.completion) {
          setCurrentNote(result.completion)
          toast.success("AI enhancement applied")
        }
      } catch (err) {
        toast.error("AI assist failed")
      }
      setShowAiDialog(false)
    },
    [currentNote, selectedNoteType],
  )

  const handleSaveNote = async () => {
    if (!selectedPatient || !currentNote.trim()) {
      toast.error("Please select a patient and enter note content")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/clinical-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          note_type: selectedNoteType,
          subjective: currentNote,
          objective: "",
          assessment: "",
          plan: "",
        }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        toast.success("Note saved successfully")
        setCurrentNote("")
        setSelectedPatient("")
        mutate()
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        toast.error("Failed to save note")
      }
    } catch (err) {
      console.error("Save error:", err)
      toast.error("Failed to save note")
    } finally {
      setSaving(false)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedNoteType(templateId)
    const content = templateContent[templateId] || ""
    setCurrentNote(content)
    setActiveTab("editor")
    toast.success(`${noteTemplates.find((t) => t.id === templateId)?.name} template loaded`)
  }

  const handleNewNote = () => {
    setShowNewNoteDialog(true)
  }

  const startNewNote = (templateId: string) => {
    setSelectedNoteType(templateId)
    setCurrentNote(templateContent[templateId] || "")
    setSelectedPatient("")
    setShowNewNoteDialog(false)
    setActiveTab("editor")
    toast.success("New note started - select a patient and begin documenting")
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      draft: "secondary",
      pending: "outline",
    } as const
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  const notes = data?.notes || []
  const patients = patientsData?.patients || []

  const filteredNotes = notes.filter(
    (note: any) =>
      note.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.note_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clinical Notes</h1>
              <p className="text-muted-foreground mt-2">AI-assisted clinical documentation and note-taking</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => mutate()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleNewNote}>
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
                        variant={selectedNoteType === template.id ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-4 ${selectedNoteType === template.id ? "" : "bg-transparent"}`}
                        onClick={() => handleSelectTemplate(template.id)}
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
                    onClick={() => {
                      setIsRecording(!isRecording)
                      if (!isRecording) {
                        toast.info("Voice recording started - speak clearly")
                      } else {
                        toast.success("Recording stopped - processing...")
                      }
                    }}
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
                  <CardTitle className="text-lg">AI Actions</CardTitle>
                  <CardDescription>Enhance your documentation with AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAiAssist("enhance")}
                    disabled={!currentNote.trim()}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                    Enhance Note
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAiAssist("soap")}
                    disabled={!currentNote.trim()}
                  >
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    Convert to SOAP
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAiAssist("suggestions")}
                    disabled={!currentNote.trim()}
                  >
                    <Brain className="mr-2 h-4 w-4 text-purple-500" />
                    Get Suggestions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAiAssist("summarize")}
                    disabled={!currentNote.trim()}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Summarize
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Note Editor and Recent Notes */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="editor">Note Editor</TabsTrigger>
                  <TabsTrigger value="recent">Recent Notes ({notes.length})</TabsTrigger>
                  <TabsTrigger value="templates">My Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="editor">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle>Clinical Note Editor</CardTitle>
                          <CardDescription>AI-assisted documentation with real-time suggestions</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAiAssist("enhance")}
                            disabled={!currentNote.trim()}
                          >
                            <Brain className="mr-2 h-4 w-4" />
                            AI Assist
                          </Button>
                          <Button size="sm" onClick={handleSaveNote} disabled={saving || !selectedPatient}>
                            {saving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : saveSuccess ? (
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            {saveSuccess ? "Saved!" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Patient</label>
                          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select patient..." />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient: any) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Note Type</label>
                          <Select value={selectedNoteType} onValueChange={setSelectedNoteType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select note type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="soap">SOAP Note</SelectItem>
                              <SelectItem value="progress">Progress Note</SelectItem>
                              <SelectItem value="intake">Intake Note</SelectItem>
                              <SelectItem value="discharge">Discharge Summary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Clinical Note</label>
                        <Textarea
                          placeholder="Start typing your clinical note or select a template from the left panel..."
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          className="min-h-[300px] mt-2 font-mono text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{currentNote ? "Edit your note content" : "Select a template or start typing"}</span>
                        <span>{currentNote.length} characters</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recent">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle>Recent Clinical Notes</CardTitle>
                          <CardDescription>Your latest documentation entries from database</CardDescription>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full md:w-64"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                          <p className="text-muted-foreground">Failed to load notes</p>
                          <Button variant="outline" onClick={() => mutate()} className="mt-4">
                            Try Again
                          </Button>
                        </div>
                      ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Notes Found</h3>
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? "No notes match your search"
                              : "Create your first clinical note to get started"}
                          </p>
                          <Button className="mt-4" onClick={handleNewNote}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Note
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredNotes.map((note: any) => (
                            <div
                              key={note.id}
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium capitalize">
                                    {note.note_type?.replace("_", " ") || "Progress Note"}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>{note.patient_name}</span>
                                    <span>•</span>
                                    <span>{note.provider_name}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-muted-foreground">
                                  <Calendar className="inline h-3 w-3 mr-1" />
                                  {new Date(note.created_at).toLocaleDateString()}
                                </div>
                                {getStatusBadge(note.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentNote(note.subjective || "")
                                    setSelectedNoteType(note.note_type || "progress")
                                    setActiveTab("editor")
                                    toast.info("Note loaded for editing")
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Templates</CardTitle>
                      <CardDescription>Custom note templates for quick documentation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {noteTemplates.map((template) => {
                          const IconComponent = template.icon
                          return (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleSelectTemplate(template.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-lg ${template.color}`}>
                                    <IconComponent className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{template.name}</h4>
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>Select a template to start your clinical note</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {noteTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 bg-transparent"
                  onClick={() => startNewNote(template.id)}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Processing Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Processing</DialogTitle>
            <DialogDescription>
              {aiAction === "enhance" && "Enhancing your clinical note with AI..."}
              {aiAction === "soap" && "Converting to SOAP format..."}
              {aiAction === "suggestions" && "Generating suggestions..."}
              {aiAction === "summarize" && "Creating summary..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
