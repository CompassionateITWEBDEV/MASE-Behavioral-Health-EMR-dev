"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, DollarSign, Clock, AlertTriangle, Download, Filter, RefreshCw } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount.toFixed(0)}`
}

export default function AnalyticsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/analytics", fetcher)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
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

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive">Failed to load analytics data. Please try again.</p>
              </CardContent>
            </Card>
          )}

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
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                            <p className="text-2xl font-bold text-card-foreground">
                              {data?.overview?.totalPatients || 0}
                            </p>
                            <p className="text-xs text-green-600">
                              +{data?.overview?.patientGrowth || 0}% from last month
                            </p>
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
                            <p className="text-2xl font-bold text-card-foreground">
                              {formatCurrency(data?.overview?.totalRevenue || 0)}
                            </p>
                            <p className="text-xs text-green-600">From paid claims</p>
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
                            <p className="text-2xl font-bold text-card-foreground">
                              {data?.overview?.avgSessionTime || 0}m
                            </p>
                            <p className="text-xs text-blue-600">Per appointment</p>
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
                            <p className="text-2xl font-bold text-card-foreground">
                              {data?.overview?.highRiskAlerts || 0}
                            </p>
                            <p className="text-xs text-red-600">Unacknowledged</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Outcomes</CardTitle>
                    <CardDescription>Treatment success rates by program</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Methadone Program</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.patientOutcomes?.methadone || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.patientOutcomes?.methadone || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Buprenorphine Program</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.patientOutcomes?.buprenorphine || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.patientOutcomes?.buprenorphine || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Counseling Only</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.patientOutcomes?.counseling || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.patientOutcomes?.counseling || 0} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ASAM Level Distribution</CardTitle>
                    <CardDescription>Current patient care levels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Level 1.0 - Outpatient</span>
                          <Badge variant="outline">{data?.clinical?.asamDistribution?.level1 || 0} patients</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Level 2.1 - Intensive Outpatient</span>
                          <Badge variant="outline">{data?.clinical?.asamDistribution?.level21 || 0} patients</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Level 3.1 - Residential</span>
                          <Badge variant="outline">{data?.clinical?.asamDistribution?.level31 || 0} patients</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Level 3.7 - Medically Monitored</span>
                          <Badge variant="outline">{data?.clinical?.asamDistribution?.level37 || 0} patients</Badge>
                        </div>
                      </>
                    )}
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
                    {isLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">30 Days</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.retentionRates?.thirtyDay || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.retentionRates?.thirtyDay || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">90 Days</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.retentionRates?.ninetyDay || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.retentionRates?.ninetyDay || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">6 Months</span>
                            <span className="text-sm font-medium">
                              {data?.clinical?.retentionRates?.sixMonth || 0}%
                            </span>
                          </div>
                          <Progress value={data?.clinical?.retentionRates?.sixMonth || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">1 Year</span>
                            <span className="text-sm font-medium">{data?.clinical?.retentionRates?.oneYear || 0}%</span>
                          </div>
                          <Progress value={data?.clinical?.retentionRates?.oneYear || 0} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Trends</CardTitle>
                    <CardDescription>Patient risk levels overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">High Risk Patients</span>
                          <Badge variant="destructive">{data?.clinical?.riskAssessment?.high || 0} patients</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Medium Risk Patients</span>
                          <Badge variant="secondary">{data?.clinical?.riskAssessment?.medium || 0} patients</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Low Risk Patients</span>
                          <Badge variant="outline">{data?.clinical?.riskAssessment?.low || 0} patients</Badge>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Assessment Completion Rate</span>
                            <Badge variant="default">{data?.clinical?.assessmentCompletionRate || 0}%</Badge>
                          </div>
                        </div>
                      </>
                    )}
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
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Medicaid</span>
                          <span className="font-medium">
                            {formatCurrency(data?.financial?.revenueByPayer?.medicaid || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Medicare</span>
                          <span className="font-medium">
                            {formatCurrency(data?.financial?.revenueByPayer?.medicare || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Private Insurance</span>
                          <span className="font-medium">
                            {formatCurrency(data?.financial?.revenueByPayer?.privateInsurance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Self-Pay</span>
                          <span className="font-medium">
                            {formatCurrency(data?.financial?.revenueByPayer?.selfPay || 0)}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bundle vs APG Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">OTP Bundle Claims</span>
                          <span className="font-medium">{formatCurrency(data?.financial?.bundleRevenue || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">APG Claims</span>
                          <span className="font-medium">{formatCurrency(data?.financial?.apgRevenue || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Take-Home Bundles</span>
                          <span className="font-medium">{formatCurrency(data?.financial?.takeHomeRevenue || 0)}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Claims Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Paid Claims</span>
                          <Badge variant="default">{data?.financial?.claimsStatus?.paid || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pending Claims</span>
                          <Badge variant="secondary">{data?.financial?.claimsStatus?.pending || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Denied Claims</span>
                          <Badge variant="destructive">{data?.financial?.claimsStatus?.denied || 0}</Badge>
                        </div>
                      </>
                    )}
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
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Documentation Completeness</span>
                            <span className="text-sm font-medium">
                              {data?.quality?.documentationCompleteness || 0}%
                            </span>
                          </div>
                          <Progress value={data?.quality?.documentationCompleteness || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Treatment Plan Adherence</span>
                            <span className="text-sm font-medium">{data?.quality?.treatmentPlanAdherence || 0}%</span>
                          </div>
                          <Progress value={data?.quality?.treatmentPlanAdherence || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Patient Satisfaction</span>
                            <span className="text-sm font-medium">{data?.quality?.patientSatisfaction || 0}%</span>
                          </div>
                          <Progress value={data?.quality?.patientSatisfaction || 0} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Performance</CardTitle>
                    <CardDescription>Individual provider metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : data?.quality?.providerPerformance?.length > 0 ? (
                      data.quality.providerPerformance.map(
                        (provider: {
                          id: string
                          name: string
                          caseload: number
                          successRate: number
                          documentationRate: number
                        }) => (
                          <div key={provider.id} className="flex justify-between items-center">
                            <span className="text-sm">{provider.name}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline">{provider.caseload} patients</Badge>
                              <Badge variant="default">{provider.successRate}%</Badge>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">No provider data available</p>
                    )}
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
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">DEA Compliance</span>
                          <Badge variant="default">{data?.compliance?.dea || 0}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">SAMHSA Requirements</span>
                          <Badge variant="default">{data?.compliance?.samhsa || 0}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">State Licensing</span>
                          <Badge variant="default">{data?.compliance?.stateLicensing || 0}%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">HIPAA Compliance</span>
                          <Badge variant="default">{data?.compliance?.hipaa || 0}%</Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audit Readiness</CardTitle>
                    <CardDescription>Documentation and process compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <Skeleton className="h-32 w-full" />
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Required Documentation</span>
                            <span className="text-sm font-medium">
                              {data?.compliance?.auditReadiness?.documentation || 0}%
                            </span>
                          </div>
                          <Progress value={data?.compliance?.auditReadiness?.documentation || 0} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Policy Adherence</span>
                            <span className="text-sm font-medium">
                              {data?.compliance?.auditReadiness?.policyAdherence || 0}%
                            </span>
                          </div>
                          <Progress value={data?.compliance?.auditReadiness?.policyAdherence || 0} className="h-2" />
                        </div>
                      </>
                    )}
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
