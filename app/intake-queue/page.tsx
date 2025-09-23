"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { UDSCollectionModal } from "@/components/uds-collection-modal" // Added UDS collection modal import
import {
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TestTube,
  Stethoscope,
  Brain,
  UserCheck,
  Pill,
  FileText,
  Bell,
  Filter,
} from "lucide-react"

const intakePatients = [
  {
    id: "INT-2025-001",
    name: "Maria Santos",
    age: 29,
    phone: "(555) 123-4567",
    entryTime: "08:30 AM",
    currentStage: "data-entry",
    eligibilityStatus: "pending",
    udsRequired: true,
    pregnancyTestRequired: true,
    priority: "normal",
    estimatedWait: "15 min",
    alerts: [],
  },
  {
    id: "INT-2025-002",
    name: "James Rodriguez",
    age: 34,
    phone: "(555) 234-5678",
    entryTime: "09:15 AM",
    currentStage: "collector-queue",
    eligibilityStatus: "approved",
    udsRequired: true,
    pregnancyTestRequired: false,
    priority: "urgent",
    estimatedWait: "5 min",
    alerts: ["Withdrawal symptoms"],
  },
  {
    id: "INT-2025-003",
    name: "Sarah Johnson",
    age: 26,
    phone: "(555) 345-6789",
    entryTime: "10:00 AM",
    currentStage: "nurse-queue",
    eligibilityStatus: "approved",
    udsRequired: false,
    pregnancyTestRequired: false,
    priority: "normal",
    estimatedWait: "20 min",
    alerts: [],
    udsResults: {
      cocaine: "positive",
      opiates: "positive",
      thc: "negative",
      amphetamines: "negative",
      collectedAt: "10:15 AM",
      interventionRequired: true,
    },
  },
  {
    id: "INT-2025-004",
    name: "Michael Chen",
    age: 31,
    phone: "(555) 456-7890",
    entryTime: "10:30 AM",
    currentStage: "counselor-queue",
    eligibilityStatus: "approved",
    udsRequired: false,
    pregnancyTestRequired: false,
    priority: "normal",
    estimatedWait: "30 min",
    alerts: [],
    nurseAssessment: {
      completedAt: "11:00 AM",
      vitals: "stable",
      medicalClearance: true,
    },
  },
  {
    id: "INT-2025-005",
    name: "Lisa Anderson",
    age: 28,
    phone: "(555) 567-8901",
    entryTime: "11:00 AM",
    currentStage: "doctor-queue",
    eligibilityStatus: "approved",
    udsRequired: false,
    pregnancyTestRequired: false,
    priority: "normal",
    estimatedWait: "45 min",
    alerts: ["Pregnant"],
    counselorAssessment: {
      completedAt: "11:45 AM",
      asamLevel: "2.1",
      treatmentPlan: "drafted",
    },
  },
]

const queueStages = [
  { id: "data-entry", name: "Data Entry", icon: FileText, color: "bg-blue-500" },
  { id: "eligibility", name: "Eligibility Check", icon: CheckCircle, color: "bg-green-500" },
  { id: "tech-onboarding", name: "Tech Onboarding", icon: Users, color: "bg-cyan-500" },
  { id: "consent-forms", name: "Consent Forms", icon: FileText, color: "bg-amber-500" },
  { id: "collector-queue", name: "Collector Queue", icon: TestTube, color: "bg-purple-500" },
  { id: "nurse-queue", name: "Nurse Queue", icon: Stethoscope, color: "bg-teal-500" },
  { id: "counselor-queue", name: "Counselor Queue", icon: Brain, color: "bg-orange-500" },
  { id: "doctor-queue", name: "Doctor Queue", icon: UserCheck, color: "bg-red-500" },
  { id: "dosing", name: "Dosing", icon: Pill, color: "bg-indigo-500" },
]

