"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, FileCheck, CreditCard, AlertTriangle, Calendar, Users, Building2 } from "lucide-react"

export function BillingCenterOverview() {
  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">$127,450</div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <Progress value={78} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">78% of monthly target ($163,000)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Claims Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Submitted:</span>
                <Badge variant="default">342</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Approved:</span>
                <Badge variant="default">304</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Denied:</span>
                <Badge variant="destructive">15</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending:</span>
                <Badge variant="secondary">23</Badge>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Approval Rate:</span>
                <span className="font-medium text-green-600">89.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Outstanding A/R
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">$34,280</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>0-30 days:</span>
                <span className="font-medium">$18,450</span>
              </div>
              <div className="flex justify-between">
                <span>31-60 days:</span>
                <span className="font-medium">$9,230</span>
              </div>
              <div className="flex justify-between">
                <span>61-90 days:</span>
                <span className="font-medium">$4,100</span>
              </div>
              <div className="flex justify-between">
                <span>90+ days:</span>
                <span className="font-medium text-red-600">$2,500</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims Activity</CardTitle>
            <CardDescription>Latest claim submissions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Sarah Johnson - IOP Services</p>
                  <p className="text-sm text-muted-foreground">Blue Cross Blue Shield • Claim #BC2024001</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm text-muted-foreground">$1,247.50</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Michael Chen - MAT Services</p>
                  <p className="text-sm text-muted-foreground">Aetna • Claim #AET2024089</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Pending</Badge>
                  <p className="text-sm text-muted-foreground">$892.00</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Emily Rodriguez - Group Therapy</p>
                  <p className="text-sm text-muted-foreground">UnitedHealthcare • Claim #UHC2024156</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">Denied</Badge>
                  <p className="text-sm text-muted-foreground">$345.00</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Robert Kim - Psychiatric Evaluation</p>
                  <p className="text-sm text-muted-foreground">Cigna • Claim #CIG2024078</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm text-muted-foreground">$450.00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Action Items</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg border-red-200 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">3 Claims Require Appeal</p>
                  <p className="text-sm text-red-700">Denied claims with appeal deadline approaching</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Review Appeals
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                <Calendar className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Prior Auths Expiring</p>
                  <p className="text-sm text-yellow-700">5 prior authorizations expire within 30 days</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Review Prior Auths
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-blue-200 bg-blue-50">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Insurance Verification Needed</p>
                  <p className="text-sm text-blue-700">8 patients need eligibility verification</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Verify Coverage
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-green-200 bg-green-50">
                <Building2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">New Payer Contract</p>
                  <p className="text-sm text-green-700">Molina Healthcare contract now active</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payer Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Payer Performance</CardTitle>
          <CardDescription>Revenue and approval rates by insurance payer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Blue Cross Blue Shield</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">$45,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claims:</span>
                    <span>127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="text-green-600">94%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Aetna</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">$32,180</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claims:</span>
                    <span>89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="text-green-600">91%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-red-500" />
                  <span className="font-medium">UnitedHealthcare</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">$28,940</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claims:</span>
                    <span>76</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="text-yellow-600">87%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Medicaid</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">$21,100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claims:</span>
                    <span>50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Rate:</span>
                    <span className="text-green-600">96%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
