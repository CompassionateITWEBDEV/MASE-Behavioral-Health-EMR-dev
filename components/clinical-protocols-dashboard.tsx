"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Plus, Activity, Heart, TrendingUp } from "lucide-react"

interface COWSAssessment {
  id: string
  patientName: string
  totalScore: number
  severityLevel: string
  assessmentDate: string
  providerId: string
}

interface CIWAAssessment {
  id: string
  patientName: string
  totalScore: number
  severityLevel: string
  assessmentDate: string
  providerId: string
}

interface VitalSigns {
  id: string
  patientName: string
  systolicBp: number
  diastolicBp: number
  heartRate: number
  temperature: number
  oxygenSaturation: number
  measurementDate: string
}

export function ClinicalProtocolsDashboard() {
  const [cowsAssessments, setCowsAssessments] = useState<COWSAssessment[]>([])
  const [ciwaAssessments, setCiwaAssessments] = useState<CIWAAssessment[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewCowsOpen, setIsNewCowsOpen] = useState(false)
  const [isNewCiwaOpen, setIsNewCiwaOpen] = useState(false)
  const [isNewVitalsOpen, setIsNewVitalsOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCows: COWSAssessment[] = [
      {
        id: "1",
        patientName: "John Smith",
        totalScore: 18,
        severityLevel: "Moderate",
        assessmentDate: "2024-01-16",
        providerId: "1",
      },
      {
        id: "2",
        patientName: "Mike Davis",
        totalScore: 8,
        severityLevel: "Mild",
        assessmentDate: "2024-01-15",
        providerId: "1",
      },
    ]

    const mockCiwa: CIWAAssessment[] = [
      {
        id: "1",
        patientName: "Sarah Johnson",
        totalScore: 12,
        severityLevel: "Mild to Moderate",
        assessmentDate: "2024-01-16",
        providerId: "1",
      },
    ]

    const mockVitals: VitalSigns[] = [
      {
        id: "1",
        patientName: "John Smith",
        systolicBp: 140,
        diastolicBp: 90,
        heartRate: 88,
        temperature: 98.6,
        oxygenSaturation: 98,
        measurementDate: "2024-01-16",
      },
      {
        id: "2",
        patientName: "Sarah Johnson",
        systolicBp: 120,
        diastolicBp: 80,
        heartRate: 72,
        temperature: 98.2,
        oxygenSaturation: 99,
        measurementDate: "2024-01-16",
      },
    ]

    setCowsAssessments(mockCows)
    setCiwaAssessments(mockCiwa)
    setVitalSigns(mockVitals)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
      case "minimal":
        return "bg-green-100 text-green-800"
      case "moderate":
      case "mild to moderate":
        return "bg-yellow-100 text-yellow-800"
      case "moderately severe":
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalCowsAssessments = cowsAssessments.length
  const totalCiwaAssessments = ciwaAssessments.length
  const totalVitalsToday = vitalSigns.filter(
    (v) => new Date(v.measurementDate).toDateString() === new Date().toDateString(),
  ).length
  const averageHeartRate = Math.round(vitalSigns.reduce((sum, v) => sum + v.heartRate, 0) / vitalSigns.length)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COWS Assessments</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCowsAssessments}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CIWA Assessments</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCiwaAssessments}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vitals Today</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVitalsToday}</div>
            <p className="text-xs text-muted-foreground">Measurements taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Heart Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageHeartRate}</div>
            <p className="text-xs text-muted-foreground">BPM across patients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cows">COWS Assessments</TabsTrigger>
          <TabsTrigger value="ciwa">CIWA Assessments</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="protocols">Protocol Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="cows" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>COWS (Clinical Opiate Withdrawal Scale)</CardTitle>
                <Dialog open={isNewCowsOpen} onOpenChange={setIsNewCowsOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New COWS Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>COWS Assessment</DialogTitle>
                    </DialogHeader>
                    <COWSAssessmentForm onClose={() => setIsNewCowsOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Severity Level</TableHead>
                    <TableHead>Assessment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cowsAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.patientName}</TableCell>
                      <TableCell className="font-mono text-lg">{assessment.totalScore}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(assessment.severityLevel)}>{assessment.severityLevel}</Badge>
                      </TableCell>
                      <TableCell>{new Date(assessment.assessmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ciwa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>CIWA (Clinical Institute Withdrawal Assessment)</CardTitle>
                <Dialog open={isNewCiwaOpen} onOpenChange={setIsNewCiwaOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New CIWA Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>CIWA Assessment</DialogTitle>
                    </DialogHeader>
                    <CIWAAssessmentForm onClose={() => setIsNewCiwaOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Severity Level</TableHead>
                    <TableHead>Assessment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ciwaAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.patientName}</TableCell>
                      <TableCell className="font-mono text-lg">{assessment.totalScore}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(assessment.severityLevel)}>{assessment.severityLevel}</Badge>
                      </TableCell>
                      <TableCell>{new Date(assessment.assessmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vital Signs</CardTitle>
                <Dialog open={isNewVitalsOpen} onOpenChange={setIsNewVitalsOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Vitals
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Vital Signs</DialogTitle>
                    </DialogHeader>
                    <VitalSignsForm onClose={() => setIsNewVitalsOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Pressure</TableHead>
                    <TableHead>Heart Rate</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>O2 Sat</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vitalSigns.map((vitals) => (
                    <TableRow key={vitals.id}>
                      <TableCell className="font-medium">{vitals.patientName}</TableCell>
                      <TableCell className="font-mono">
                        {vitals.systolicBp}/{vitals.diastolicBp}
                      </TableCell>
                      <TableCell className="font-mono">{vitals.heartRate} BPM</TableCell>
                      <TableCell className="font-mono">{vitals.temperature}°F</TableCell>
                      <TableCell className="font-mono">{vitals.oxygenSaturation}%</TableCell>
                      <TableCell>{new Date(vitals.measurementDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Trends
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Protocol Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Opioid Withdrawal Protocol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      COWS assessment every 4 hours with medication management
                    </p>
                    <Button size="sm">Configure</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alcohol Withdrawal Protocol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">CIWA assessment every 2 hours with seizure precautions</p>
                    <Button size="sm">Configure</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Vitals Protocol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Routine vital signs monitoring for all patients</p>
                    <Button size="sm">Configure</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function COWSAssessmentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    restingPulseRate: 0,
    sweating: 0,
    restlessness: 0,
    pupilSize: 0,
    boneJointAches: 0,
    runnyNoseTearing: 0,
    giUpset: 0,
    tremor: 0,
    yawning: 0,
    anxietyIrritability: 0,
    goosefleshSkin: 0,
    notes: "",
  })

  const cowsItems = [
    { key: "restingPulseRate", label: "Resting Pulse Rate" },
    { key: "sweating", label: "Sweating" },
    { key: "restlessness", label: "Restlessness" },
    { key: "pupilSize", label: "Pupil Size" },
    { key: "boneJointAches", label: "Bone/Joint Aches" },
    { key: "runnyNoseTearing", label: "Runny Nose/Tearing" },
    { key: "giUpset", label: "GI Upset" },
    { key: "tremor", label: "Tremor" },
    { key: "yawning", label: "Yawning" },
    { key: "anxietyIrritability", label: "Anxiety/Irritability" },
    { key: "goosefleshSkin", label: "Gooseflesh Skin" },
  ]

  const totalScore = Object.values(formData).reduce((sum, val) => (typeof val === "number" ? sum + val : sum), 0)

  const getSeverityLevel = (score: number) => {
    if (score <= 12) return "Mild"
    if (score <= 24) return "Moderate"
    if (score <= 36) return "Moderately Severe"
    return "Severe"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("COWS Assessment:", formData, "Total Score:", totalScore)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="patient">Patient</Label>
        <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">John Smith</SelectItem>
            <SelectItem value="2">Sarah Johnson</SelectItem>
            <SelectItem value="3">Mike Davis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cowsItems.map((item) => (
          <div key={item.key}>
            <Label>{item.label}</Label>
            <Select
              value={formData[item.key as keyof typeof formData].toString()}
              onValueChange={(value) => setFormData({ ...formData, [item.key]: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - None</SelectItem>
                <SelectItem value="1">1 - Mild</SelectItem>
                <SelectItem value="2">2 - Moderate</SelectItem>
                <SelectItem value="3">3 - Moderately Severe</SelectItem>
                <SelectItem value="4">4 - Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total COWS Score:</span>
          <span className="text-2xl font-bold">{totalScore}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">Severity Level:</span>
          <Badge
            className={
              totalScore <= 12
                ? "bg-green-100 text-green-800"
                : totalScore <= 24
                  ? "bg-yellow-100 text-yellow-800"
                  : totalScore <= 36
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
            }
          >
            {getSeverityLevel(totalScore)}
          </Badge>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional observations..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Assessment</Button>
      </div>
    </form>
  )
}

function CIWAAssessmentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    nauseaVomiting: 0,
    tremor: 0,
    paroxysmalSweats: 0,
    anxiety: 0,
    agitation: 0,
    tactileDisturbances: 0,
    auditoryDisturbances: 0,
    visualDisturbances: 0,
    headacheFullness: 0,
    orientation: 0,
    notes: "",
  })

  const ciwaItems = [
    { key: "nauseaVomiting", label: "Nausea/Vomiting", max: 7 },
    { key: "tremor", label: "Tremor", max: 7 },
    { key: "paroxysmalSweats", label: "Paroxysmal Sweats", max: 7 },
    { key: "anxiety", label: "Anxiety", max: 7 },
    { key: "agitation", label: "Agitation", max: 7 },
    { key: "tactileDisturbances", label: "Tactile Disturbances", max: 7 },
    { key: "auditoryDisturbances", label: "Auditory Disturbances", max: 7 },
    { key: "visualDisturbances", label: "Visual Disturbances", max: 7 },
    { key: "headacheFullness", label: "Headache/Fullness", max: 7 },
    { key: "orientation", label: "Orientation", max: 4 },
  ]

  const totalScore = Object.values(formData).reduce((sum, val) => (typeof val === "number" ? sum + val : sum), 0)

  const getSeverityLevel = (score: number) => {
    if (score <= 9) return "Minimal"
    if (score <= 15) return "Mild to Moderate"
    return "Severe"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("CIWA Assessment:", formData, "Total Score:", totalScore)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="patient">Patient</Label>
        <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">John Smith</SelectItem>
            <SelectItem value="2">Sarah Johnson</SelectItem>
            <SelectItem value="3">Mike Davis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ciwaItems.map((item) => (
          <div key={item.key}>
            <Label>{item.label}</Label>
            <Select
              value={formData[item.key as keyof typeof formData].toString()}
              onValueChange={(value) => setFormData({ ...formData, [item.key]: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: item.max + 1 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total CIWA Score:</span>
          <span className="text-2xl font-bold">{totalScore}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">Severity Level:</span>
          <Badge
            className={
              totalScore <= 9
                ? "bg-green-100 text-green-800"
                : totalScore <= 15
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }
          >
            {getSeverityLevel(totalScore)}
          </Badge>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional observations..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Assessment</Button>
      </div>
    </form>
  )
}

function VitalSignsForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    systolicBp: "",
    diastolicBp: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    painScale: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Vital Signs:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="patient">Patient</Label>
        <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">John Smith</SelectItem>
            <SelectItem value="2">Sarah Johnson</SelectItem>
            <SelectItem value="3">Mike Davis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="systolic">Systolic BP</Label>
          <Input
            id="systolic"
            type="number"
            value={formData.systolicBp}
            onChange={(e) => setFormData({ ...formData, systolicBp: e.target.value })}
            placeholder="120"
          />
        </div>

        <div>
          <Label htmlFor="diastolic">Diastolic BP</Label>
          <Input
            id="diastolic"
            type="number"
            value={formData.diastolicBp}
            onChange={(e) => setFormData({ ...formData, diastolicBp: e.target.value })}
            placeholder="80"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="heartRate">Heart Rate</Label>
          <Input
            id="heartRate"
            type="number"
            value={formData.heartRate}
            onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            placeholder="72"
          />
        </div>

        <div>
          <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
          <Input
            id="respiratoryRate"
            type="number"
            value={formData.respiratoryRate}
            onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
            placeholder="16"
          />
        </div>

        <div>
          <Label htmlFor="temperature">Temperature (°F)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            placeholder="98.6"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
          <Input
            id="oxygenSaturation"
            type="number"
            value={formData.oxygenSaturation}
            onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
            placeholder="98"
          />
        </div>

        <div>
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="150"
          />
        </div>

        <div>
          <Label htmlFor="painScale">Pain Scale (0-10)</Label>
          <Input
            id="painScale"
            type="number"
            min="0"
            max="10"
            value={formData.painScale}
            onChange={(e) => setFormData({ ...formData, painScale: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional observations..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Vitals</Button>
      </div>
    </form>
  )
}
