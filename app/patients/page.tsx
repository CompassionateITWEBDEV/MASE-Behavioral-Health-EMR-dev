"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PatientList } from "@/components/patient-list"
import { PatientStats } from "@/components/patient-stats"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Filter, Plus, AlertTriangle, FileText, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const DEFAULT_PROVIDER = {
  id: "00000000-0000-0000-0000-000000000001",
  first_name: "Demo",
  last_name: "Provider",
  email: "demo@example.com",
  role: "physician",
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, highRisk: 0, recentAppointments: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [provider, setProvider] = useState(DEFAULT_PROVIDER)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Get provider info (for auth context, not for data fetching)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: providerData } = await supabase
            .from("providers")
            .select("*")
            .eq("id", user.id)
            .single()
          if (providerData) {
            setProvider(providerData)
          }
        }
      } catch (authError) {
        console.log("[v0] Auth check failed, using default provider")
      }

      // Fetch patients and stats from API route
      console.log("[v0] Fetching patients from /api/patients/list")
      const response = await fetch("/api/patients/list")
      
      console.log("[v0] API response status:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error response:", errorData)
        throw new Error(
          errorData.error || `Failed to fetch patients: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log("[v0] API response data:", {
        patientsCount: data.patients?.length || 0,
        stats: data.stats,
        hasError: !!data.error,
      })

      if (data.error) {
        console.error("[v0] API returned error:", data.error)
        throw new Error(data.error)
      }

      const patientsData = data.patients || []
      const statsData = data.stats || {
        total: 0,
        active: 0,
        highRisk: 0,
        recentAppointments: 0,
      }

      console.log("[v0] Processed patients:", patientsData.length)
      console.log("[v0] First patient sample:", patientsData[0] ? {
        id: patientsData[0].id,
        name: `${patientsData[0].first_name} ${patientsData[0].last_name}`,
      } : "No patients")

      setPatients(patientsData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load patients. Please try again."
      console.error("[v0] Error fetching patients:", errorMessage)
      setError(errorMessage)
      setPatients([])
      setStats({ total: 0, active: 0, highRisk: 0, recentAppointments: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handlePatientAdded = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pl-64">
          <DashboardHeader />
          <main className="p-6">
            <div className="text-center py-12">Loading patients...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Patient Management
              </h1>
              <p className="text-muted-foreground">Comprehensive patient database and records</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <AddPatientDialog providerId={provider.id} onSuccess={handlePatientAdded}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </AddPatientDialog>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Patients</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  className="ml-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <PatientStats stats={stats} />

          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Patient List</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <PatientList 
                patients={patients} 
                currentProviderId={provider.id} 
                showFilters={showFilters}
                onPatientUpdated={fetchData}
                onPatientDeleted={fetchData}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                        <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                        <p className="text-xs text-green-600">Active caseload</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Treatment</p>
                        <p className="text-2xl font-bold text-card-foreground">{stats.active}</p>
                        <p className="text-xs text-green-600">In active care</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                        <p className="text-2xl font-bold text-card-foreground">{stats.highRisk}</p>
                        <p className="text-xs text-red-600">Require attention</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                        <p className="text-2xl font-bold text-card-foreground">{stats.recentAppointments}</p>
                        <p className="text-xs text-blue-600">This week</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
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
