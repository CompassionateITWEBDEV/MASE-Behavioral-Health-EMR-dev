"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Brain,
  Pill,
  Save,
  Send,
  Printer,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  History,
  Filter,
} from "lucide-react"

interface Encounter {
  id: string
  patient_id: string
  patient_name: string
  provider_id: string
  provider_name: string
  encounter_date: string
  encounter_type: string
  chief_complaint: string
  status: string
  visit_reason: string
  created_at: string
}

interface VitalSigns {
  systolic_bp: number | null
  diastolic_bp: number | null
  heart_rate: number | null
  respiratory_rate: number | null
  temperature: number | null
  oxygen_saturation: number | null
  weight: number | null
  height_feet: number | null
  height_inches: number | null
  pain_scale: number | null
}

const encounterTypes = [
  { value: "new_patient", label: "New Patient Visit" },
  { value: "established", label: "Established Patient Visit" },
  { value: "annual_physical", label: "Annual Physical/Wellness" },
  { value: "follow_up", label: "Follow-Up Visit" },
  { value: "urgent", label: "Urgent Care Visit" },
  { value: "telehealth", label: "Telehealth Visit" },
  { value: "procedure", label: "Procedure Visit" },
  { value: "chronic_care", label: "Chronic Care Management" },
]

const reviewOfSystemsCategories = [
  {
    id: "constitutional",
    label: "Constitutional",
    items: ["Fever", "Chills", "Fatigue", "Weight loss", "Weight gain", "Night sweats"],
  },
  {
    id: "heent",
    label: "HEENT",
    items: ["Headache", "Vision changes", "Hearing loss", "Ear pain", "Sore throat", "Nasal congestion"],
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    items: ["Chest pain", "Palpitations", "Shortness of breath", "Edema", "Syncope"],
  },
  {
    id: "respiratory",
    label: "Respiratory",
    items: ["Cough", "Wheezing", "Shortness of breath", "Hemoptysis", "Sputum production"],
  },
  {
    id: "gastrointestinal",
    label: "Gastrointestinal",
    items: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal pain", "Blood in stool"],
  },
  {
    id: "genitourinary",
    label: "Genitourinary",
    items: ["Dysuria", "Frequency", "Urgency", "Hematuria", "Incontinence"],
  },
  {
    id: "musculoskeletal",
    label: "Musculoskeletal",
    items: ["Joint pain", "Muscle pain", "Stiffness", "Swelling", "Limited mobility"],
  },
  {
    id: "neurological",
    label: "Neurological",
    items: ["Headache", "Dizziness", "Numbness", "Tingling", "Weakness", "Seizures"],
  },
  {
    id: "psychiatric",
    label: "Psychiatric",
    items: ["Depression", "Anxiety", "Insomnia", "Memory problems", "Mood changes"],
  },
  { id: "skin", label: "Integumentary", items: ["Rash", "Itching", "Lesions", "Bruising", "Hair loss"] },
]

