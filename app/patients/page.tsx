import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PatientList } from "@/components/patient-list"
import { PatientStats } from "@/components/patient-stats"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Filter, Plus, AlertTriangle, FileText } from "lucide-react"

const DEFAULT_PROVIDER = {
  id: "00000000-0000-0000-0000-000000000001",
  first_name: "Demo",
  last_name: "Provider",
  email: "demo@example.com",
  role: "physician",
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  let provider = DEFAULT_PROVIDER
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: providerData } = await supabase.from("providers").select("*").eq("id", user.id).single()
      if (providerData) {
        provider = providerData
      }
    }
  } catch (error) {
    console.log("[v0] Auth check failed, using default provider")
  }

  // Get search and filter parameters
  const search = typeof params.search === "string" ? params.search : ""
  const status = typeof params.status === "string" ? params.status : "all"
  const riskLevel = typeof params.risk === "string" ? params.risk : "all"

  // Build query for patients
  let query = supabase
    .from("patients")
    .select(`
      *,
      appointments(
        id,
        appointment_date,
        status,
        provider_id
      ),
      assessments(
        id,
        assessment_type,
        risk_assessment,
        created_at
      ),
      medications(
        id,
        medication_name,
        dosage,
        status
      )
    `)
    .order("created_at", { ascending: false })

  // Apply search filter
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data: patients, error: patientsError } = await query

  if (patientsError) {
    console.error("Error fetching patients:", patientsError)
  }

  // Get patient statistics
  const { data: totalPatients } = await supabase.from("patients").select("id", { count: "exact" })

  const { data: activePatients } = await supabase
    .from("patients")
    .select("id", { count: "exact" })
    .not("id", "is", null)

  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select("id", { count: "exact" })
    .gte("appointment_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const stats = {
    total: totalPatients?.length || 0,
    active: activePatients?.length || 0,
    highRisk:
      patients?.filter((p) =>
        p.assessments?.some(
          (a: { risk_assessment?: { level?: string } }) =>
            a.risk_assessment &&
            typeof a.risk_assessment === "object" &&
            "level" in a.risk_assessment &&
            a.risk_assessment.level === "high",
        ),
      ).length || 0,
    recentAppointments: recentAppointments?.length || 0,
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <AddPatientDialog providerId={provider.id}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </AddPatientDialog>
            </div>
          </div>

          <PatientStats stats={stats} />

          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Patient List</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <PatientList patients={patients || []} currentProviderId={provider.id} />
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
