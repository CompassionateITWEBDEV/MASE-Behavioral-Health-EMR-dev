"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Lock,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

export function ComplianceAuditDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")

  const complianceMetrics = {
    overall: 94,
    hipaa: 98,
    documentation: 91,
    billing: 96,
    quality: 89,
  }

  const auditAlerts = [
    {
      id: "1",
      type: "critical",
      title: "Missing Documentation",
      description: "3 SOAP notes require completion within 24 hours",
      count: 3,
      dueDate: "Today",
    },
    {
      id: "2",
      type: "warning",
      title: "Billing Compliance",
      description: "Prior authorization needed for 5 upcoming sessions",
      count: 5,
      dueDate: "Tomorrow",
    },
    {
      id: "3",
      type: "info",
      title: "Quality Review",
      description: "Monthly quality assurance review due",
      count: 1,
      dueDate: "This Week",
    },
  ]

  const recentAudits = [
    {
      id: "1",
      type: "HIPAA Security Assessment",
      date: "2024-01-15",
      status: "passed",
      score: 98,
      auditor: "Internal Compliance Team",
    },
    {
      id: "2",
      type: "Documentation Quality Review",
      date: "2024-01-10",
      status: "passed",
      score: 91,
      auditor: "Dr. Sarah Wilson",
    },
    {
      id: "3",
      type: "Billing Compliance Audit",
      date: "2024-01-05",
      status: "action-required",
      score: 87,
      auditor: "External Auditor",
    },
  ]

  const securityEvents = [
    {
      id: "1",
      event: "Successful Login",
      user: "Dr. Smith",
      timestamp: "2024-01-15 14:30:22",
      ip: "192.168.1.100",
      status: "normal",
    },
    {
      id: "2",
      event: "Failed Login Attempt",
      user: "Unknown",
      timestamp: "2024-01-15 14:25:15",
      ip: "203.0.113.45",
      status: "suspicious",
    },
    {
      id: "3",
      event: "Patient Record Access",
      user: "Lisa Brown (RN)",
      timestamp: "2024-01-15 14:20:10",
      ip: "192.168.1.105",
      status: "normal",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
            Compliance & Audit Management
          </h1>
          <p className="text-muted-foreground mt-2">Monitor regulatory compliance, security, and quality assurance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" />
            Generate Audit
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{complianceMetrics.overall}%</div>
            <Progress value={complianceMetrics.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">HIPAA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceMetrics.hipaa}%</div>
            <Progress value={complianceMetrics.hipaa} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{complianceMetrics.documentation}%</div>
            <Progress value={complianceMetrics.documentation} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billing Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{complianceMetrics.billing}%</div>
            <Progress value={complianceMetrics.billing} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Assurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceMetrics.quality}%</div>
            <Progress value={complianceMetrics.quality} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Active Compliance Alerts
          </CardTitle>
          <CardDescription>Items requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      alert.type === "critical"
                        ? "bg-red-500"
                        : alert.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      alert.type === "critical" ? "destructive" : alert.type === "warning" ? "secondary" : "outline"
                    }
                  >
                    {alert.count} items
                  </Badge>
                  <span className="text-sm text-muted-foreground">Due: {alert.dueDate}</span>
                  <Button size="sm">Resolve</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="audits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="security">Security Logs</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits & Assessments</CardTitle>
              <CardDescription>Compliance audit history and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          audit.status === "passed"
                            ? "bg-green-100 text-green-600"
                            : audit.status === "action-required"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {audit.status === "passed" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : audit.status === "action-required" ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{audit.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.date} • {audit.auditor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{audit.score}%</p>
                        <Badge
                          variant={
                            audit.status === "passed"
                              ? "default"
                              : audit.status === "action-required"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {audit.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Security Event Log
              </CardTitle>
              <CardDescription>Real-time security monitoring and access logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          event.status === "normal"
                            ? "bg-green-500"
                            : event.status === "suspicious"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">
                          User: {event.user} • IP: {event.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{event.timestamp}</p>
                      <Badge
                        variant={
                          event.status === "normal"
                            ? "default"
                            : event.status === "suspicious"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Quality Metrics Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documentation Completeness</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Treatment Plan Adherence</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Patient Satisfaction</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clinical Outcomes</span>
                    <span className="font-medium">89%</span>
                  </div>
                  <Progress value={89} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>Individual compliance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Dr. Smith (LMSW)", score: 96 },
                    { name: "Lisa Brown (RN)", score: 94 },
                    { name: "Dr. Wilson (MD)", score: 98 },
                    { name: "Sarah Johnson (Peer Coach)", score: 91 },
                  ].map((provider, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{provider.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={provider.score} className="w-20" />
                        <span className="text-sm font-medium w-8">{provider.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate and download compliance documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "HIPAA Compliance Report", description: "Monthly HIPAA security assessment", icon: Shield },
                  {
                    title: "Quality Assurance Report",
                    description: "Clinical quality metrics and outcomes",
                    icon: TrendingUp,
                  },
                  {
                    title: "Audit Trail Report",
                    description: "Complete system access and activity log",
                    icon: FileText,
                  },
                  {
                    title: "Billing Compliance Report",
                    description: "Insurance and billing compliance status",
                    icon: Calendar,
                  },
                  { title: "Security Assessment", description: "Comprehensive security evaluation", icon: Lock },
                  {
                    title: "Provider Performance Report",
                    description: "Individual provider compliance metrics",
                    icon: Users,
                  },
                ].map((report, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <report.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{report.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