const physicalExamSections = [
  { id: "general", label: "General Appearance", defaultText: "Well-developed, well-nourished, in no acute distress" },
  {
    id: "heent",
    label: "HEENT",
    defaultText:
      "Normocephalic, atraumatic. PERRLA, EOMI. TMs clear bilaterally. Oropharynx clear, moist mucous membranes",
  },
  { id: "neck", label: "Neck", defaultText: "Supple, no lymphadenopathy, no thyromegaly, no JVD" },
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    defaultText: "Regular rate and rhythm, no murmurs, rubs, or gallops. Peripheral pulses intact",
  },
  {
    id: "respiratory",
    label: "Respiratory",
    defaultText: "Clear to auscultation bilaterally, no wheezes, rhonchi, or rales",
  },
  {
    id: "abdomen",
    label: "Abdomen",
    defaultText: "Soft, non-tender, non-distended. Bowel sounds present in all quadrants. No hepatosplenomegaly",
  },
  { id: "extremities", label: "Extremities", defaultText: "No cyanosis, clubbing, or edema. Full range of motion" },
  {
    id: "neurological",
    label: "Neurological",
    defaultText: "Alert and oriented x3. Cranial nerves II-XII intact. Motor and sensory intact. DTRs 2+ bilaterally",
  },
  { id: "psychiatric", label: "Psychiatric", defaultText: "Appropriate mood and affect. Judgment and insight intact" },
  { id: "skin", label: "Skin", defaultText: "Warm, dry, intact. No rashes or lesions noted" },
]

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewEncounter, setShowNewEncounter] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // New Encounter Form State
  const [selectedPatient, setSelectedPatient] = useState("")
  const [encounterType, setEncounterType] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [visitReason, setVisitReason] = useState("")

  // SOAP Note State
  const [subjective, setSubjective] = useState("")
  const [hpiText, setHpiText] = useState("")
  const [rosChecked, setRosChecked] = useState<Record<string, string[]>>({})
  const [pmh, setPmh] = useState("")
  const [medications, setMedications] = useState("")
  const [allergies, setAllergies] = useState("")
  const [socialHistory, setSocialHistory] = useState("")
  const [familyHistory, setFamilyHistory] = useState("")

  // Vital Signs State
  const [vitals, setVitals] = useState<VitalSigns>({
    systolic_bp: null,
    diastolic_bp: null,
    heart_rate: null,
    respiratory_rate: null,
    temperature: null,
    oxygen_saturation: null,
    weight: null,
    height_feet: null,
    height_inches: null,
    pain_scale: null,
  })

  // Physical Exam State
  const [physicalExam, setPhysicalExam] = useState<Record<string, string>>({})

  // Assessment & Plan State
  const [assessment, setAssessment] = useState("")
  const [diagnoses, setDiagnoses] = useState<{ code: string; description: string }[]>([])
  const [plan, setPlan] = useState("")
  const [orders, setOrders] = useState<string[]>([])
  const [followUp, setFollowUp] = useState("")

  useEffect(() => {
    loadEncounters()
    // Initialize physical exam with defaults
    const defaults: Record<string, string> = {}
    physicalExamSections.forEach((section) => {
      defaults[section.id] = section.defaultText
    })
    setPhysicalExam(defaults)
  }, [])

  const loadEncounters = async () => {
    setLoading(true)
    try {
      // Mock data for now - would fetch from API
      const mockEncounters: Encounter[] = [
        {
          id: "enc-001",
          patient_id: "p-001",
          patient_name: "Sarah Johnson",
          provider_id: "prov-001",
          provider_name: "Dr. Michael Smith",
          encounter_date: "2025-01-15T10:30:00Z",
          encounter_type: "established",
          chief_complaint: "Follow-up for hypertension management",
          status: "completed",
          visit_reason: "Chronic Care",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          id: "enc-002",
          patient_id: "p-002",
          patient_name: "Michael Chen",
          provider_id: "prov-001",
          provider_name: "Dr. Michael Smith",
          encounter_date: "2025-01-15T14:00:00Z",
          encounter_type: "new_patient",
          chief_complaint: "New patient intake - diabetes management",
          status: "in_progress",
          visit_reason: "New Patient",
          created_at: "2025-01-15T13:45:00Z",
        },
        {
          id: "enc-003",
          patient_id: "p-003",
          patient_name: "Emily Davis",
          provider_id: "prov-001",
          provider_name: "Dr. Michael Smith",
          encounter_date: "2025-01-15T15:30:00Z",
          encounter_type: "annual_physical",
          chief_complaint: "Annual wellness exam",
          status: "scheduled",
          visit_reason: "Preventive Care",
          created_at: "2025-01-10T09:00:00Z",
        },
        {
          id: "enc-004",
          patient_id: "p-004",
          patient_name: "Robert Wilson",
          provider_id: "prov-001",
          provider_name: "Dr. Michael Smith",
          encounter_date: "2025-01-14T11:00:00Z",
          encounter_type: "urgent",
          chief_complaint: "Acute upper respiratory infection",
          status: "completed",
          visit_reason: "Sick Visit",
          created_at: "2025-01-14T10:30:00Z",
        },
      ]
      setEncounters(mockEncounters)
    } catch (error) {
      console.error("Failed to load encounters:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      scheduled: { variant: "outline", label: "Scheduled" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    }
    const config = variants[status] || { variant: "outline" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleRosCheck = (category: string, item: string) => {
    setRosChecked((prev) => {
      const categoryItems = prev[category] || []
      if (categoryItems.includes(item)) {
        return { ...prev, [category]: categoryItems.filter((i) => i !== item) }
      }
      return { ...prev, [category]: [...categoryItems, item] }
    })
  }

  const handleSaveEncounter = async () => {
    // Would save to database
    console.log("Saving encounter...")
    setShowNewEncounter(false)
  }

  const filteredEncounters = encounters.filter((enc) => {
    const matchesSearch =
      enc.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || enc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashboardSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1e293b" }}>
                Patient Encounters
              </h1>
              <p style={{ color: "#64748b" }} className="mt-2">
                Primary Care & Family Practice - Encounter Documentation
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Recent
              </Button>
              <Button
                onClick={() => setShowNewEncounter(true)}
                style={{ backgroundColor: "#0891b2" }}
                className="text-white hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Encounter
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      {"Today's Encounters"}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      12
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#ecfeff" }}>
                    <Calendar className="h-6 w-6" style={{ color: "#0891b2" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      In Progress
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      3
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
                    <Clock className="h-6 w-6" style={{ color: "#f59e0b" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Completed
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      8
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#dcfce7" }}>
                    <CheckCircle className="h-6 w-6" style={{ color: "#22c55e" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Pending Notes
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      2
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#fee2e2" }}>
                    <AlertTriangle className="h-6 w-6" style={{ color: "#ef4444" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">Encounter List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="templates">Note Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle style={{ color: "#1e293b" }}>Patient Encounters</CardTitle>
                      <CardDescription>View and manage patient encounters</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: "#94a3b8" }} />
                        <Input
                          placeholder="Search encounters..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading encounters...</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEncounters.map((encounter) => (
                        <div
                          key={encounter.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer"
                          style={{ borderColor: "#e2e8f0", backgroundColor: "#fafafa" }}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: "#ecfeff" }}
                            >
                              <Stethoscope className="h-6 w-6" style={{ color: "#0891b2" }} />
                            </div>
                            <div>
                              <h4 className="font-semibold" style={{ color: "#1e293b" }}>
                                {encounter.patient_name}
                              </h4>
                              <p className="text-sm" style={{ color: "#64748b" }}>
                                {encounter.chief_complaint}
                              </p>
                              <div className="flex items-center space-x-2 mt-1 text-xs" style={{ color: "#94a3b8" }}>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(encounter.encounter_date).toLocaleDateString()}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(encounter.encounter_date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span>•</span>
                                <span>{encounter.provider_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">{encounter.visit_reason}</Badge>
                            {getStatusBadge(encounter.status)}
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card style={{ backgroundColor: "white" }}>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: "#94a3b8" }} />
                  <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                  <p style={{ color: "#64748b" }}>Calendar integration coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <Card style={{ backgroundColor: "white" }}>
                <CardHeader>
                  <CardTitle>Note Templates</CardTitle>
                  <CardDescription>Pre-built templates for common encounter types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Annual Wellness Visit", icon: Heart, color: "#22c55e" },
                      { name: "Acute Visit - URI", icon: Thermometer, color: "#ef4444" },
                      { name: "Chronic Care - Diabetes", icon: Activity, color: "#f59e0b" },
                      { name: "Chronic Care - Hypertension", icon: Heart, color: "#3b82f6" },
                      { name: "Mental Health Follow-up", icon: Brain, color: "#8b5cf6" },
                      { name: "Medication Management", icon: Pill, color: "#0891b2" },
                    ].map((template) => (
                      <Button key={template.name} variant="outline" className="h-auto p-4 justify-start bg-transparent">
                        <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${template.color}20` }}>
                          <template.icon className="h-5 w-5" style={{ color: template.color }} />
                        </div>
                        <span>{template.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* New Encounter Dialog */}
      <Dialog open={showNewEncounter} onOpenChange={setShowNewEncounter}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient Encounter</DialogTitle>
            <DialogDescription>Complete documentation for this patient visit</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="patient" className="mt-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="patient">Patient Info</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="subjective">Subjective</TabsTrigger>
              <TabsTrigger value="objective">Objective</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            {/* Patient Info Tab */}
            <TabsContent value="patient" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <Input
                    placeholder="Search patient..."
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Encounter Type</Label>
                  <Select value={encounterType} onValueChange={setEncounterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {encounterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Chief Complaint</Label>
                <Textarea
                  placeholder="Patient primary reason for visit..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </div>
              <div>
                <Label>Visit Reason / Appointment Type</Label>
                <Input
                  placeholder="e.g., Follow-up, New Problem, Annual Physical"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" style={{ color: "#ef4444" }} />
                    Blood Pressure
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Systolic"
                      value={vitals.systolic_bp || ""}
                      onChange={(e) => setVitals({ ...vitals, systolic_bp: Number.parseInt(e.target.value) || null })}
                    />
                    <span>/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic"
                      value={vitals.diastolic_bp || ""}
                      onChange={(e) => setVitals({ ...vitals, diastolic_bp: Number.parseInt(e.target.value) || null })}
                    />
                    <span className="text-sm text-muted-foreground">mmHg</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" style={{ color: "#22c55e" }} />
                    Heart Rate
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Heart rate"
                      value={vitals.heart_rate || ""}
                      onChange={(e) => setVitals({ ...vitals, heart_rate: Number.parseInt(e.target.value) || null })}
                    />
                    <span className="text-sm text-muted-foreground">bpm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" style={{ color: "#3b82f6" }} />
                    Respiratory Rate
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Resp rate"
                      value={vitals.respiratory_rate || ""}
                      onChange={(e) =>
                        setVitals({ ...vitals, respiratory_rate: Number.parseInt(e.target.value) || null })
                      }
                    />
                    <span className="text-sm text-muted-foreground">/min</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" style={{ color: "#f59e0b" }} />
                    Temperature
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Temperature"
                      value={vitals.temperature || ""}
                      onChange={(e) => setVitals({ ...vitals, temperature: Number.parseFloat(e.target.value) || null })}
                    />
                    <span className="text-sm text-muted-foreground">°F</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" style={{ color: "#8b5cf6" }} />
                    O2 Saturation
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="SpO2"
                      value={vitals.oxygen_saturation || ""}
                      onChange={(e) =>
                        setVitals({ ...vitals, oxygen_saturation: Number.parseInt(e.target.value) || null })
                      }
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="h-4 w-4" style={{ color: "#0891b2" }} />
                    Weight
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Weight"
                      value={vitals.weight || ""}
                      onChange={(e) => setVitals({ ...vitals, weight: Number.parseFloat(e.target.value) || null })}
                    />
                    <span className="text-sm text-muted-foreground">lbs</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Feet"
                      value={vitals.height_feet || ""}
                      onChange={(e) => setVitals({ ...vitals, height_feet: Number.parseInt(e.target.value) || null })}
                    />
                    <span className="text-sm">ft</span>
                    <Input
                      type="number"
                      placeholder="Inches"
                      value={vitals.height_inches || ""}
                      onChange={(e) => setVitals({ ...vitals, height_inches: Number.parseInt(e.target.value) || null })}
                    />
                    <span className="text-sm">in</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pain Scale (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Pain level"
                    value={vitals.pain_scale || ""}
                    onChange={(e) => setVitals({ ...vitals, pain_scale: Number.parseInt(e.target.value) || null })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Subjective Tab */}
            <TabsContent value="subjective" className="space-y-4">
              <div>
                <Label>History of Present Illness (HPI)</Label>
                <Textarea
                  placeholder="Describe the patient symptoms, onset, duration, severity, associated factors..."
                  className="min-h-[120px]"
                  value={hpiText}
                  onChange={(e) => setHpiText(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Review of Systems (ROS)</Label>
                <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
                  {reviewOfSystemsCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <h4 className="font-medium text-sm">{category.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item) => (
                          <label key={item} className="flex items-center space-x-1 text-sm">
                            <Checkbox
                              checked={rosChecked[category.id]?.includes(item) || false}
                              onCheckedChange={() => handleRosCheck(category.id, item)}
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Past Medical History</Label>
                  <Textarea
                    placeholder="Previous diagnoses, surgeries, hospitalizations..."
                    value={pmh}
                    onChange={(e) => setPmh(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Current Medications</Label>
                  <Textarea
                    placeholder="List current medications with dosages..."
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Allergies</Label>
                  <Textarea
                    placeholder="Drug allergies and reactions..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Social History</Label>
                  <Textarea
                    placeholder="Smoking, alcohol, drug use, occupation, exercise..."
                    value={socialHistory}
                    onChange={(e) => setSocialHistory(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Family History</Label>
                <Textarea
                  placeholder="Relevant family medical history..."
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Objective Tab */}
            <TabsContent value="objective" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Physical Examination</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const defaults: Record<string, string> = {}
                    physicalExamSections.forEach((section) => {
                      defaults[section.id] = section.defaultText
                    })
                    setPhysicalExam(defaults)
                  }}
                >
                  Load Normal Defaults
                </Button>
              </div>
              <div className="space-y-4">
                {physicalExamSections.map((section) => (
                  <div key={section.id}>
                    <Label>{section.label}</Label>
                    <Textarea
                      placeholder={section.defaultText}
                      value={physicalExam[section.id] || ""}
                      onChange={(e) => setPhysicalExam({ ...physicalExam, [section.id]: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Assessment Tab */}
            <TabsContent value="assessment" className="space-y-4">
              <div>
                <Label>Clinical Assessment</Label>
                <Textarea
                  placeholder="Your clinical impression and differential diagnosis..."
                  className="min-h-[120px]"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                />
              </div>
              <div>
                <Label>Diagnosis Codes (ICD-10)</Label>
                <div className="space-y-2">
                  {diagnoses.map((dx, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input placeholder="ICD-10 Code" value={dx.code} className="w-32" />
                      <Input placeholder="Description" value={dx.description} className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDiagnoses(diagnoses.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiagnoses([...diagnoses, { code: "", description: "" }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Diagnosis
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Plan Tab */}
            <TabsContent value="plan" className="space-y-4">
              <div>
                <Label>Treatment Plan</Label>
                <Textarea
                  placeholder="Detailed treatment plan including medications, procedures, referrals..."
                  className="min-h-[120px]"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                />
              </div>
              <div>
                <Label>Orders</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {["Labs", "Imaging", "Referral", "Prescription", "DME", "Patient Education"].map((orderType) => (
                      <Button
                        key={orderType}
                        variant={orders.includes(orderType) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (orders.includes(orderType)) {
                            setOrders(orders.filter((o) => o !== orderType))
                          } else {
                            setOrders([...orders, orderType])
                          }
                        }}
                      >
                        {orderType}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label>Follow-Up</Label>
                <Input
                  placeholder="e.g., Return in 2 weeks, PRN, Annual"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>
              <div>
                <Label>Patient Instructions</Label>
                <Textarea placeholder="Instructions provided to patient..." className="min-h-[80px]" />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowNewEncounter(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSaveEncounter} style={{ backgroundColor: "#0891b2" }} className="text-white">
              <Send className="h-4 w-4 mr-2" />
              Sign & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
