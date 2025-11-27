"use client"

import { useState } from "react"
import useSWR from "swr"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, FileText, Calculator, AlertTriangle, CheckCircle, Users, RefreshCw } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DualEligibleData {
  dualEligibleCount: number
  dualEligiblePatients: Array<{
    id: string
    name: string
    dob: string
    insurances: Array<{
      payerName: string
      networkType: string
      policyNumber: string
      priority: number
    }>
  }>
  pendingClaims: Array<{
    id: string
    claimNumber: string
    patientName: string
    payerName: string
    status: string
    totalCharges: number
    submissionDate: string
  }>
}

interface OTPBillingData {
  weeklyBundleRevenue: number
  revenueChange: number
  bundleStats: {
    methadoneFullBundles: { count: number; revenue: number; rateCode: string; hcpcs: string }
    buprenorphineFullBundles: { count: number; revenue: number; rateCode: string; hcpcs: string }
    takehomeBundles: { count: number; revenue: number; rateCodes: string }
  }
  qualifyingServices: {
    medicationAdministration: number
    individualCounseling: number
    groupCounseling: number
    toxicologyTesting: number
  }
  rateCodes: Array<{
    code: string
    description: string
    hcpcs: string
    facilityType: string
    rate: number
  }>
  pendingClaimsCount: number
}

