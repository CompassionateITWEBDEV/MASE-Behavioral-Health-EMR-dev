"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  FileCheck,
  Building,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface RegulatoryAccess {
  id: string
  inspector_id: string
  inspector_name: string
  organization: string
  role: string
  access_expires_at: string
  is_active: boolean
}

interface ComplianceAlert {
  id: string
  type: "dea" | "joint_commission"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  dueDate?: string
  status: "open" | "in_progress" | "resolved"
}

export default function RegulatoryDashboardPage() {
  const [userRole, setUserRole] = useState<string>("")
  const [activeAccess, setActiveAccess] = useState<RegulatoryAccess[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchRegulatoryData()
  }, [])

  const fetchRegulatoryData = async () => {
    try {
      // Get current user role
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: providerData } = await supabase
          .from("providers")
          .select("role, inspector_id, organization")
          .eq("id", user.id)
          .single()

        if (providerData) {
          setUserRole(providerData.role)
        }
      }

      // Fetch active regulatory access (for administrators)
      const { data: accessData } = await supabase
        .from("regulatory_access")
        .select("*")
        .eq("is_active", true)
        .gt("access_expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })

      setActiveAccess(accessData || [])

      // Mock compliance alerts
      setComplianceAlerts([
        {
          id: "ALERT-001",
          type: "dea",
          severity: "high",
          title: "Form 41 Overdue",
          description: "Expired batch B-2023-045 disposal documentation required",
          dueDate: "2024-12-15",
          status: "open",
        },
        {
          id: "ALERT-002",
          type: "dea",
          severity: "medium",
          title: "Form 222 Missing",
          description: "Hikma Pharmaceuticals acquisition missing documentation",
          status: "in_progress",
        },
        {
          id: "ALERT-003",
          type: "joint_commission",
          severity: "high",
          title: "Staff Competency Assessments",
          description: "3 clinical staff members missing competency assessments",
          dueDate: "2025-01-15",
          status: "open",
        },
        {
          id: "ALERT-004",
          type: "joint_commission",
          severity: "medium",
          title: "Temperature Monitoring",
          description: "Incomplete temperature logs for refrigerated medications",
          status: "in_progress",
        },
      ])
    } catch (error) {
      console.error("Error fetching regulatory data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOrganizationIcon = (org: string) => {
    switch (org) {
      case "DEA":
        return <Shield className="h-4 w-4 text-blue-600" />
      case "Joint Commission":
        return <FileCheck className="h-4 w-4 text-emerald-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const isRegulatory = ["dea_inspector", "joint_commission_surveyor", "state_inspector", "read_only_auditor"].includes(
    userRole,
  )
  const isAdmin = ["administrator", "compliance_officer"].includes(userRole)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading regulatory dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Regulatory Compliance Dashboard</h1>
                <p className="text-slate-200">Unified access to regulatory portals and compliance monitoring</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-200">
                {isRegulatory ? "Inspector Access" : isAdmin ? "Administrator" : "Provider"}
              </p>
              <p className="font-medium">MASE Behavioral Health Center</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* DEA Portal Access */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>DEA Compliance Portal</span>
              </CardTitle>
              <CardDescription>Drug Enforcement Administration inspection dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Compliance Score</span>
                  <Badge className="bg-yellow-100 text-yellow-800">83%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Violations</span>
                  <Badge className="bg-red-100 text-red-800">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Items</span>
                  <Badge className="bg-yellow-100 text-yellow-800">1</Badge>
                </div>
                <Link href="/regulatory/dea">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access DEA Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Joint Commission Portal Access */}
          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                <span>Joint Commission Portal</span>
              </CardTitle>
              <CardDescription>Accreditation standards and quality measures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standards Compliance</span>
                  <Badge className="bg-emerald-100 text-emerald-800">78%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standards Not Met</span>
                  <Badge className="bg-red-100 text-red-800">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quality Measures</span>
                  <Badge className="bg-emerald-100 text-emerald-800">3/4</Badge>
                </div>
                <Link href="/regulatory/joint-commission">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access JC Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                <span>Overall Compliance</span>
              </CardTitle>
              <CardDescription>Combined regulatory compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <Badge className="bg-yellow-100 text-yellow-800">81%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Critical Issues</span>
                  <Badge className="bg-red-100 text-red-800">2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">Dec 20, 2024</span>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
            <TabsTrigger value="access">Active Access</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="schedule">Inspection Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts & Action Items</CardTitle>
                <CardDescription>Critical compliance issues requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(alert.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getOrganizationIcon(alert.type === "dea" ? "DEA" : "Joint Commission")}
                            <h4 className="font-medium">{alert.title}</h4>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {alert.type === "dea" ? "DEA" : "Joint Commission"}
                            </Badge>
                            {alert.dueDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Due: {format(new Date(alert.dueDate), "MMM dd, yyyy")}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Regulatory Access</CardTitle>
                <CardDescription>Current inspector and surveyor access to the system</CardDescription>
              </CardHeader>
              <CardContent>
                {activeAccess.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeAccess.map((access) => (
                        <TableRow key={access.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{access.inspector_name}</div>
                              <div className="text-sm text-muted-foreground">{access.inspector_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getOrganizationIcon(access.organization)}
                              <span>{access.organization}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {access.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(access.access_expires_at), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Monitor
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Regulatory Access</h3>
                    <p className="text-muted-foreground">No inspectors or surveyors currently have system access.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DEA Reports</CardTitle>
                  <CardDescription>Drug Enforcement Administration compliance reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Inventory Reconciliation Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Acquisition & Disposal Register
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Security Compliance Summary
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Complete DEA Inspection Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Joint Commission Reports</CardTitle>
                  <CardDescription>Accreditation and quality measure reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Accreditation Readiness Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Quality Measures Dashboard
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Patient Safety Summary
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Staff Competency Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Schedule</CardTitle>
                <CardDescription>Upcoming regulatory inspections and surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Joint Commission Triennial Survey</h4>
                        <p className="text-sm text-muted-foreground">Full accreditation survey</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">March 15, 2026</p>
                      <p className="text-sm text-muted-foreground">In 451 days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">DEA Biennial Inventory</h4>
                        <p className="text-sm text-muted-foreground">Required inventory count</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">January 15, 2026</p>
                      <p className="text-sm text-muted-foreground">In 392 days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium">State Board Review</h4>
                        <p className="text-sm text-muted-foreground">Annual license renewal inspection</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">February 28, 2025</p>
                      <p className="text-sm text-yellow-600">In 70 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
