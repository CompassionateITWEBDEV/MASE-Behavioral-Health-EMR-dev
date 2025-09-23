import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Pill, Search, AlertTriangle, Clock, FileText, ExternalLink } from "lucide-react"

export default function PMPPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">PMP Monitoring Dashboard</h1>
            <p className="text-muted-foreground">
              Michigan Prescription Monitoring Program integration via michigan.pmpaware.net
            </p>
          </div>

          {/* System Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Online</div>
                <p className="text-xs text-muted-foreground">Connected to Michigan MAPS</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Checks</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Require immediate review</p>
              </CardContent>
            </Card>
          </div>

          {/* Patient Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Patient PMP Lookup
              </CardTitle>
              <CardDescription>Search Michigan MAPS database for patient prescription history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90">
                  <Search className="mr-2 h-4 w-4" />
                  Search PMP Database
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Michigan MAPS Portal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent High-Risk Alerts</CardTitle>
              <CardDescription>Patients requiring immediate clinical attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">John D. (DOB: 03/15/1985)</p>
                      <p className="text-sm text-muted-foreground">
                        Multiple opioid prescriptions from 3 different providers in past 30 days
                      </p>
                      <p className="text-xs text-muted-foreground">Last check: 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Critical</Badge>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Maria S. (DOB: 07/22/1978)</p>
                      <p className="text-sm text-muted-foreground">
                        Concurrent benzodiazepine and opioid prescriptions detected
                      </p>
                      <p className="text-xs text-muted-foreground">Last check: 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Critical</Badge>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Robert K. (DOB: 11/08/1992)</p>
                      <p className="text-sm text-muted-foreground">Early refill pattern for controlled substances</p>
                      <p className="text-xs text-muted-foreground">Last check: 6 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Medium Risk</Badge>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Michigan PMP Aware Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Integration Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Endpoint:</span> michigan.pmpaware.net
                    </p>
                    <p>
                      <span className="font-medium">API Version:</span> v2.1
                    </p>
                    <p>
                      <span className="font-medium">Last Sync:</span> 2 minutes ago
                    </p>
                    <p>
                      <span className="font-medium">Data Retention:</span> 7 years
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Compliance Features</h4>
                  <div className="space-y-1 text-sm">
                    <p>✓ HIPAA compliant data transmission</p>
                    <p>✓ Automated risk scoring</p>
                    <p>✓ Real-time alert notifications</p>
                    <p>✓ Audit trail logging</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
