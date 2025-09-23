"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, UserCheck, FileCheck, AlertTriangle } from "lucide-react"
import { NPIVerificationDashboard } from "@/components/npi-verification-dashboard"
import { LicenseVerificationDashboard } from "@/components/license-verification-dashboard"
import { ProviderCredentialManagement } from "@/components/provider-credential-management"

export default function NPIVerificationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 ml-64 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Provider Verification & Licensing</h1>
              <p className="text-muted-foreground">
                NPI verification, license tracking, and provider credential management
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">100%</span> verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NPI Verified</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">22</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-yellow-600">2</span> pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Licenses Expiring</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Next 90 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">Excellent</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="npi-verification" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="npi-verification" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  NPI Verification
                </TabsTrigger>
                <TabsTrigger value="license-tracking" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  License Tracking
                </TabsTrigger>
                <TabsTrigger value="credential-management" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Credential Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="npi-verification">
                <NPIVerificationDashboard />
              </TabsContent>

              <TabsContent value="license-tracking">
                <LicenseVerificationDashboard />
              </TabsContent>

              <TabsContent value="credential-management">
                <ProviderCredentialManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
