import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, DollarSign, Clock, AlertTriangle, Download, Filter } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                        <p className="text-2xl font-bold text-card-foreground">247</p>
                        <p className="text-xs text-green-600">+12% from last month</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold text-card-foreground">$127K</p>
                        <p className="text-xs text-green-600">+8% from last month</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                        <p className="text-2xl font-bold text-card-foreground">45m</p>
                        <p className="text-xs text-blue-600">+3m from last month</p>
                      </div>
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">High Risk Alerts</p>
                        <p className="text-2xl font-bold text-card-foreground">23</p>
                        <p className="text-xs text-red-600">-3 from last week</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Outcomes</CardTitle>
                    <CardDescription>Treatment success rates by program</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Methadone Program</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Buprenorphine Program</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Counseling Only</span>
                        <span className="text-sm font-medium">74%</span>
                      </div>
                      <Progress value={74} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ASAM Level Distribution</CardTitle>
                    <CardDescription>Current patient care levels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Level 1.0 - Outpatient</span>
                      <Badge variant="outline">89 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Level 2.1 - Intensive Outpatient</span>
                      <Badge variant="outline">67 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Level 3.1 - Residential</span>
                      <Badge variant="outline">34 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Level 3.7 - Medically Monitored</span>
                      <Badge variant="outline">12 patients</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Retention Rates</CardTitle>
                    <CardDescription>Patient retention by treatment duration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">30 Days</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">90 Days</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">6 Months</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">1 Year</span>
                        <span className="text-sm font-medium">52%</span>
                      </div>
                      <Progress value={52} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Trends</CardTitle>
                    <CardDescription>Patient risk levels over time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Suicide Risk - High</span>
                      <Badge variant="destructive">8 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Relapse Risk - High</span>
                      <Badge variant="destructive">15 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Violence Risk - Medium</span>
                      <Badge variant="secondary">23 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Non-compliance Risk</span>
                      <Badge variant="secondary">31 patients</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Payer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medicaid</span>
                      <span className="font-medium">$89,340</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medicare</span>
                      <span className="font-medium">$23,120</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Private Insurance</span>
                      <span className="font-medium">$12,890</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Self-Pay</span>
                      <span className="font-medium">$2,100</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bundle vs APG Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">OTP Bundle Claims</span>
                      <span className="font-medium">$67,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">APG Claims</span>
                      <span className="font-medium">$34,230</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Take-Home Bundles</span>
                      <span className="font-medium">$18,670</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Claims Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Paid Claims</span>
                      <Badge variant="default">234</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Claims</span>
                      <Badge variant="secondary">23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Denied Claims</span>
                      <Badge variant="destructive">8</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Metrics</CardTitle>
                    <CardDescription>Performance indicators and benchmarks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Documentation Completeness</span>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Treatment Plan Adherence</span>
                        <span className="text-sm font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Patient Satisfaction</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Performance</CardTitle>
                    <CardDescription>Individual provider metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Smith - Caseload</span>
                      <Badge variant="outline">45 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Johnson - Success Rate</span>
                      <Badge variant="default">94%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Williams - Documentation</span>
                      <Badge variant="default">98%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Compliance</CardTitle>
                    <CardDescription>Adherence to federal and state requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DEA Compliance</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SAMHSA Requirements</span>
                      <Badge variant="default">98%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">State Licensing</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">HIPAA Compliance</span>
                      <Badge variant="default">99%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Readiness</CardTitle>
                    <CardDescription>Documentation and process compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Required Documentation</span>
                        <span className="text-sm font-medium">97%</span>
                      </div>
                      <Progress value={97} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Policy Adherence</span>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
