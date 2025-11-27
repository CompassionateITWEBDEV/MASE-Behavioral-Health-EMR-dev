"use client"

import { useState } from "react"
import useSWR from "swr"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pill, Search, AlertTriangle, Clock, FileText, ExternalLink, RefreshCw } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PMPData {
  systemStatus: string
  todayChecks: number
  yesterdayChecks: number
  highRiskAlerts: number
  recentAlerts: Array<{
    id: string
    patientName: string
    dob: string
    alertType: string
    severity: string
    message: string
    createdAt: string
  }>
  controlledSubstancePatients: number
}

export default function PMPPage() {
  const { data, error, isLoading, mutate } = useSWR<PMPData>("/api/pmp", fetcher)
  const [searchParams, setSearchParams] = useState({
    firstName: "",
    lastName: "",
    dob: "",
  })
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const response = await fetch("/api/pmp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      })
      const result = await response.json()
      if (result.success) {
        alert("PMP check logged successfully. In production, this would open the Michigan MAPS results.")
        mutate() // Refresh stats
      }
    } catch (err) {
      console.error("Error performing PMP search:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const todayDiff = (data?.todayChecks || 0) - (data?.yesterdayChecks || 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">PMP Monitoring Dashboard</h1>
              <p className="text-muted-foreground">
                Michigan Prescription Monitoring Program integration via michigan.pmpaware.net
              </p>
            </div>
            <Button variant="outline" onClick={() => mutate()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* System Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <div
                  className={`w-3 h-3 rounded-full ${data?.systemStatus === "online" ? "bg-green-500" : "bg-red-500"}`}
                ></div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold capitalize">{data?.systemStatus || "Unknown"}</div>
                    <p className="text-xs text-muted-foreground">Connected to Michigan MAPS</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{"Today's Checks"}</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{data?.todayChecks || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={todayDiff >= 0 ? "text-green-600" : "text-red-600"}>
                        {todayDiff >= 0 ? "+" : ""}
                        {todayDiff}
                      </span>{" "}
                      from yesterday
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${(data?.highRiskAlerts || 0) > 0 ? "text-red-600" : ""}`}>
                      {data?.highRiskAlerts || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Require immediate review</p>
                  </>
                )}
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
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={searchParams.firstName}
                    onChange={(e) => setSearchParams({ ...searchParams, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={searchParams.lastName}
                    onChange={(e) => setSearchParams({ ...searchParams, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={searchParams.dob}
                    onChange={(e) => setSearchParams({ ...searchParams, dob: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSearch}
                  disabled={isSearching || !searchParams.firstName || !searchParams.lastName}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? "Searching..." : "Search PMP Database"}
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://michigan.pmpaware.net" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Michigan MAPS Portal
                  </a>
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
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : !data?.recentAlerts || data.recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No high-risk alerts at this time</p>
                  <p className="text-sm">All patients are within normal monitoring parameters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 ${
                        alert.severity === "critical" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {alert.severity === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">
                            {alert.patientName} {alert.dob && `(DOB: ${alert.dob})`}
                          </p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Alert: {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                          {alert.severity === "critical" ? "Critical" : "Medium Risk"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      <span className="font-medium">Last Sync:</span> {new Date().toLocaleTimeString()}
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
