import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PatientOverview } from "@/components/patient-overview"
import { AICoachingPanel } from "@/components/ai-coaching-panel"
import { ComplianceTracker } from "@/components/compliance-tracker"
import { QuickActions } from "@/components/quick-actions"
import { RecentActivity } from "@/components/recent-activity"
import { ProviderMetrics } from "@/components/provider-metrics"
import { StaffDashboardWidget } from "@/components/staff-dashboard-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, FileCheck, ArrowRight, Shield, Building, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PatientOverview />
              <RecentActivity />
            </div>
            <div className="space-y-6">
              <AICoachingPanel />
              <ComplianceTracker />
              <StaffDashboardWidget />
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Regulatory Compliance
                  </CardTitle>
                  <CardDescription>DEA and Joint Commission portal access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Compliance</span>
                      <Badge className="bg-yellow-100 text-yellow-800">81%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical Issues</span>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />2
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Inspectors</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link href="/regulatory/dea">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Shield className="mr-2 h-4 w-4 text-blue-600" />
                        DEA Portal
                      </Button>
                    </Link>
                    <Link href="/regulatory/joint-commission">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <FileCheck className="mr-2 h-4 w-4 text-emerald-600" />
                        Joint Commission
                      </Button>
                    </Link>
                  </div>
                  <Link href="/regulatory">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Building className="mr-2 h-4 w-4" />
                      All Regulatory Portals
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billing Summary
                  </CardTitle>
                  <CardDescription>Insurance and authorization status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Revenue</span>
                      <span className="font-medium">$127,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Claims</span>
                      <Badge variant="secondary">23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Prior Auths</span>
                      <Badge variant="outline">12 active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PMP Alerts</span>
                      <Badge variant="destructive">3 high risk</Badge>
                    </div>
                  </div>
                  <Link href="/billing">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <FileCheck className="mr-2 h-4 w-4" />
                      View Billing Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions />
            <ProviderMetrics />
          </div>
        </main>
      </div>
    </div>
  )
}
