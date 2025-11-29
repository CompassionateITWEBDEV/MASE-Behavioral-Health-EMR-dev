"use client"

import { useEffect } from "react"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  useEffect(() => {
    router.push("/landing")
  }, [router])

  console.log("[v0] Dashboard page rendering")

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to portal selection...</p>
    </div>
  )
}