export default function OTPBillingPage() {
  const {
    data: dualData,
    error: dualError,
    isLoading: dualLoading,
    mutate: mutateDual,
  } = useSWR<DualEligibleData>("/api/dual-eligible", fetcher)

  const {
    data: billingData,
    error: billingError,
    isLoading: billingLoading,
    mutate: mutateBilling,
  } = useSWR<OTPBillingData>("/api/otp-billing", fetcher)

  const [processingCrossover, setProcessingCrossover] = useState<string | null>(null)

  const handleProcessCrossover = async (claimId: string) => {
    setProcessingCrossover(claimId)
    try {
      const response = await fetch("/api/dual-eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_crossover", claimId }),
      })
      if (response.ok) {
        mutateDual()
      }
    } catch (err) {
      console.error("Error processing crossover:", err)
    } finally {
      setProcessingCrossover(null)
    }
  }

  const handleRefreshAll = () => {
    mutateDual()
    mutateBilling()
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">OTP Billing & Rate Codes</h1>
              <p className="text-muted-foreground">
                OASAS Bundle billing, rate codes, and APG management for Opioid Treatment Programs
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={billingLoading || dualLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${billingLoading || dualLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Bundle Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${(billingData?.weeklyBundleRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span
                        className={
                          billingData?.revenueChange && billingData.revenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {billingData?.revenueChange && billingData.revenueChange >= 0 ? "+" : ""}
                        {billingData?.revenueChange || 0}%
                      </span>{" "}
                      from last week
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dual Eligibles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dualLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{dualData?.dualEligibleCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Require Medicare first billing</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{billingData?.pendingClaimsCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting processing</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bundle Rate</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">$247.50</div>
                    <p className="text-xs text-muted-foreground">Full bundle (7969/G2067)</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing Tabs */}
          <Tabs defaultValue="bundle" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="bundle">Bundle Billing</TabsTrigger>
              <TabsTrigger value="dual-eligible">Dual Eligible</TabsTrigger>
              <TabsTrigger value="special-cases">Special Cases</TabsTrigger>
              <TabsTrigger value="rate-codes">Rate Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="bundle">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Bundle Status</CardTitle>
                    <CardDescription>Current week bundle billing overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {billingLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Full Bundles (Methadone)</p>
                            <p className="text-sm text-muted-foreground">
                              Rate Code {billingData?.bundleStats?.methadoneFullBundles?.rateCode} /{" "}
                              {billingData?.bundleStats?.methadoneFullBundles?.hcpcs}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {billingData?.bundleStats?.methadoneFullBundles?.count || 0}
                            </p>
                            <p className="text-sm text-green-600">
                              $
                              {(billingData?.bundleStats?.methadoneFullBundles?.revenue || 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Full Bundles (Buprenorphine)</p>
                            <p className="text-sm text-muted-foreground">
                              Rate Code {billingData?.bundleStats?.buprenorphineFullBundles?.rateCode} /{" "}
                              {billingData?.bundleStats?.buprenorphineFullBundles?.hcpcs}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {billingData?.bundleStats?.buprenorphineFullBundles?.count || 0}
                            </p>
                            <p className="text-sm text-green-600">
                              $
                              {(billingData?.bundleStats?.buprenorphineFullBundles?.revenue || 0).toLocaleString(
                                "en-US",
                                { minimumFractionDigits: 2 },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Take-Home Bundles</p>
                            <p className="text-sm text-muted-foreground">
                              Rate Codes {billingData?.bundleStats?.takehomeBundles?.rateCodes}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{billingData?.bundleStats?.takehomeBundles?.count || 0}</p>
                            <p className="text-sm text-green-600">
                              $
                              {(billingData?.bundleStats?.takehomeBundles?.revenue || 0).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Qualifying Services This Week</CardTitle>
                    <CardDescription>Services included in bundle billing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {billingLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-green-50 rounded">
                          <span>Medication Administration</span>
                          <Badge variant="default">
                            {billingData?.qualifyingServices?.medicationAdministration || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-green-50 rounded">
                          <span>Individual Counseling</span>
                          <Badge variant="default">{billingData?.qualifyingServices?.individualCounseling || 0}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-green-50 rounded">
                          <span>Group Counseling</span>
                          <Badge variant="default">{billingData?.qualifyingServices?.groupCounseling || 0}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-green-50 rounded">
                          <span>Toxicology Testing</span>
                          <Badge variant="default">{billingData?.qualifyingServices?.toxicologyTesting || 0}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dual-eligible">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Dual Eligible Medicare/Medicaid Workflow</CardTitle>
                    <CardDescription>
                      Special billing procedures for patients with both Medicare and Medicaid coverage
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => mutateDual()} disabled={dualLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${dualLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Dual Eligible Billing Requirements</h4>
                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                          <li>{"•"} Submit claim to Medicare first using G codes</li>
                          <li>{"•"} Crossover to Medicaid using bundle rate codes</li>
                          <li>{"•"} Submit separate APG claim for non-bundle services with zero-fill Medicare info</li>
                          <li>{"•"} Medicare Advantage plans require manual crossover</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Pending Dual Eligible Claims</h4>
                    {dualLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : !dualData?.pendingClaims || dualData.pendingClaims.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>No pending dual eligible claims</p>
                        <p className="text-sm">All crossovers have been processed</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dualData.pendingClaims.map((claim) => (
                          <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Patient: {claim.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.payerName} - Claim #{claim.claimNumber || "Pending"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Charges: ${claim.totalCharges?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <Badge variant="destructive">Dual Eligible</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessCrossover(claim.id)}
                                disabled={processingCrossover === claim.id}
                              >
                                {processingCrossover === claim.id ? "Processing..." : "Process Crossover"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary/90">Process All Medicare Crossovers</Button>
                    <Button variant="outline">View Dual Eligible Reports</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="special-cases">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Special Billing Scenarios</CardTitle>
                    <CardDescription>
                      FQHC, CCBHC, Guest Dosing, and Skilled Nursing Facility billing rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">FQHC Billing Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-sm space-y-1">
                            <li>{"•"} Cannot bill 1671 rate code + bundle same week</li>
                            <li>{"•"} Can choose weekly 1671 OR bundle billing</li>
                            <li>{"•"} APG opt-out FQHCs: Use 1671 or bundle (not both)</li>
                            <li>{"•"} Dual eligibles: Bill Medicare bundles first</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">CCBHC Billing Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-sm space-y-1">
                            <li>{"•"} Medication administration carved out of 1147 rate</li>
                            <li>{"•"} Can bill bundle for OTP services</li>
                            <li>{"•"} Follow standard dual eligible procedures</li>
                            <li>{"•"} Non-OTP services use CCBHC rate</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Guest Dosing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-sm space-y-1">
                            <li>{"•"} Cannot use bundle billing</li>
                            <li>{"•"} Bill APG for medication administration only</li>
                            <li>{"•"} Requires guest dosing agreement on file</li>
                            <li>{"•"} Home clinic responsible for primary billing</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Skilled Nursing Facility</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-sm space-y-1">
                            <li>{"•"} Bill Medicare Part A during covered stay</li>
                            <li>{"•"} Use APG after Part A exhausted</li>
                            <li>{"•"} Coordinate with SNF billing department</li>
                            <li>{"•"} Document medical necessity for OTP services</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rate-codes">
              <Card>
                <CardHeader>
                  <CardTitle>OASAS OTP Rate Codes Reference</CardTitle>
                  <CardDescription>Current Medicaid rate codes for bundle billing</CardDescription>
                </CardHeader>
                <CardContent>
                  {billingLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Rate Code</th>
                            <th className="text-left p-2">Description</th>
                            <th className="text-left p-2">HCPCS</th>
                            <th className="text-left p-2">Facility Type</th>
                            <th className="text-right p-2">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingData?.rateCodes?.map((rateCode) => (
                            <tr key={`${rateCode.code}-${rateCode.facilityType}`} className="border-b">
                              <td className="p-2 font-mono">{rateCode.code}</td>
                              <td className="p-2">{rateCode.description}</td>
                              <td className="p-2 font-mono">{rateCode.hcpcs}</td>
                              <td className="p-2">{rateCode.facilityType}</td>
                              <td className="p-2 text-right">${rateCode.rate.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