export default function IntakeQueuePage() {
  const [selectedStage, setSelectedStage] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null) // Added state for UDS modal
  const [showUDSModal, setShowUDSModal] = useState(false) // Added UDS modal state

  const getStageInfo = (stageId: string) => {
    return queueStages.find((stage) => stage.id === stageId) || queueStages[0]
  }

  const getPriorityBadge = (priority: string) => {
    return <Badge variant={priority === "urgent" ? "destructive" : "outline"}>{priority}</Badge>
  }

  const getStagePatients = (stageId: string) => {
    return intakePatients.filter((patient) => (stageId === "all" ? true : patient.currentStage === stageId))
  }

  const handleMoveToNextStage = (patientId: string) => {
    // Logic to move patient to next stage
    console.log(`Moving patient ${patientId} to next stage`)
  }

  const handleCollectUDS = (patientId: string) => {
    const patient = intakePatients.find((p) => p.id === patientId)
    if (patient) {
      setSelectedPatient(patient)
      setShowUDSModal(true)
    }
  }

  const handleUDSComplete = (results: any) => {
    console.log(`UDS completed for patient ${selectedPatient?.id}:`, results)
    // In real app, update patient record and move to nurse queue
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
                Patient Intake Queue
              </h1>
              <p className="text-muted-foreground mt-2">Manage patient admission workflow from entry to dosing</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" />
                New Intake
              </Button>
            </div>
          </div>

          {/* Queue Stage Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-8">
            {queueStages.map((stage) => {
              const stagePatients = getStagePatients(stage.id)
              const IconComponent = stage.icon
              return (
                <Card
                  key={stage.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedStage === stage.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedStage(stage.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 rounded-lg ${stage.color} flex items-center justify-center mx-auto mb-2`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{stage.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stagePatients.length} patients
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 items-center mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {queueStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Patient Queue */}
          <Tabs value={selectedStage} onValueChange={setSelectedStage} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="all">All</TabsTrigger>
              {queueStages.map((stage) => (
                <TabsTrigger key={stage.id} value={stage.id} className="text-xs">
                  {stage.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Intake Patients
                    <Badge variant="secondary">{intakePatients.length} total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {intakePatients.map((patient) => {
                      const stageInfo = getStageInfo(patient.currentStage)
                      const IconComponent = stageInfo.icon
                      return (
                        <div
                          key={patient.id}
                          className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-lg">{patient.name}</h3>
                                  <Badge variant="outline">{patient.id}</Badge>
                                  {getPriorityBadge(patient.priority)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{patient.age}y</span>
                                  <span>{patient.phone}</span>
                                  <span>Entry: {patient.entryTime}</span>
                                  <span>Wait: {patient.estimatedWait}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${stageInfo.color}`}>
                                    <IconComponent className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-sm font-medium">{stageInfo.name}</span>
                                  {patient.eligibilityStatus === "approved" && (
                                    <Badge variant="default" className="text-xs">
                                      Eligible
                                    </Badge>
                                  )}
                                </div>
                                {patient.alerts.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    <div className="flex gap-1">
                                      {patient.alerts.map((alert, index) => (
                                        <Badge key={index} variant="destructive" className="text-xs">
                                          {alert}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* UDS Results Display */}
                                {patient.udsResults && (
                                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                                    <div className="font-medium mb-1">
                                      UDS Results ({patient.udsResults.collectedAt}):
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      <span
                                        className={
                                          patient.udsResults.cocaine === "positive" ? "text-red-600" : "text-green-600"
                                        }
                                      >
                                        Cocaine: {patient.udsResults.cocaine}
                                      </span>
                                      <span
                                        className={
                                          patient.udsResults.opiates === "positive" ? "text-red-600" : "text-green-600"
                                        }
                                      >
                                        Opiates: {patient.udsResults.opiates}
                                      </span>
                                      <span
                                        className={
                                          patient.udsResults.thc === "positive" ? "text-red-600" : "text-green-600"
                                        }
                                      >
                                        THC: {patient.udsResults.thc}
                                      </span>
                                      <span
                                        className={
                                          patient.udsResults.amphetamines === "positive"
                                            ? "text-red-600"
                                            : "text-green-600"
                                        }
                                      >
                                        Amphetamines: {patient.udsResults.amphetamines}
                                      </span>
                                    </div>
                                    {patient.udsResults.interventionRequired && (
                                      <Badge variant="destructive" className="text-xs mt-1">
                                        Intervention Required
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Stage-specific action buttons */}
                              {patient.currentStage === "collector-queue" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCollectUDS(patient.id)}
                                  className="bg-purple-500 hover:bg-purple-600"
                                >
                                  <TestTube className="mr-2 h-4 w-4" />
                                  Collect UDS
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleMoveToNextStage(patient.id)}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual Stage Tabs */}
            {queueStages.map((stage) => (
              <TabsContent key={stage.id} value={stage.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <stage.icon className="h-5 w-5" />
                      {stage.name} Queue
                      <Badge variant="secondary">{getStagePatients(stage.id).length} patients</Badge>
                    </CardTitle>
                    <CardDescription>
                      {stage.id === "tech-onboarding" && "Patient portal setup and technology training"}
                      {stage.id === "consent-forms" && "Complete required consent and authorization forms"}
                      {stage.id === "collector-queue" && "Collect UDS and pregnancy tests"}
                      {stage.id === "nurse-queue" && "Nursing assessment and vital signs"}
                      {stage.id === "counselor-queue" && "Counseling assessment and treatment planning"}
                      {stage.id === "doctor-queue" && "Medical evaluation and clearance"}
                      {stage.id === "dosing" && "Medication administration"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getStagePatients(stage.id).length === 0 ? (
                        <div className="text-center py-8">
                          <stage.icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No patients in queue</h3>
                          <p className="text-muted-foreground">Patients will appear here when they reach this stage</p>
                        </div>
                      ) : (
                        getStagePatients(stage.id).map((patient) => (
                          <div
                            key={patient.id}
                            className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                          >
                            {/* Same patient card content as above but with stage-specific actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {patient.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{patient.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{patient.entryTime}</span>
                                    <span>•</span>
                                    <span>Wait: {patient.estimatedWait}</span>
                                    {getPriorityBadge(patient.priority)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {stage.id === "tech-onboarding" && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <Users className="mr-2 h-4 w-4" />
                                      Portal Setup
                                    </Button>
                                    <Button size="sm">Complete Onboarding</Button>
                                  </>
                                )}
                                {stage.id === "consent-forms" && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Forms
                                    </Button>
                                    <Button size="sm">Complete Consents</Button>
                                  </>
                                )}
                                {stage.id === "collector-queue" && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <TestTube className="mr-2 h-4 w-4" />
                                      UDS Results
                                    </Button>
                                    <Button size="sm">Complete Collection</Button>
                                  </>
                                )}
                                {stage.id === "nurse-queue" && <Button size="sm">Start Assessment</Button>}
                                {stage.id === "counselor-queue" && <Button size="sm">Begin Counseling</Button>}
                                {stage.id === "doctor-queue" && <Button size="sm">Medical Evaluation</Button>}
                                {stage.id === "dosing" && <Button size="sm">Administer Dose</Button>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {selectedPatient && (
          <UDSCollectionModal
            patient={selectedPatient}
            isOpen={showUDSModal}
            onClose={() => {
              setShowUDSModal(false)
              setSelectedPatient(null)
            }}
            onComplete={handleUDSComplete}
          />
        )}
      </main>
    </div>
  )
}
