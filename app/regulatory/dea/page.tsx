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
import {
  Shield,
  FileText,
  Download,
  Calendar,
  AlertTriangle,
  Lock,
  Building,
  Users,
  BarChart3,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { format } from "date-fns"

interface ComplianceMetric {
  category: string
  status: "compliant" | "warning" | "violation"
  description: string
  lastChecked: string
  details?: string
}

interface InventoryRecord {
  id: string
  type: "initial" | "biennial" | "special"
  date: string
  totalQuantity: number
  status: "complete" | "pending" | "overdue"
  takenBy: string
  verifiedBy: string
}

interface AcquisitionRecord {
  id: string
  date: string
  supplier: string
  deaNumber: string
  medication: string
  quantity: number
  form222Number?: string
  status: "complete" | "missing_docs" | "pending"
}

export default function DEAPortalPage() {
  const [facilityInfo, setFacilityInfo] = useState<any>(null)
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([])
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([])
  const [acquisitionRecords, setAcquisitionRecords] = useState<AcquisitionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState("30")
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchDEAComplianceData()
  }, [selectedDateRange])

  const fetchDEAComplianceData = async () => {
    try {
      // Fetch facility information
      setFacilityInfo({
        name: "MASE Behavioral Health Center",
        deaNumber: "BM1234567",
        address: "123 Recovery Lane, Detroit, MI 48201",
        licenseExpiry: "2025-08-15",
        medicalDirector: "Dr. Sarah Johnson, MD",
        pharmacist: "Dr. Michael Chen, PharmD",
      })

      // Mock compliance metrics
      setComplianceMetrics([
        {
          category: "Schedule II Records Separation",
          status: "compliant",
          description: "All Schedule II records properly separated and secured",
          lastChecked: "2024-12-20",
        },
        {
          category: "Biennial Inventory",
          status: "compliant",
          description: "Last biennial inventory completed within required timeframe",
          lastChecked: "2024-01-15",
          details: "Next due: January 15, 2026",
        },
        {
          category: "Form 222 Documentation",
          status: "warning",
          description: "1 pending Form 222 requires completion",
          lastChecked: "2024-12-20",
          details: "Acquisition from Hikma Pharmaceuticals missing documentation",
        },
        {
          category: "Disposal Documentation",
          status: "violation",
          description: "Expired batch disposal overdue for Form 41",
          lastChecked: "2024-12-01",
          details: "Batch B-2023-045 expired 12/1/2024, Form 41 required within 14 days",
        },
        {
          category: "Records Retention",
          status: "compliant",
          description: "All records maintained for required 2+ year period",
          lastChecked: "2024-12-20",
        },
        {
          category: "Security Requirements",
          status: "compliant",
          description: "Vault storage and access controls meet DEA standards",
          lastChecked: "2024-12-15",
        },
      ])

      // Mock inventory records
      setInventoryRecords([
        {
          id: "INV-001",
          type: "initial",
          date: "2024-01-15",
          totalQuantity: 5000,
          status: "complete",
          takenBy: "RN Johnson",
          verifiedBy: "Dr. Smith",
        },
        {
          id: "INV-002",
          type: "biennial",
          date: "2026-01-15",
          totalQuantity: 0,
          status: "pending",
          takenBy: "",
          verifiedBy: "",
        },
      ])

      // Mock acquisition records
      setAcquisitionRecords([
        {
          id: "ACQ-001",
          date: "2024-12-15",
          supplier: "Cardinal Health",
          deaNumber: "BC1234567",
          medication: "Methadone HCl 10mg/mL",
          quantity: 1000,
          form222Number: "F222-2024-001",
          status: "complete",
        },
        {
          id: "ACQ-002",
          date: "2024-12-20",
          supplier: "Hikma Pharmaceuticals",
          deaNumber: "HK9876543",
          medication: "Methadone HCl 10mg/mL",
          quantity: 500,
          status: "missing_docs",
        },
      ])
    } catch (error) {
      console.error("Error fetching DEA compliance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "violation":
      case "missing_docs":
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
      case "complete":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
      case "warning":
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "violation":
      case "missing_docs":
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Violation</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const generateComplianceReport = async () => {
    // Generate comprehensive compliance report
    const reportData = {
      facilityInfo,
      complianceMetrics,
      inventoryRecords,
      acquisitionRecords,
      generatedAt: new Date().toISOString(),
      inspectorId: "DEA-12345", // Would come from auth context
    }

    // In a real implementation, this would generate a PDF or structured report
    console.log("Generating DEA compliance report:", reportData)
    alert("Compliance report generated successfully. Download will begin shortly.")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DEA compliance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* DEA Header */}
      <div className="bg-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DEA Compliance Portal</h1>
                <p className="text-blue-200">Drug Enforcement Administration - Inspection Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Inspector Access</p>
              <p className="font-medium">DEA-12345 • John Smith</p>
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
              <span>Facility Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Facility Name</Label>
                <p className="font-medium">{facilityInfo?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">DEA Registration</Label>
                <p className="font-medium">{facilityInfo?.deaNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">License Expiry</Label>
                <p className="font-medium">{facilityInfo?.licenseExpiry}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Medical Director</Label>
                <p className="font-medium">{facilityInfo?.medicalDirector}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Pharmacist</Label>
                <p className="font-medium">{facilityInfo?.pharmacist}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="font-medium">{facilityInfo?.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">83%</div>
              <p className="text-xs text-muted-foreground">2 issues require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-xs text-muted-foreground">Form 41 overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <p className="text-xs text-muted-foreground">Form 222 missing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Inspection</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-muted-foreground">Days ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="compliance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Records</TabsTrigger>
            <TabsTrigger value="acquisitions">Acquisitions</TabsTrigger>
            <TabsTrigger value="dispensing">Dispensing Logs</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>Current compliance status across all DEA requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(metric.status)}
                        <div>
                          <p className="font-medium">{metric.category}</p>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                          {metric.details && <p className="text-xs text-muted-foreground mt-1">{metric.details}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(metric.lastChecked), "MMM dd, yyyy")}
                        </span>
                        {getStatusBadge(metric.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Records</CardTitle>
                <CardDescription>Initial, biennial, and special inventory documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Taken By</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge variant="outline">{record.type.charAt(0).toUpperCase() + record.type.slice(1)}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{record.totalQuantity.toLocaleString()} mg</TableCell>
                        <TableCell>{record.takenBy || "—"}</TableCell>
                        <TableCell>{record.verifiedBy || "—"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acquisitions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Acquisition Records</CardTitle>
                    <CardDescription>Controlled substance receipts and Form 222 documentation</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search acquisitions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>DEA Number</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Form 222</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acquisitionRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{record.supplier}</TableCell>
                        <TableCell>{record.deaNumber}</TableCell>
                        <TableCell>{record.medication}</TableCell>
                        <TableCell>{record.quantity.toLocaleString()} mL</TableCell>
                        <TableCell>{record.form222Number || "—"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Docs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dispensing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispensing Logs</CardTitle>
                <CardDescription>Patient dispensing records and waste documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Patient Information Protected</h3>
                  <p className="text-muted-foreground mb-4">
                    Individual patient dispensing records require additional authorization to view.
                  </p>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Request Patient Data Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard DEA Reports</CardTitle>
                  <CardDescription>Pre-configured compliance reports for inspection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Complete Compliance Summary
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Inventory Reconciliation Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Acquisition & Disposal Register
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Access & Training Records
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Security & Storage Compliance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Report Generator</CardTitle>
                  <CardDescription>Generate specific reports for inspection needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventory Analysis</SelectItem>
                        <SelectItem value="acquisitions">Acquisition History</SelectItem>
                        <SelectItem value="dispensing">Dispensing Summary</SelectItem>
                        <SelectItem value="compliance">Compliance Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Range</Label>
                    <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                        <SelectItem value="all">All records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateComplianceReport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
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
