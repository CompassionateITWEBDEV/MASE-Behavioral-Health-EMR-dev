"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Building,
  FileCheck,
  Users,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Download,
  Search,
  Star,
  Target,
  Clipboard,
} from "lucide-react"
import { format } from "date-fns"

interface AccreditationStandard {
  id: string
  category: string
  standard: string
  description: string
  status: "met" | "partial" | "not_met" | "not_applicable"
  score: number
  lastReviewed: string
  evidence?: string[]
  findings?: string
  recommendations?: string
}

interface QualityMeasure {
  id: string
  measure: string
  target: number
  current: number
  trend: "improving" | "stable" | "declining"
  lastUpdated: string
  category: "patient_safety" | "clinical_quality" | "patient_experience"
}

interface PatientSafetyEvent {
  id: string
  date: string
  type: string
  severity: "low" | "moderate" | "high" | "sentinel"
  description: string
  status: "reported" | "investigating" | "resolved"
  rootCause?: string
  actions?: string[]
}

export default function JointCommissionPortalPage() {
  const [facilityInfo, setFacilityInfo] = useState<any>(null)
  const [accreditationStandards, setAccreditationStandards] = useState<AccreditationStandard[]>([])
  const [qualityMeasures, setQualityMeasures] = useState<QualityMeasure[]>([])
  const [safetyEvents, setSafetyEvents] = useState<PatientSafetyEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchJointCommissionData()
  }, [])

  const fetchJointCommissionData = async () => {
    try {
      // Fetch facility information
      setFacilityInfo({
        name: "MASE Behavioral Health Center",
        accreditationStatus: "Accredited",
        accreditationExpiry: "2026-03-15",
        lastSurvey: "2023-03-15",
        nextSurvey: "2026-03-15",
        programType: "Opioid Treatment Program (OTP)",
        bedCount: 0, // Outpatient only
        administrator: "Jane Smith, MBA",
        medicalDirector: "Dr. Sarah Johnson, MD",
      })

      // Mock accreditation standards
      setAccreditationStandards([
        {
          id: "PC.01.01.01",
          category: "Patient Care",
          standard: "PC.01.01.01 - Patient Rights",
          description: "The organization respects the rights of patients",
          status: "met",
          score: 95,
          lastReviewed: "2024-12-15",
          evidence: ["Patient Rights Policy", "Staff Training Records", "Patient Feedback"],
        },
        {
          id: "PC.02.01.21",
          category: "Patient Care",
          standard: "PC.02.01.21 - Pain Assessment",
          description: "Pain is assessed and managed appropriately",
          status: "met",
          score: 88,
          lastReviewed: "2024-12-10",
          evidence: ["Pain Assessment Tools", "Clinical Documentation"],
        },
        {
          id: "MM.06.01.01",
          category: "Medication Management",
          standard: "MM.06.01.01 - Medication Storage",
          description: "Medications are stored safely and securely",
          status: "partial",
          score: 75,
          lastReviewed: "2024-12-01",
          findings: "Temperature monitoring logs incomplete for refrigerated medications",
          recommendations: "Implement daily temperature checks and documentation",
        },
        {
          id: "PI.01.01.01",
          category: "Performance Improvement",
          standard: "PI.01.01.01 - Quality Program",
          description: "The organization has an ongoing quality improvement program",
          status: "met",
          score: 92,
          lastReviewed: "2024-11-30",
          evidence: ["QI Committee Minutes", "Performance Data", "Improvement Plans"],
        },
        {
          id: "HR.01.02.01",
          category: "Human Resources",
          standard: "HR.01.02.01 - Staff Competency",
          description: "Staff competency is assessed and maintained",
          status: "not_met",
          score: 45,
          lastReviewed: "2024-11-15",
          findings: "Missing competency assessments for 3 clinical staff members",
          recommendations: "Complete competency assessments within 30 days",
        },
      ])

      // Mock quality measures
      setQualityMeasures([
        {
          id: "QM-001",
          measure: "Patient Retention Rate (90 days)",
          target: 75,
          current: 82,
          trend: "improving",
          lastUpdated: "2024-12-20",
          category: "clinical_quality",
        },
        {
          id: "QM-002",
          measure: "Medication Adherence Rate",
          target: 85,
          current: 78,
          trend: "stable",
          lastUpdated: "2024-12-20",
          category: "clinical_quality",
        },
        {
          id: "QM-003",
          measure: "Patient Safety Events per 1000 visits",
          target: 2,
          current: 1.2,
          trend: "improving",
          lastUpdated: "2024-12-20",
          category: "patient_safety",
        },
        {
          id: "QM-004",
          measure: "Patient Satisfaction Score",
          target: 90,
          current: 87,
          trend: "stable",
          lastUpdated: "2024-12-15",
          category: "patient_experience",
        },
      ])

      // Mock safety events
      setSafetyEvents([
        {
          id: "SE-001",
          date: "2024-12-18",
          type: "Medication Error",
          severity: "moderate",
          description: "Incorrect dosage administered - caught before patient harm",
          status: "resolved",
          rootCause: "Calculation error during dose preparation",
          actions: ["Staff retraining on dosage calculations", "Double-check protocol implemented"],
        },
        {
          id: "SE-002",
          date: "2024-12-10",
          type: "Patient Fall",
          severity: "low",
          description: "Patient slipped in waiting area - no injury",
          status: "resolved",
          rootCause: "Wet floor from recent cleaning",
          actions: ["Improved signage for wet floors", "Non-slip mats installed"],
        },
        {
          id: "SE-003",
          date: "2024-12-05",
          type: "Documentation Error",
          severity: "low",
          description: "Missing signature on treatment plan",
          status: "resolved",
          actions: ["Electronic signature system implemented"],
        },
      ])
    } catch (error) {
      console.error("Error fetching Joint Commission data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met":
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "partial":
      case "investigating":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "not_met":
      case "reported":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met":
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Met</Badge>
      case "partial":
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "not_met":
      case "reported":
        return <Badge className="bg-red-100 text-red-800">Not Met</Badge>
      case "not_applicable":
        return <Badge variant="outline">N/A</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <span className="text-green-600">↗</span>
      case "declining":
        return <span className="text-red-600">↘</span>
      default:
        return <span className="text-gray-600">→</span>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "sentinel":
        return <Badge className="bg-red-600 text-white">Sentinel Event</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "moderate":
        return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const overallComplianceScore = Math.round(
    accreditationStandards.reduce((sum, std) => sum + std.score, 0) / accreditationStandards.length,
  )

  const filteredStandards = accreditationStandards.filter((std) => {
    const matchesCategory = selectedCategory === "all" || std.category === selectedCategory
    const matchesSearch =
      std.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Joint Commission data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Joint Commission Header */}
      <div className="bg-emerald-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-emerald-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Joint Commission Survey Portal</h1>
                <p className="text-emerald-200">Accreditation Standards & Quality Measures</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-200">Surveyor Access</p>
              <p className="font-medium">JC-67890 • Mary Johnson</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Facility Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Facility Accreditation Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Facility Name</Label>
                <p className="font-medium">{facilityInfo?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Accreditation Status</Label>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{facilityInfo?.accreditationStatus}</p>
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Program Type</Label>
                <p className="font-medium">{facilityInfo?.programType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Next Survey</Label>
                <p className="font-medium">{facilityInfo?.nextSurvey}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Administrator</Label>
                <p className="font-medium">{facilityInfo?.administrator}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Medical Director</Label>
                <p className="font-medium">{facilityInfo?.medicalDirector}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Survey</Label>
                <p className="font-medium">{facilityInfo?.lastSurvey}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Accreditation Expires</Label>
                <p className="font-medium">{facilityInfo?.accreditationExpiry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{overallComplianceScore}%</div>
              <Progress value={overallComplianceScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Accreditation standards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Standards Not Met</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {accreditationStandards.filter((s) => s.status === "not_met").length}
              </div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Measures</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {qualityMeasures.filter((m) => m.current >= m.target).length}/{qualityMeasures.length}
              </div>
              <p className="text-xs text-muted-foreground">Meeting targets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safety Events (30d)</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{safetyEvents.length}</div>
              <p className="text-xs text-muted-foreground">All resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="standards" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="quality">Quality Measures</TabsTrigger>
            <TabsTrigger value="safety">Patient Safety</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="reports">Survey Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="standards" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Accreditation Standards</CardTitle>
                    <CardDescription>Joint Commission standards compliance assessment</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Patient Care">Patient Care</SelectItem>
                        <SelectItem value="Medication Management">Medication Management</SelectItem>
                        <SelectItem value="Performance Improvement">Performance Improvement</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search standards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStandards.map((standard) => (
                    <div key={standard.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(standard.status)}
                            <h4 className="font-medium">{standard.standard}</h4>
                            {getStatusBadge(standard.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{standard.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Score: {standard.score}%</span>
                            <span>Last reviewed: {format(new Date(standard.lastReviewed), "MMM dd, yyyy")}</span>
                            <Badge variant="outline">{standard.category}</Badge>
                          </div>
                          {standard.findings && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm font-medium text-yellow-800">Findings:</p>
                              <p className="text-sm text-yellow-700">{standard.findings}</p>
                            </div>
                          )}
                          {standard.recommendations && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-800">Recommendations:</p>
                              <p className="text-sm text-blue-700">{standard.recommendations}</p>
                            </div>
                          )}
                          {standard.evidence && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Evidence:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {standard.evidence.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{standard.score}%</div>
                            <Progress value={standard.score} className="w-20 mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Performance Measures</CardTitle>
                <CardDescription>Key performance indicators and quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {qualityMeasures.map((measure) => (
                    <Card key={measure.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{measure.measure}</CardTitle>
                          <Badge variant="outline">{measure.category.replace("_", " ")}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Current</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold">{measure.current}%</span>
                              {getTrendIcon(measure.trend)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Target</span>
                            <span className="font-medium">{measure.target}%</span>
                          </div>
                          <Progress value={(measure.current / measure.target) * 100} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Last updated: {format(new Date(measure.lastUpdated), "MMM dd")}</span>
                            <Badge
                              className={
                                measure.current >= measure.target
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {measure.current >= measure.target ? "Meeting Target" : "Below Target"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Safety Events</CardTitle>
                <CardDescription>Safety event reporting and root cause analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safetyEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{format(new Date(event.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Safety Event Details</DialogTitle>
                                <DialogDescription>
                                  {event.type} - {format(new Date(event.date), "MMMM dd, yyyy")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-medium">Description</Label>
                                  <p className="text-sm mt-1">{event.description}</p>
                                </div>
                                {event.rootCause && (
                                  <div>
                                    <Label className="font-medium">Root Cause</Label>
                                    <p className="text-sm mt-1">{event.rootCause}</p>
                                  </div>
                                )}
                                {event.actions && (
                                  <div>
                                    <Label className="font-medium">Corrective Actions</Label>
                                    <ul className="text-sm mt-1 space-y-1">
                                      {event.actions.map((action, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                          <span>•</span>
                                          <span>{action}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation Review</CardTitle>
                <CardDescription>Policy documents and evidence for accreditation standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Policies & Procedures</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Patient Rights Policy</span>
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Medication Management Policy</span>
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Quality Improvement Plan</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Review Due</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Staff Competency Policy</span>
                        <Badge className="bg-red-100 text-red-800">Outdated</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Training Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Patient Safety Training</span>
                        <Badge className="bg-green-100 text-green-800">100% Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Medication Safety</span>
                        <Badge className="bg-green-100 text-green-800">95% Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Emergency Procedures</span>
                        <Badge className="bg-yellow-100 text-yellow-800">85% Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Competency Assessments</span>
                        <Badge className="bg-red-100 text-red-800">70% Complete</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Reports</CardTitle>
                  <CardDescription>Generate comprehensive reports for Joint Commission review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Accreditation Readiness Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Quality Measures Dashboard
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Patient Safety Summary
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Competency Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Policy Compliance Review
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Survey Preparation</CardTitle>
                  <CardDescription>Tools and checklists for survey readiness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">Survey Readiness Score</h4>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="flex-1" />
                      <span className="font-bold text-emerald-800">85%</span>
                    </div>
                    <p className="text-sm text-emerald-700 mt-2">2 critical items need attention before next survey</p>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Survey Preparation Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
