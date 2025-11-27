"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Shield,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building,
  Search,
  Download,
  Eye,
  Lock,
} from "lucide-react"

interface RegulatoryAccess {
  id: string
  inspector_name: string
  agency: string
  access_type: string
  status: string
  granted_at: string
  expires_at: string
  purpose: string
}

interface ComplianceAlert {
  id: string
  type: string
  severity: string
  message: string
  created_at: string
  resolved: boolean
}

const DEFAULT_ROLE = "administrator"

export default function RegulatoryDashboardPage() {
  const [userRole, setUserRole] = useState<string>(DEFAULT_ROLE)
  const [activeAccess, setActiveAccess] = useState<RegulatoryAccess[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchRegulatoryData()
  }, [])

  const fetchRegulatoryData = async () => {
    try {
      try {
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
      } catch (error) {
        console.log("[v0] Auth check failed, using default role")
      }

      // Fetch active regulatory access (for administrators)
      const { data: accessData } = await supabase
        .from("regulatory_access")
        .select("*")
        .eq("status", "active")
        .order("granted_at", { ascending: false })

      if (accessData) {
        setActiveAccess(accessData)
      }

      // Fetch compliance alerts
      const { data: alertsData } = await supabase
        .from("compliance_alerts")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10)

      if (alertsData) {
        setComplianceAlerts(alertsData)
      }
    } catch (error) {
      console.error("Error fetching regulatory data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "revoked":
        return <Badge className="bg-gray-100 text-gray-800">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
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
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Regulatory Compliance Dashboard
              </h1>
              <p className="text-muted-foreground">
                {isRegulatory ? "Authorized Inspector Access" : "Compliance Management & Oversight"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Reports
              </Button>
              {isAdmin && (
                <Button size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Grant Access
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Inspections</p>
                    <p className="text-2xl font-bold text-card-foreground">{activeAccess.length}</p>
                    <p className="text-xs text-blue-600">Currently authorized</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                    <p className="text-xs text-green-600">Above threshold</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{complianceAlerts.length}</p>
                    <p className="text-xs text-orange-600">Require attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
                    <p className="text-2xl font-bold text-card-foreground">15 days</p>
                    <p className="text-xs text-muted-foreground">Since last inspection</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="access">Access Management</TabsTrigger>
              <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Inspections</CardTitle>
                    <CardDescription>Latest regulatory access and inspections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeAccess.length > 0 ? (
                      <div className="space-y-4">
                        {activeAccess.slice(0, 5).map((access) => (
                          <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{access.inspector_name}</p>
                                <p className="text-sm text-muted-foreground">{access.agency}</p>
                              </div>
                            </div>
                            {getStatusBadge(access.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No active inspections</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Alerts</CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {complianceAlerts.length > 0 ? (
                      <div className="space-y-4">
                        {complianceAlerts.slice(0, 5).map((alert) => (
                          <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{alert.type}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No open alerts</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Access Management</CardTitle>
                  <CardDescription>Manage regulatory inspector access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Input placeholder="Search by inspector name or agency..." />
                    </div>
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {activeAccess.map((access) => (
                      <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{access.inspector_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              {access.agency}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(access.status)}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Lock className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Compliance Alerts</CardTitle>
                  <CardDescription>View and manage compliance alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {complianceAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {complianceAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(alert.severity)}
                            <div>
                              <p className="font-medium">{alert.type}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No compliance alerts</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>Generate and download compliance reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">DEA Compliance Report</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Controlled substance handling and documentation
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">OASAS Compliance Report</h4>
                      <p className="text-sm text-muted-foreground mb-4">State regulatory compliance documentation</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">HIPAA Audit Report</h4>
                      <p className="text-sm text-muted-foreground mb-4">Privacy and security compliance audit</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Joint Commission Report</h4>
                      <p className="text-sm text-muted-foreground mb-4">Accreditation compliance documentation</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
