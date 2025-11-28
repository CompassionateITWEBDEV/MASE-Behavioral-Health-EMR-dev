"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  Clock,
  Activity,
  Pill,
  Printer,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  History,
  Filter,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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
  pain_location?: string
  notes?: string
}

interface DiagnosisCode {
  code: string
  description: string
}

interface Medication {
  id: string
  medication_name: string
  generic_name: string
  dosage: string
  frequency: string
  route: string
  status: string
  start_date: string
  prescribed_by: string
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
  const { data, error, isLoading, mutate } = useSWR("/api/encounters", fetcher)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewEncounter, setShowNewEncounter] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null)
  const [showEncounterDetail, setShowEncounterDetail] = useState(false)
  const [encounterDetailData, setEncounterDetailData] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // New Encounter Form State
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [encounterType, setEncounterType] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")

  // SOAP Note State
  const [subjective, setSubjective] = useState("")
  const [hpiText, setHpiText] = useState("")
  const [rosChecked, setRosChecked] = useState<Record<string, string[]>>({})
  const [pmh, setPmh] = useState("")
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
    pain_location: "",
    notes: "",
  })

  // Physical Exam State
  const [physicalExam, setPhysicalExam] = useState<Record<string, string>>({})

  // Assessment & Plan State
  const [assessment, setAssessment] = useState("")
  const [diagnoses, setDiagnoses] = useState<DiagnosisCode[]>([])
  const [diagnosisSearch, setDiagnosisSearch] = useState("")
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisCode[]>([])
  const [plan, setPlan] = useState("")
  const [followUp, setFollowUp] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Initialize physical exam with defaults
    const defaults: Record<string, string> = {}
    physicalExamSections.forEach((section) => {
      defaults[section.id] = section.defaultText
    })
    setPhysicalExam(defaults)
  }, [])

  // Search ICD-10 codes
  useEffect(() => {
    if (diagnosisSearch.length >= 2) {
      fetch(`/api/encounters/icd10?q=${encodeURIComponent(diagnosisSearch)}`)
        .then((res) => res.json())
        .then((data) => setDiagnosisResults(data))
        .catch(() => setDiagnosisResults([]))
    } else {
      setDiagnosisResults([])
    }
  }, [diagnosisSearch])

  const encounters = data?.encounters || []
  const patients = data?.patients || []
  const providers = data?.providers || []
  const stats = data?.stats || { todayCount: 0, inProgress: 0, completed: 0, pendingNotes: 0 }

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

  const addDiagnosis = (diagnosis: DiagnosisCode) => {
    if (!diagnoses.find((d) => d.code === diagnosis.code)) {
      setDiagnoses([...diagnoses, diagnosis])
    }
    setDiagnosisSearch("")
    setDiagnosisResults([])
  }

  const removeDiagnosis = (code: string) => {
    setDiagnoses(diagnoses.filter((d) => d.code !== code))
  }

  const handleCreateEncounter = async () => {
    if (!selectedPatient || !selectedProvider || !encounterType) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          provider_id: selectedProvider,
          encounter_type: encounterType,
          chief_complaint: chiefComplaint,
        }),
      })

      if (!response.ok) throw new Error("Failed to create encounter")

      toast.success("Encounter created successfully")
      setShowNewEncounter(false)
      mutate()

      // Reset form
      setSelectedPatient("")
      setSelectedProvider("")
      setEncounterType("")
      setChiefComplaint("")
    } catch (error) {
      toast.error("Failed to create encounter")
    } finally {
      setSaving(false)
    }
  }

  const openEncounterDetail = async (encounter: any) => {
    setSelectedEncounter(encounter)
    setShowEncounterDetail(true)
    setLoadingDetail(true)

    try {
      const response = await fetch(`/api/encounters/${encounter.id}`)
      const data = await response.json()
      setEncounterDetailData(data)
    } catch (error) {
      toast.error("Failed to load encounter details")
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleSaveEncounter = async () => {
    if (!selectedEncounter) return

    setSaving(true)
    try {
      const response = await fetch(`/api/encounters/${selectedEncounter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedEncounter.patient_id,
          provider_id: selectedEncounter.provider_id,
          chief_complaint: chiefComplaint,
          status: "completed",
          vitals,
          diagnosis_codes: diagnoses.map((d) => d.code),
          hpi: hpiText,
          assessment,
          plan,
          note: {
            subjective,
            objective: Object.entries(physicalExam)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n"),
            assessment,
            plan,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to save encounter")

      toast.success("Encounter saved successfully")
      setShowEncounterDetail(false)
      mutate()
    } catch (error) {
      toast.error("Failed to save encounter")
    } finally {
      setSaving(false)
    }
  }

  const getVitalTrend = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const filteredEncounters = encounters.filter((enc: any) => {
    const matchesSearch =
      enc.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || enc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Patient Encounters</h1>
                <p className="text-slate-500 mt-2">Primary Care & Family Practice - Encounter Documentation</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  Recent
                </Button>
                <Button onClick={() => setShowNewEncounter(true)} className="bg-cyan-600 text-white hover:bg-cyan-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Encounter
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{"Today's Encounters"}</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : stats.todayCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-50">
                      <Calendar className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">In Progress</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : stats.inProgress}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50">
                      <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Completed</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : stats.completed}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Pending Notes</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {isLoading ? <Skeleton className="h-8 w-12" /> : stats.pendingNotes}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
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
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-800">Patient Encounters</CardTitle>
                        <CardDescription>View and manage patient encounters</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : filteredEncounters.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No encounters found. Click &quot;New Encounter&quot; to create one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredEncounters.map((encounter: any) => (
                          <div
                            key={encounter.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer bg-slate-50 border-slate-200"
                            onClick={() => openEncounterDetail(encounter)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-50">
                                <Stethoscope className="h-6 w-6 text-cyan-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{encounter.patient_name}</h4>
                                <p className="text-sm text-slate-500">
                                  {encounter.chief_complaint || "No chief complaint"}
                                </p>
                                <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
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
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-8 text-center text-slate-500">Calendar view coming soon</CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-8 text-center text-slate-500">Note templates coming soon</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* New Encounter Dialog */}
      <Dialog open={showNewEncounter} onOpenChange={setShowNewEncounter}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Patient Encounter</DialogTitle>
            <DialogDescription>Create a new patient encounter</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
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
              <Label>Provider *</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      Dr. {provider.first_name} {provider.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Encounter Type *</Label>
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
            <div>
              <Label>Chief Complaint</Label>
              <Textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Enter chief complaint..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEncounter(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEncounter} disabled={saving}>
              {saving ? "Creating..." : "Create Encounter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Encounter Detail Dialog */}
      <Dialog open={showEncounterDetail} onOpenChange={setShowEncounterDetail}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Patient Encounter - {selectedEncounter?.patient_name}
            </DialogTitle>
            <DialogDescription>
              {selectedEncounter?.encounter_date && new Date(selectedEncounter.encounter_date).toLocaleDateString()} |{" "}
              {selectedEncounter?.provider_name}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[70vh] pr-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="soap">SOAP Note</TabsTrigger>
                  <TabsTrigger value="exam">Physical Exam</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Current Vitals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {encounterDetailData?.vitals?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-500">BP:</span>{" "}
                              <span className="font-medium">
                                {encounterDetailData.vitals[0].systolic_bp}/{encounterDetailData.vitals[0].diastolic_bp}{" "}
                                mmHg
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">HR:</span>{" "}
                              <span className="font-medium">{encounterDetailData.vitals[0].heart_rate} bpm</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Temp:</span>{" "}
                              <span className="font-medium">{encounterDetailData.vitals[0].temperature}°F</span>
                            </div>
                            <div>
                              <span className="text-slate-500">SpO2:</span>{" "}
                              <span className="font-medium">{encounterDetailData.vitals[0].oxygen_saturation}%</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Weight:</span>{" "}
                              <span className="font-medium">{encounterDetailData.vitals[0].weight} lbs</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Pain:</span>{" "}
                              <span className="font-medium">{encounterDetailData.vitals[0].pain_scale}/10</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No vitals recorded</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Active Medications ({encounterDetailData?.medications?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {encounterDetailData?.medications?.length > 0 ? (
                          <div className="space-y-1 text-sm">
                            {encounterDetailData.medications.slice(0, 4).map((med: any) => (
                              <div key={med.id} className="flex justify-between">
                                <span className="font-medium">{med.medication_name}</span>
                                <span className="text-slate-500">{med.dosage}</span>
                              </div>
                            ))}
                            {encounterDetailData.medications.length > 4 && (
                              <p className="text-slate-400">+{encounterDetailData.medications.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No active medications</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Recent Diagnoses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {encounterDetailData?.assessments?.length > 0 &&
                      encounterDetailData.assessments[0].diagnosis_codes?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {encounterDetailData.assessments[0].diagnosis_codes.map((code: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No diagnoses recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vitals Tab with History Comparison */}
                <TabsContent value="vitals" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Record New Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Systolic BP</Label>
                          <Input
                            type="number"
                            value={vitals.systolic_bp || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, systolic_bp: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="120"
                          />
                        </div>
                        <div>
                          <Label>Diastolic BP</Label>
                          <Input
                            type="number"
                            value={vitals.diastolic_bp || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, diastolic_bp: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="80"
                          />
                        </div>
                        <div>
                          <Label>Heart Rate</Label>
                          <Input
                            type="number"
                            value={vitals.heart_rate || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, heart_rate: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="72"
                          />
                        </div>
                        <div>
                          <Label>Respiratory Rate</Label>
                          <Input
                            type="number"
                            value={vitals.respiratory_rate || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, respiratory_rate: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="16"
                          />
                        </div>
                        <div>
                          <Label>Temperature (°F)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={vitals.temperature || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, temperature: Number.parseFloat(e.target.value) || null })
                            }
                            placeholder="98.6"
                          />
                        </div>
                        <div>
                          <Label>SpO2 (%)</Label>
                          <Input
                            type="number"
                            value={vitals.oxygen_saturation || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, oxygen_saturation: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="98"
                          />
                        </div>
                        <div>
                          <Label>Weight (lbs)</Label>
                          <Input
                            type="number"
                            value={vitals.weight || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, weight: Number.parseFloat(e.target.value) || null })
                            }
                            placeholder="150"
                          />
                        </div>
                        <div>
                          <Label>Pain Scale (0-10)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={vitals.pain_scale || ""}
                            onChange={(e) =>
                              setVitals({ ...vitals, pain_scale: Number.parseInt(e.target.value) || null })
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Vital Signs History (with Trend Comparison)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {encounterDetailData?.vitals?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>BP</TableHead>
                              <TableHead>HR</TableHead>
                              <TableHead>Temp</TableHead>
                              <TableHead>SpO2</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>Pain</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {encounterDetailData.vitals.map((v: any, i: number) => {
                              const prev = encounterDetailData.vitals[i + 1]
                              return (
                                <TableRow key={v.id}>
                                  <TableCell className="text-sm">
                                    {new Date(v.measurement_date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {v.systolic_bp}/{v.diastolic_bp}
                                      {prev && getVitalTrend(v.systolic_bp, prev.systolic_bp)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {v.heart_rate}
                                      {prev && getVitalTrend(v.heart_rate, prev.heart_rate)}
                                    </div>
                                  </TableCell>
                                  <TableCell>{v.temperature}°F</TableCell>
                                  <TableCell>{v.oxygen_saturation}%</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {v.weight} lbs
                                      {prev && getVitalTrend(v.weight, prev.weight)}
                                    </div>
                                  </TableCell>
                                  <TableCell>{v.pain_scale}/10</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No vital signs history</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Current Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {encounterDetailData?.medications?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medication</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Route</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {encounterDetailData.medications.map((med: any) => (
                              <TableRow key={med.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{med.medication_name}</p>
                                    {med.generic_name && <p className="text-xs text-slate-500">{med.generic_name}</p>}
                                  </div>
                                </TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                                <TableCell>{med.route || "PO"}</TableCell>
                                <TableCell>{med.start_date && new Date(med.start_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={med.status === "active" ? "default" : "secondary"}>
                                    {med.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No medications on file</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Diagnosis Tab with ICD-10 Search */}
                <TabsContent value="diagnosis" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Add ICD-10 Diagnosis Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search ICD-10 codes (e.g., F11.20, hypertension, diabetes)..."
                          value={diagnosisSearch}
                          onChange={(e) => setDiagnosisSearch(e.target.value)}
                          className="pl-10"
                        />
                        {diagnosisResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                            {diagnosisResults.map((dx) => (
                              <div
                                key={dx.code}
                                className="p-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                                onClick={() => addDiagnosis(dx)}
                              >
                                <div>
                                  <span className="font-mono font-medium text-cyan-600">{dx.code}</span>
                                  <span className="ml-2 text-sm">{dx.description}</span>
                                </div>
                                <Plus className="h-4 w-4 text-slate-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {diagnoses.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected Diagnoses</Label>
                          <div className="space-y-2">
                            {diagnoses.map((dx, i) => (
                              <div
                                key={dx.code}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{i === 0 ? "Primary" : `${i + 1}`}</Badge>
                                  <span className="font-mono font-medium text-cyan-600">{dx.code}</span>
                                  <span className="text-sm">{dx.description}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeDiagnosis(dx.code)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Previous Diagnoses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {encounterDetailData?.assessments?.some((a: any) => a.diagnosis_codes?.length > 0) ? (
                        <div className="space-y-2">
                          {encounterDetailData.assessments.map(
                            (assessment: any) =>
                              assessment.diagnosis_codes?.length > 0 && (
                                <div key={assessment.id} className="p-2 bg-slate-50 rounded-lg">
                                  <p className="text-xs text-slate-500 mb-1">
                                    {new Date(assessment.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {assessment.diagnosis_codes.map((code: string) => (
                                      <Badge key={code} variant="outline">
                                        {code}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ),
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">No previous diagnoses</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SOAP Note Tab */}
                <TabsContent value="soap" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Subjective</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={subjective}
                          onChange={(e) => setSubjective(e.target.value)}
                          placeholder="Chief complaint, HPI, ROS..."
                          rows={6}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Objective</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={Object.entries(physicalExam)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join("\n")}
                          placeholder="Physical exam findings, vitals..."
                          rows={6}
                          readOnly
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={assessment}
                          onChange={(e) => setAssessment(e.target.value)}
                          placeholder="Clinical assessment, diagnoses..."
                          rows={6}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={plan}
                          onChange={(e) => setPlan(e.target.value)}
                          placeholder="Treatment plan, medications, follow-up..."
                          rows={6}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Physical Exam Tab */}
                <TabsContent value="exam" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {physicalExamSections.map((section) => (
                      <Card key={section.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{section.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={physicalExam[section.id] || ""}
                            onChange={(e) => setPhysicalExam({ ...physicalExam, [section.id]: e.target.value })}
                            rows={3}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEncounterDetail(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSaveEncounter} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? "Saving..." : "Save & Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
