"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield,
  FileText,
  AlertTriangle,
  Building,
  Users,
  BarChart3,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

const supabase = createBrowserClient()

export default function DEAPortalPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [facilityInfo, setFacilityInfo] = useState<any>(null)
  const [diversionReports, setDiversionReports] = useState<any[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<any[]>([])
  const [scanLogs, setScanLogs] = useState<any[]>([])
  const [inventoryRecords, setInventoryRecords] = useState<any[]>([])
  const [dispensingLogs, setDispensingLogs] = useState<any[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState("30")
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    overallCompliance: 0,
    activeViolations: 0,
    pendingItems: 0,
    daysSinceInspection: 0,
    totalDispensed: 0,
    diversionAlerts: 0,
  })

  useEffect(() => {
    fetchDEAData()
  }, [selectedDateRange])

  const fetchDEAData = async () => {
    setIsLoading(true)
    try {
      // Fetch facility/organization info
      const { data: orgData } = await supabase.from("organizations").select("*").limit(1).single()

      // Fetch DEA diversion reports (synced from diversion control)
      const { data: reportsData } = await supabase
        .from("dea_diversion_reports")
        .select("*")
        .order("reported_at", { ascending: false })
        .limit(100)

      // Fetch compliance alerts from take-home system
      const { data: alertsData } = await supabase
        .from("takehome_compliance_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      // Fetch scan verification logs
      const { data: scansData } = await supabase
        .from("takehome_scan_logs")
        .select("*")
        .order("scan_timestamp", { ascending: false })
        .limit(100)

      // Fetch dispensing logs
      const { data: dosingData } = await supabase
        .from("dosing_log")
        .select("*")
        .order("dose_time", { ascending: false })
        .limit(100)

      // Fetch inventory records
      const { data: inventoryData } = await supabase
        .from("medication_inventory")
        .select("*")
        .order("created_at", { ascending: false })

      setFacilityInfo(
        orgData || {
          name: "MASE Behavioral Health Center",
          id: "ORG-001",
        },
      )
      setDiversionReports(reportsData || [])
      setComplianceAlerts(alertsData || [])
      setScanLogs(scansData || [])
      setDispensingLogs(dosingData || [])
      setInventoryRecords(inventoryData || [])

      // Calculate stats from real data
      const openAlerts = (alertsData || []).filter((a: any) => a.status === "open").length
      const totalScans = (scansData || []).length
      const successfulScans = (scansData || []).filter((s: any) => s.verification_status === "success").length
      const complianceRate = totalScans > 0 ? Math.round((successfulScans / totalScans) * 100) : 100
      const totalDispensed = (dosingData || []).reduce((sum: number, d: any) => sum + (d.dose_mg || 0), 0)

      setStats({
        overallCompliance: complianceRate,
        activeViolations: openAlerts,
        pendingItems: (reportsData || []).filter((r: any) => r.sync_status === "pending").length,
        daysSinceInspection: 847, // Would come from inspection records
        totalDispensed: totalDispensed,
        diversionAlerts: (alertsData || []).filter(
          (a: any) => a.alert_type === "location_violation" || a.alert_type === "biometric_failure",
        ).length,
      })
    } catch (error) {
      console.error("Error fetching DEA data:", error)
      toast.error("Failed to load DEA compliance data")
    } finally {
      setIsLoading(false)
    }
  }

  const generateComplianceReport = async () => {
    toast.success("Generating DEA compliance report...")
    // In production, this would generate a PDF report
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "complete":
      case "success":
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "violation":
      case "failed":
      case "open":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
      case "complete":
      case "success":
      case "synced":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
      case "warning":
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "violation":
      case "failed":
      case "open":
        return <Badge className="bg-red-100 text-red-800">Violation</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-blue-900 text-white p-6">
          <Skeleton className="h-12 w-64 bg-blue-800" />
        </div>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-blue-800 bg-transparent"
                onClick={fetchDEAData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="text-right">
                <p className="text-sm text-blue-200">Facility</p>
                <p className="font-medium">{facilityInfo?.name || "MASE EMR"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Compliance Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.overallCompliance >= 90 ? "text-green-600" : stats.overallCompliance >= 70 ? "text-yellow-600" : "text-red-600"}`}
              >
                {stats.overallCompliance}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.activeViolations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diversion Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.diversionAlerts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dispensed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDispensed.toLocaleString()} mg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scan Verifications</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scanLogs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="diversion" className="space-y-4">
          <TabsList className="flex overflow-x-auto">
            <TabsTrigger value="diversion">Diversion Reports</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Alerts</TabsTrigger>
            <TabsTrigger value="scans">Verification Scans</TabsTrigger>
            <TabsTrigger value="dispensing">Dispensing Logs</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="diversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diversion Control Reports</CardTitle>
                <CardDescription>Events synced from the Take-Home Diversion Control System</CardDescription>
              </CardHeader>
              <CardContent>
                {diversionReports.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Diversion Reports</p>
                    <p className="text-muted-foreground">
                      Reports will appear when events are logged in the diversion control system
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Sync Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diversionReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{new Date(report.reported_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.event_type?.replace(/_/g, " ")}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{JSON.stringify(report.event_data)}</TableCell>
                          <TableCell>{getStatusBadge(report.sync_status)}</TableCell>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Active compliance issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium">All Clear</p>
                    <p className="text-muted-foreground">No compliance alerts at this time</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Alert Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complianceAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{alert.alert_type?.replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                alert.severity === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : alert.severity === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{alert.alert_description}</TableCell>
                          <TableCell>{getStatusBadge(alert.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Verification Scans</CardTitle>
                <CardDescription>Take-home medication verification records</CardDescription>
              </CardHeader>
              <CardContent>
                {scanLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Scan Records</p>
                    <p className="text-muted-foreground">Verification scans will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Location Check</TableHead>
                        <TableHead>Time Window</TableHead>
                        <TableHead>Biometric</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanLogs.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell>{new Date(scan.scan_timestamp).toLocaleString()}</TableCell>
                          <TableCell>{scan.patient_id?.substring(0, 8)}...</TableCell>
                          <TableCell>
                            {scan.is_within_geofence ? (
                              <Badge className="bg-green-100 text-green-800">Pass</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Fail</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.is_within_dosing_window ? (
                              <Badge className="bg-green-100 text-green-800">Pass</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Fail</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.biometric_verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                {(scan.biometric_confidence * 100).toFixed(0)}%
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Fail</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.verification_status === "success" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dispensing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispensing Logs</CardTitle>
                <CardDescription>Controlled substance dispensing records</CardDescription>
              </CardHeader>
              <CardContent>
                {dispensingLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Dispensing Records</p>
                    <p className="text-muted-foreground">Dispensing logs will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dose (mg)</TableHead>
                        <TableHead>Dose (ml)</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Witness</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispensingLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.dose_time).toLocaleString()}</TableCell>
                          <TableCell>{log.patient_id?.substring(0, 8)}...</TableCell>
                          <TableCell>{log.medication || "Methadone"}</TableCell>
                          <TableCell>{log.dose_mg}</TableCell>
                          <TableCell>{log.dose_ml}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.dose_type || "Regular"}</Badge>
                          </TableCell>
                          <TableCell>{log.witness_id ? "Yes" : "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Controlled Substance Inventory</CardTitle>
                <CardDescription>Current inventory levels and records</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Inventory Records</p>
                    <p className="text-muted-foreground">Inventory records will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Lot Number</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.medication_name || "Methadone HCl"}</TableCell>
                          <TableCell>{record.lot_number}</TableCell>
                          <TableCell>{record.quantity}</TableCell>
                          <TableCell>{record.unit || "mL"}</TableCell>
                          <TableCell>{record.expiration_date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.status || "Active"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Compliance Reports</CardTitle>
                <CardDescription>Generate official DEA compliance documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer hover:bg-muted/50" onClick={generateComplianceReport}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">Full Compliance Report</p>
                          <p className="text-sm text-muted-foreground">Complete DEA inspection-ready report</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toast.success("Generating inventory report...")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <BarChart3 className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">Inventory Report</p>
                          <p className="text-sm text-muted-foreground">Biennial inventory documentation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toast.success("Generating diversion report...")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                        <div>
                          <p className="font-medium">Diversion Report</p>
                          <p className="text-sm text-muted-foreground">Take-home compliance and violations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toast.success("Generating dispensing report...")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Users className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="font-medium">Dispensing Summary</p>
                          <p className="text-sm text-muted-foreground">Patient dispensing aggregate data</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
