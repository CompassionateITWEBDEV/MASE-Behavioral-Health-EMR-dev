"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DollarSign, Users, FileText, Download, Activity, Shield, CheckCircle, AlertTriangle } from "lucide-react"

interface ProductivityMetric {
  providerId: string
  providerName: string
  patientsSeenToday: number
  patientsSeenWeek: number
  assessmentsCompleted: number
  prescriptionsWritten: number
  billableUnits: number
  revenueGenerated: number
}

interface ComplianceMetric {
  category: string
  compliant: number
  nonCompliant: number
  percentage: number
}

export function AdvancedReportingDashboard() {
  const [productivityData, setProductivityData] = useState<ProductivityMetric[]>([])
  const [complianceData, setComplianceData] = useState<ComplianceMetric[]>([])
  const [dateRange, setDateRange] = useState("week")
  const [selectedProvider, setSelectedProvider] = useState("all")

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProductivity: ProductivityMetric[] = [
      {
        providerId: "1",
        providerName: "Dr. Sarah Wilson",
        patientsSeenToday: 12,
        patientsSeenWeek: 58,
        assessmentsCompleted: 24,
        prescriptionsWritten: 18,
        billableUnits: 45.5,
        revenueGenerated: 4550.0,
      },
      {
        providerId: "2",
        providerName: "Dr. Michael Chen",
        patientsSeenToday: 10,
        patientsSeenWeek: 52,
        assessmentsCompleted: 20,
        prescriptionsWritten: 15,
        billableUnits: 42.0,
        revenueGenerated: 4200.0,
      },
      {
        providerId: "3",
        providerName: "Dr. Emily Rodriguez",
        patientsSeenToday: 14,
        patientsSeenWeek: 65,
        assessmentsCompleted: 28,
        prescriptionsWritten: 22,
        billableUnits: 52.5,
        revenueGenerated: 5250.0,
      },
    ]

    const mockCompliance: ComplianceMetric[] = [
      { category: "Consent Forms", compliant: 95, nonCompliant: 5, percentage: 95 },
      { category: "COWS Assessments", compliant: 88, nonCompliant: 12, percentage: 88 },
      { category: "Documentation", compliant: 92, nonCompliant: 8, percentage: 92 },
      { category: "Prescription Monitoring", compliant: 97, nonCompliant: 3, percentage: 97 },
      { category: "Lab Results Review", compliant: 85, nonCompliant: 15, percentage: 85 },
    ]

    setProductivityData(mockProductivity)
    setComplianceData(mockCompliance)
  }, [])

  // Chart data
  const weeklyProductivityData = [
    { day: "Mon", patients: 45, revenue: 4500 },
    { day: "Tue", patients: 52, revenue: 5200 },
    { day: "Wed", patients: 48, revenue: 4800 },
    { day: "Thu", patients: 55, revenue: 5500 },
    { day: "Fri", patients: 50, revenue: 5000 },
    { day: "Sat", patients: 25, revenue: 2500 },
    { day: "Sun", patients: 15, revenue: 1500 },
  ]

  const complianceChartData = complianceData.map((item) => ({
    name: item.category,
    compliant: item.compliant,
    nonCompliant: item.nonCompliant,
  }))

  const revenueByServiceData = [
    { name: "Individual Therapy", value: 45, revenue: 12500 },
    { name: "Group Therapy", value: 25, revenue: 6250 },
    { name: "Medication Management", value: 20, revenue: 8000 },
    { name: "Assessments", value: 10, revenue: 3500 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const totalPatients = productivityData.reduce((sum, p) => sum + p.patientsSeenWeek, 0)
  const totalRevenue = productivityData.reduce((sum, p) => sum + p.revenueGenerated, 0)
  const totalAssessments = productivityData.reduce((sum, p) => sum + p.assessmentsCompleted, 0)
  const avgCompliance = Math.round(complianceData.reduce((sum, c) => sum + c.percentage, 0) / complianceData.length)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="1">Dr. Sarah Wilson</SelectItem>
                <SelectItem value="2">Dr. Michael Chen</SelectItem>
                <SelectItem value="3">Dr. Emily Rodriguez</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">Completed this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompliance}%</div>
            <p className="text-xs text-muted-foreground">Average across all metrics</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productivity">Productivity Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Patient Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProductivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyProductivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Provider Productivity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Patients Today</TableHead>
                    <TableHead>Patients This Week</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Prescriptions</TableHead>
                    <TableHead>Billable Units</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productivityData.map((provider) => (
                    <TableRow key={provider.providerId}>
                      <TableCell className="font-medium">{provider.providerName}</TableCell>
                      <TableCell>{provider.patientsSeenToday}</TableCell>
                      <TableCell>{provider.patientsSeenWeek}</TableCell>
                      <TableCell>{provider.assessmentsCompleted}</TableCell>
                      <TableCell>{provider.prescriptionsWritten}</TableCell>
                      <TableCell>{provider.billableUnits}</TableCell>
                      <TableCell>${provider.revenueGenerated.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByServiceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByServiceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gross Revenue</span>
                    <span className="text-lg font-bold">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Insurance Collections</span>
                    <span className="text-lg font-bold">${(totalRevenue * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Patient Payments</span>
                    <span className="text-lg font-bold">${(totalRevenue * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Net Revenue</span>
                    <span className="text-xl font-bold text-green-600">${(totalRevenue * 0.92).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Billing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-gray-600">Claims Acceptance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">18 days</div>
                  <div className="text-sm text-gray-600">Average Collection Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$2,450</div>
                  <div className="text-sm text-gray-600">Average Claim Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="compliant" stackId="a" fill="#22c55e" />
                    <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.percentage >= 90 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <Badge
                        className={
                          item.percentage >= 95
                            ? "bg-green-100 text-green-800"
                            : item.percentage >= 90
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {item.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">15 lab results pending review</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">12 COWS assessments overdue</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Complete
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">8 consent forms need signatures</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Follow Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-gray-600">Total Actions Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-600">Security Violations</div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-01-16 14:32:15</TableCell>
                    <TableCell>Dr. Sarah Wilson</TableCell>
                    <TableCell>Updated patient record</TableCell>
                    <TableCell>John Smith</TableCell>
                    <TableCell>192.168.1.45</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-16 14:28:42</TableCell>
                    <TableCell>Dr. Michael Chen</TableCell>
                    <TableCell>Created prescription</TableCell>
                    <TableCell>Sarah Johnson</TableCell>
                    <TableCell>192.168.1.67</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-16 14:25:18</TableCell>
                    <TableCell>Nurse Rodriguez</TableCell>
                    <TableCell>Recorded vital signs</TableCell>
                    <TableCell>Mike Davis</TableCell>
                    <TableCell>192.168.1.23</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Readiness Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All user access logs maintained</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Patient consent forms up to date</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Clinical documentation standards met</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Staff training records need update</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
