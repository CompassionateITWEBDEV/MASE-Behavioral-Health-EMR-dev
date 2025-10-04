"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, FileCheck, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react"

export function ClearinghouseDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Submitted Today</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> from yesterday
            </p>
            <Progress value={94} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> vs last week
            </p>
            <Progress value={97} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ERA Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-muted-foreground">12 ERAs processed today</p>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.5s</span> improvement
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Clearinghouse Connection Status</CardTitle>
          <CardDescription>Real-time status of clearinghouse connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-medium">Change Healthcare</p>
                  <p className="text-sm text-muted-foreground">Primary clearinghouse</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="default">Connected</Badge>
                <p className="text-xs text-muted-foreground mt-1">Last ping: 30s ago</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">837 Claims</span>
                </div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-xs text-muted-foreground">Submission enabled</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">835 ERA</span>
                </div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-xs text-muted-foreground">Auto-download enabled</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">270/271 Eligibility</span>
                </div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-xs text-muted-foreground">Real-time enabled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent EDI Transactions</CardTitle>
            <CardDescription>Latest clearinghouse activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">837 Batch Submitted</p>
                  <p className="text-sm text-muted-foreground">Batch #B2024-1208-001 • 23 claims</p>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">835 ERA Received</p>
                  <p className="text-sm text-muted-foreground">Blue Cross • $4,230.50</p>
                </div>
                <span className="text-xs text-muted-foreground">15 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">997 Acknowledgment</p>
                  <p className="text-sm text-muted-foreground">Batch accepted • No errors</p>
                </div>
                <span className="text-xs text-muted-foreground">18 min ago</span>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Activity className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">270 Eligibility Check</p>
                  <p className="text-sm text-muted-foreground">Patient #12345 • Active coverage</p>
                </div>
                <span className="text-xs text-muted-foreground">32 min ago</span>
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
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Pending Acknowledgments</p>
                  <p className="text-sm text-yellow-700">2 batches awaiting 997 response</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-red-200 bg-red-50">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Rejected Claims</p>
                  <p className="text-sm text-red-700">3 claims need correction and resubmission</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-blue-200 bg-blue-50">
                <DollarSign className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Unposted ERAs</p>
                  <p className="text-sm text-blue-700">5 ERAs ready for payment posting</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg border-green-200 bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Performance Improvement</p>
                  <p className="text-sm text-green-700">Clean claim rate up 5% this month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Metrics</CardTitle>
          <CardDescription>Clearinghouse transaction statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Claims Submitted</p>
              <p className="text-3xl font-bold">342</p>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Clean Claim Rate</p>
              <p className="text-3xl font-bold">94.2%</p>
              <p className="text-xs text-green-600 mt-1">+3.1% improvement</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">ERAs Processed</p>
              <p className="text-3xl font-bold">87</p>
              <p className="text-xs text-muted-foreground mt-1">$127,450 total</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Avg Days to Payment</p>
              <p className="text-3xl font-bold">14.2</p>
              <p className="text-xs text-green-600 mt-1">-2.3 days faster</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
