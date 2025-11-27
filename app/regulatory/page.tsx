"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Building, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegulatoryPortalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Regulatory Portal Access</h1>
                <p className="text-slate-200">Select your regulatory organization to access the appropriate portal</p>
              </div>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-slate-800 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to EMR
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* DEA Portal */}
          <Card className="border-blue-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">DEA Compliance Portal</div>
                  <div className="text-sm text-muted-foreground font-normal">Drug Enforcement Administration</div>
                </div>
              </CardTitle>
              <CardDescription className="text-base">
                Access controlled substance inventory, acquisition records, security compliance, and DEA inspection
                documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Compliance Score</span>
                  <Badge className="bg-yellow-100 text-yellow-800">83%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Violations</span>
                  <Badge className="bg-red-100 text-red-800">1 Critical</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Inspection</span>
                  <span className="text-sm">March 2024</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link href="/regulatory/dea">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access DEA Portal
                  </Button>
                </Link>
                <Link href="/auth/regulatory-login">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Shield className="h-4 w-4 mr-2" />
                    Inspector Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Joint Commission Portal */}
          <Card className="border-emerald-200 hover:shadow-lg transition-all duration-200 hover:border-emerald-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Joint Commission Portal</div>
                  <div className="text-sm text-muted-foreground font-normal">Healthcare Accreditation</div>
                </div>
              </CardTitle>
              <CardDescription className="text-base">
                Review accreditation standards, quality measures, patient safety indicators, and survey preparation
                materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standards Compliance</span>
                  <Badge className="bg-emerald-100 text-emerald-800">78%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standards Not Met</span>
                  <Badge className="bg-red-100 text-red-800">1 Standard</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Next Survey</span>
                  <span className="text-sm">March 2026</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link href="/regulatory/joint-commission">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access JC Portal
                  </Button>
                </Link>
                <Link href="/auth/regulatory-login">
                  <Button variant="outline" className="w-full bg-transparent">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Surveyor Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-slate-600" />
              <span>Regulatory Access Information</span>
            </CardTitle>
            <CardDescription>
              Important information for regulatory personnel and facility administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">For Inspectors & Surveyors</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{'• Use the "Inspector Login" or "Surveyor Login" buttons above'}</li>
                  <li>• Temporary access credentials are provided by facility administrators</li>
                  <li>• All access is logged and monitored for compliance purposes</li>
                  <li>• Access expires automatically based on inspection schedule</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Facility Staff</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access portals directly using the main portal buttons</li>
                  <li>• Generate compliance reports and documentation</li>
                  <li>• Monitor real-time compliance status and alerts</li>
                  <li>• Manage inspector access from the Settings page</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Need Help?</h4>
                  <p className="text-sm text-muted-foreground">Contact your system administrator for access issues</p>
                </div>
                <Link href="/regulatory/dashboard">
                  <Button variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
