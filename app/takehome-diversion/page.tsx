"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  QrCode,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Bell,
  Camera,
  Home,
  Plane,
  User,
  Eye,
  RefreshCw,
  Download,
  ChevronRight,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react"

// Mock data
const complianceAlerts = [
  {
    id: 1,
    patient: "John Doe",
    patient_id: "P001",
    alert_type: "missed_dose",
    severity: "high",
    title: "Missed Dose - Bottle #3",
    description: "Patient did not scan dose by 11:00 AM",
    time: "11:05 AM",
    date: "2025-01-28",
    status: "new",
    callback_required: true,
  },
  {
    id: 2,
    patient: "Jane Smith",
    patient_id: "P002",
    alert_type: "location_violation",
    severity: "critical",
    title: "Location Violation",
    description: "Dose scanned 2.3 miles from registered home",
    time: "7:30 AM",
    date: "2025-01-28",
    status: "investigating",
    callback_required: true,
  },
  {
    id: 3,
    patient: "Mike Johnson",
    patient_id: "P003",
    alert_type: "biometric_failure",
    severity: "critical",
    title: "Biometric Verification Failed",
    description: "Facial recognition confidence: 42% (required: 85%)",
    time: "8:15 AM",
    date: "2025-01-28",
    status: "new",
    callback_required: true,
  },
  {
    id: 4,
    patient: "Sarah Wilson",
    patient_id: "P004",
    alert_type: "time_violation",
    severity: "medium",
    title: "Late Dose",
    description: "Dose consumed 45 minutes after dosing window",
    time: "11:45 AM",
    date: "2025-01-28",
    status: "resolved",
    callback_required: false,
  },
]

const patientCompliance = [
  {
    id: "P001",
    name: "John Doe",
    takehome_level: 6,
    total_doses: 42,
    compliant_doses: 38,
    location_violations: 1,
    time_violations: 2,
    biometric_failures: 1,
    missed_doses: 0,
    compliance_rate: 90.5,
    risk_level: "moderate",
    last_scan: "2025-01-27 7:15 AM",
    home_verified: true,
    biometric_enrolled: true,
  },
  {
    id: "P002",
    name: "Jane Smith",
    takehome_level: 13,
    total_doses: 91,
    compliant_doses: 89,
    location_violations: 0,
    time_violations: 1,
    biometric_failures: 1,
    missed_doses: 0,
    compliance_rate: 97.8,
    risk_level: "low",
    last_scan: "2025-01-28 6:45 AM",
    home_verified: true,
    biometric_enrolled: true,
  },
  {
    id: "P003",
    name: "Mike Johnson",
    takehome_level: 6,
    total_doses: 42,
    compliant_doses: 35,
    location_violations: 3,
    time_violations: 2,
    biometric_failures: 2,
    missed_doses: 0,
    compliance_rate: 83.3,
    risk_level: "high",
    last_scan: "2025-01-28 8:15 AM",
    home_verified: true,
    biometric_enrolled: true,
  },
]

const travelExceptions = [
  {
    id: 1,
    patient: "Jane Smith",
    type: "travel",
    reason: "Family funeral in Ohio",
    start_date: "2025-02-01",
    end_date: "2025-02-05",
    location: "Columbus, OH",
    status: "approved",
    approved_by: "Dr. Williams",
  },
  {
    id: 2,
    patient: "Robert Brown",
    type: "work",
    reason: "Business conference",
    start_date: "2025-02-10",
    end_date: "2025-02-12",
    location: "Chicago, IL",
    status: "pending",
    approved_by: null,
  },
]

