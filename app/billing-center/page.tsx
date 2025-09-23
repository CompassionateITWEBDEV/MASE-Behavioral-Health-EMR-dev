"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, FileCheck, TrendingUp, Building2, AlertTriangle, Package } from "lucide-react"
import { BillingCenterOverview } from "@/components/billing-center-overview"
import { ClaimsManagement } from "@/components/claims-management"
import { BillingConfiguration } from "@/components/billing-configuration"

export default function BillingCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 ml-64 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Billing Center</h1>
              <p className="text-muted-foreground">
                Comprehensive billing management, claims processing, and revenue cycle management
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$127,450</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Claims Submitted</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-600">89%</span> approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Claims</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-yellow-600">$18,450</span> pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+2.1%</span> improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="claims" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Claims Management
                </TabsTrigger>
                <TabsTrigger value="payers" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Payer Management
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <BillingCenterOverview />
              </TabsContent>

              <TabsContent value="claims">
                <ClaimsManagement />
              </TabsContent>

              <TabsContent value="payers">
                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Payer Management</CardTitle>
                    <CardDescription>Manage insurance payers and contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Payer Management</h3>
                      <p className="text-muted-foreground mb-4">
                        Access the full insurance payer management system from the Insurance menu.
                      </p>
                      <a href="/insurance" className="text-primary hover:underline">
                        Go to Insurance Management →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuration">
                <BillingConfiguration />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
