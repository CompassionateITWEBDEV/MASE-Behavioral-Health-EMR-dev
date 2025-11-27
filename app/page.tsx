"use client"

import type React from "react"
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
import { useState, useEffect } from "react"

function DebugWrapper({ children, name }: { children: React.ReactNode; name: string }) {
  console.log(`[v0] Rendering ${name}`)
  return <>{children}</>
}

function BillingSummary() {
  const [data, setData] = useState<{
    monthlyRevenue: number
    pendingClaims: number
    priorAuths: number
    pmpAlerts: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBillingData() {
      try {
        const response = await fetch("/api/dashboard/billing")
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error loading billing data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBillingData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px" }}>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>Monthly Revenue</span>
        <span style={{ fontWeight: "500" }}>{formatCurrency(data?.monthlyRevenue || 0)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>Pending Claims</span>
        <Badge variant="secondary">{data?.pendingClaims || 0}</Badge>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>Prior Auths</span>
        <Badge variant="outline">{data?.priorAuths || 0} active</Badge>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>PMP Alerts</span>
        <Badge variant={data?.pmpAlerts && data.pmpAlerts > 0 ? "destructive" : "outline"}>
          {data?.pmpAlerts || 0} high risk
        </Badge>
      </div>
    </div>
  )
}

export default function Dashboard() {
  console.log("[v0] Dashboard page rendering")

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      <DebugWrapper name="DashboardSidebar">
        <DashboardSidebar />
      </DebugWrapper>
      <div style={{ paddingLeft: "256px" }}>
        <DebugWrapper name="DashboardHeader">
          <DashboardHeader />
        </DebugWrapper>
        <main style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <DebugWrapper name="PatientOverview">
                <PatientOverview />
              </DebugWrapper>
              <DebugWrapper name="RecentActivity">
                <RecentActivity />
              </DebugWrapper>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <DebugWrapper name="AICoachingPanel">
                <AICoachingPanel />
              </DebugWrapper>
              <DebugWrapper name="ComplianceTracker">
                <ComplianceTracker />
              </DebugWrapper>
              <DebugWrapper name="StaffDashboardWidget">
                <StaffDashboardWidget />
              </DebugWrapper>
              <Card style={{ backgroundColor: "#ffffff", border: "1px solid #fed7aa" }}>
                <CardHeader>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e293b" }}>
                    <Shield style={{ height: "20px", width: "20px", color: "#ea580c" }} />
                    Regulatory Compliance
                  </CardTitle>
                  <CardDescription>DEA and Joint Commission portal access</CardDescription>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px" }}>Overall Compliance</span>
                      <Badge style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>81%</Badge>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px" }}>Critical Issues</span>
                      <Badge variant="destructive" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertTriangle style={{ height: "12px", width: "12px" }} />2
                      </Badge>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px" }}>Active Inspectors</span>
                      <Badge variant="outline">0</Badge>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Link href="/regulatory/dea">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ width: "100%", justifyContent: "flex-start", backgroundColor: "#ffffff" }}
                      >
                        <Shield style={{ marginRight: "8px", height: "16px", width: "16px", color: "#2563eb" }} />
                        DEA Portal
                      </Button>
                    </Link>
                    <Link href="/regulatory/joint-commission">
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ width: "100%", justifyContent: "flex-start", backgroundColor: "#ffffff" }}
                      >
                        <FileCheck style={{ marginRight: "8px", height: "16px", width: "16px", color: "#059669" }} />
                        Joint Commission
                      </Button>
                    </Link>
                  </div>
                  <Link href="/regulatory">
                    <Button variant="outline" size="sm" style={{ width: "100%", backgroundColor: "#ffffff" }}>
                      <Building style={{ marginRight: "8px", height: "16px", width: "16px" }} />
                      All Regulatory Portals
                      <ArrowRight style={{ marginLeft: "8px", height: "16px", width: "16px" }} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: "#ffffff" }}>
                <CardHeader>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e293b" }}>
                    <DollarSign style={{ height: "20px", width: "20px" }} />
                    Billing Summary
                  </CardTitle>
                  <CardDescription>Insurance and authorization status</CardDescription>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <BillingSummary />
                  <Link href="/billing">
                    <Button variant="outline" size="sm" style={{ width: "100%", backgroundColor: "#ffffff" }}>
                      <FileCheck style={{ marginRight: "8px", height: "16px", width: "16px" }} />
                      View Billing Dashboard
                      <ArrowRight style={{ marginLeft: "8px", height: "16px", width: "16px" }} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
            <DebugWrapper name="QuickActions">
              <QuickActions />
            </DebugWrapper>
            <DebugWrapper name="ProviderMetrics">
              <ProviderMetrics />
            </DebugWrapper>
          </div>
        </main>
      </div>
    </div>
  )
}