export default function TakeHomeDiversionPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [alertFilter, setAlertFilter] = useState("all")

  // Stats
  const stats = {
    total_active_bottles: 156,
    scans_today: 42,
    compliance_rate: 94.2,
    active_alerts: 3,
    pending_callbacks: 2,
    travel_exceptions: 1,
  }

  const filteredAlerts = complianceAlerts.filter((alert) => {
    if (alertFilter === "all") return true
    return alert.status === alertFilter
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "moderate":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "missed_dose":
        return <Clock className="h-4 w-4" />
      case "location_violation":
        return <MapPin className="h-4 w-4" />
      case "biometric_failure":
        return <User className="h-4 w-4" />
      case "time_violation":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashboardSidebar />

      <main className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
              Take-Home Diversion Control
            </h1>
            <p style={{ color: "#64748b" }}>QR Code + GPS + Facial Biometrics Verification System</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Check Missed Doses
            </Button>
            <Button className="gap-2" style={{ backgroundColor: "#0891b2" }}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#e0f2fe" }}>
                  <QrCode className="h-5 w-5" style={{ color: "#0891b2" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Active Bottles
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                    {stats.total_active_bottles}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#dcfce7" }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Scans Today
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                    {stats.scans_today}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#e0f2fe" }}>
                  <Target className="h-5 w-5" style={{ color: "#0891b2" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Compliance Rate
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
                    {stats.compliance_rate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Active Alerts
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#d97706" }}>
                    {stats.active_alerts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#fee2e2" }}>
                  <Bell className="h-5 w-5" style={{ color: "#dc2626" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Pending Callbacks
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>
                    {stats.pending_callbacks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#f3e8ff" }}>
                  <Plane className="h-5 w-5" style={{ color: "#9333ea" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Travel Exceptions
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#9333ea" }}>
                    {stats.travel_exceptions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Compliance Alerts
              {stats.active_alerts > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.active_alerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="patients" className="gap-2">
              <User className="h-4 w-4" />
              Patient Compliance
            </TabsTrigger>
            <TabsTrigger value="travel" className="gap-2">
              <Plane className="h-4 w-4" />
              Travel Exceptions
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Shield className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Scans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Real-Time Scan Activity
                  </CardTitle>
                  <CardDescription>Live monitoring of patient dose verifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        patient: "Jane Smith",
                        time: "6:45 AM",
                        status: "verified",
                        location: true,
                        time_ok: true,
                        biometric: true,
                      },
                      {
                        patient: "John Doe",
                        time: "7:15 AM",
                        status: "verified",
                        location: true,
                        time_ok: true,
                        biometric: true,
                      },
                      {
                        patient: "Mike Johnson",
                        time: "8:15 AM",
                        status: "failed",
                        location: true,
                        time_ok: true,
                        biometric: false,
                      },
                      {
                        patient: "Sarah Wilson",
                        time: "11:45 AM",
                        status: "warning",
                        location: true,
                        time_ok: false,
                        biometric: true,
                      },
                    ].map((scan, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {scan.status === "verified" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : scan.status === "failed" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{scan.patient}</p>
                            <p className="text-sm text-gray-500">{scan.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={scan.location ? "default" : "destructive"} className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            GPS
                          </Badge>
                          <Badge variant={scan.time_ok ? "default" : "secondary"} className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Time
                          </Badge>
                          <Badge variant={scan.biometric ? "default" : "destructive"} className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Face
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Compliance Overview
                  </CardTitle>
                  <CardDescription>Weekly compliance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Location Compliance</span>
                        <span className="text-sm font-medium text-green-600">96.5%</span>
                      </div>
                      <Progress value={96.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Time Window Compliance</span>
                        <span className="text-sm font-medium text-green-600">92.3%</span>
                      </div>
                      <Progress value={92.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Biometric Verification</span>
                        <span className="text-sm font-medium text-yellow-600">88.7%</span>
                      </div>
                      <Progress value={88.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Compliance</span>
                        <span className="text-sm font-medium text-green-600">94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+2.3%</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">vs. last week</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">0 Diversions</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">confirmed this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Compliance Alerts</CardTitle>
                    <CardDescription>Real-time alerts for non-compliant doses</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={alertFilter} onValueChange={setAlertFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Alerts</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAlertIcon(alert.alert_type)}
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm text-gray-500">{alert.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.patient}</p>
                            <p className="text-sm text-gray-500">{alert.patient_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {alert.alert_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.time}</p>
                            <p className="text-sm text-gray-500">{alert.date}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.status === "resolved"
                                ? "default"
                                : alert.status === "investigating"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {alert.callback_required && alert.status !== "resolved" && (
                              <Button size="sm" variant="destructive">
                                Callback
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Compliance Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Patient Compliance Tracking</CardTitle>
                    <CardDescription>Monitor individual patient diversion risk scores</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Take-Home Level</TableHead>
                      <TableHead>Compliance Rate</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Biometric</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Last Scan</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientCompliance.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.takehome_level} days</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={patient.compliance_rate} className="w-20 h-2" />
                            <span
                              className={`text-sm font-medium ${
                                patient.compliance_rate >= 95
                                  ? "text-green-600"
                                  : patient.compliance_rate >= 85
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {patient.compliance_rate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className={patient.location_violations > 0 ? "text-red-600" : "text-green-600"}>
                              {patient.location_violations}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={patient.time_violations > 0 ? "text-yellow-600" : "text-green-600"}>
                              {patient.time_violations}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Camera className="h-4 w-4 text-gray-400" />
                            <span className={patient.biometric_failures > 0 ? "text-red-600" : "text-green-600"}>
                              {patient.biometric_failures}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRiskColor(patient.risk_level)} text-white`}>
                            {patient.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{patient.last_scan}</p>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                            View <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Travel Exceptions Tab */}
          <TabsContent value="travel">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Travel & Location Exceptions</CardTitle>
                    <CardDescription>Manage pre-approved location exceptions for patients</CardDescription>
                  </div>
                  <Button style={{ backgroundColor: "#0891b2" }}>+ New Exception</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelExceptions.map((exception) => (
                      <TableRow key={exception.id}>
                        <TableCell className="font-medium">{exception.patient}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {exception.type === "travel" ? (
                              <>
                                <Plane className="h-3 w-3 mr-1" /> Travel
                              </>
                            ) : (
                              <>
                                <Home className="h-3 w-3 mr-1" /> Work
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{exception.reason}</TableCell>
                        <TableCell>{exception.location}</TableCell>
                        <TableCell>
                          {exception.start_date} - {exception.end_date}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              exception.status === "approved"
                                ? "default"
                                : exception.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {exception.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{exception.approved_by || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {exception.status === "pending" && (
                              <>
                                <Button size="sm" variant="default">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive">
                                  Deny
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Dosing Window Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Weekday Start Time</label>
                      <Input type="time" defaultValue="06:00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weekday End Time</label>
                      <Input type="time" defaultValue="11:00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Weekend Start Time</label>
                      <Input type="time" defaultValue="06:00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weekend End Time</label>
                      <Input type="time" defaultValue="14:00" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Geofencing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Geofence Radius (meters)</label>
                    <Input type="number" defaultValue="150" />
                    <p className="text-sm text-gray-500 mt-1">~500 feet - DEA recommended distance</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location Violation Tolerance (meters)</label>
                    <Input type="number" defaultValue="100" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Biometric Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Facial Match Threshold (%)</label>
                    <Input type="number" defaultValue="85" min="50" max="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Verification Attempts</label>
                    <Input type="number" defaultValue="3" min="1" max="5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Require Liveness Check</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" style={{ color: "#0891b2" }} />
                    Alert Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Missed Dose Alert (hours after window)</label>
                    <Input type="number" defaultValue="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto Callback After Missed Doses</label>
                    <Input type="number" defaultValue="2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Patient Reminder (minutes before window ends)</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
