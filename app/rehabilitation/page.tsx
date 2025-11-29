"use client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileCheck, Dumbbell, AlertTriangle, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { useState } from "react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function RehabilitationPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/rehabilitation/hep", fetcher)
  const [newProgramOpen, setNewProgramOpen] = useState(false)
  const [newProgram, setNewProgram] = useState({
    patient_id: "",
    program_name: "",
    diagnosis_codes: "",
    start_date: new Date().toISOString().slice(0, 10),
    duration_weeks: 4,
    frequency: "2x daily",
    program_goals: "",
    special_instructions: "",
  })

  const handleCreateProgram = async () => {
    try {
      const res = await fetch("/api/rehabilitation/hep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_program",
          ...newProgram,
          therapist_id: "current-user-id", // TODO: Get from auth
          diagnosis_codes: newProgram.diagnosis_codes.split(",").map((c) => c.trim()),
        }),
      })

      if (!res.ok) throw new Error("Failed to create program")

      toast.success("HEP program created successfully!")
      setNewProgramOpen(false)
      mutate()
    } catch (error) {
      toast.error("Failed to create HEP program")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rehabilitation & Home Exercise Programs</h1>
              <p className="text-muted-foreground">PT, OT, Speech Therapy with RTM Billing</p>
            </div>
            <Dialog open={newProgramOpen} onOpenChange={setNewProgramOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create HEP Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Home Exercise Program</DialogTitle>
                  <DialogDescription>Set up a new HEP for remote therapeutic monitoring</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Program Name</Label>
                    <Input
                      value={newProgram.program_name}
                      onChange={(e) => setNewProgram({ ...newProgram, program_name: e.target.value })}
                      placeholder="Post-op Knee Rehab Protocol"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newProgram.start_date}
                        onChange={(e) => setNewProgram({ ...newProgram, start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration (weeks)</Label>
                      <Input
                        type="number"
                        value={newProgram.duration_weeks}
                        onChange={(e) =>
                          setNewProgram({ ...newProgram, duration_weeks: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Frequency</Label>
                    <Select
                      value={newProgram.frequency}
                      onValueChange={(v) => setNewProgram({ ...newProgram, frequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x daily">1x daily</SelectItem>
                        <SelectItem value="2x daily">2x daily</SelectItem>
                        <SelectItem value="3x daily">3x daily</SelectItem>
                        <SelectItem value="3x per week">3x per week</SelectItem>
                        <SelectItem value="5x per week">5x per week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Diagnosis Codes (comma separated)</Label>
                    <Input
                      value={newProgram.diagnosis_codes}
                      onChange={(e) => setNewProgram({ ...newProgram, diagnosis_codes: e.target.value })}
                      placeholder="M25.561, M17.11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Program Goals</Label>
                    <Textarea
                      value={newProgram.program_goals}
                      onChange={(e) => setNewProgram({ ...newProgram, program_goals: e.target.value })}
                      placeholder="Improve knee ROM to 120 degrees, reduce pain to 2/10, return to ADLs"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Special Instructions</Label>
                    <Textarea
                      value={newProgram.special_instructions}
                      onChange={(e) => setNewProgram({ ...newProgram, special_instructions: e.target.value })}
                      placeholder="Stop if pain exceeds 5/10, ice after exercises"
                    />
                  </div>
                  <Button onClick={handleCreateProgram}>Create Program</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active HEP Programs</CardTitle>
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.activePrograms || 0}</div>
                <p className="text-xs text-muted-foreground">With RTM monitoring</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Programs</CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.completedPrograms || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.pendingAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RTM Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">Billable this month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="programs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="programs">HEP Programs</TabsTrigger>
              <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
              <TabsTrigger value="compliance">Patient Compliance</TabsTrigger>
              <TabsTrigger value="rtm">RTM Billing</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Home Exercise Programs</CardTitle>
                  <CardDescription>Monitor patient progress and compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.programs && data.programs.length > 0 ? (
                    <div className="space-y-4">
                      {data.programs.map((program: any) => (
                        <div key={program.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{program.program_name}</h3>
                              <Badge variant={program.status === "active" ? "default" : "secondary"}>
                                {program.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Patient: {program.patients?.first_name} {program.patients?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Frequency: {program.frequency} • Duration: {program.duration_weeks} weeks
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      No active HEP programs. Click "Create HEP Program" to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Library</CardTitle>
                  <CardDescription>Pre-built exercises with videos and instructions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data?.exercises?.slice(0, 6).map((exercise: any) => (
                      <div key={exercise.id} className="rounded-lg border p-4">
                        <h4 className="font-semibold">{exercise.exercise_name}</h4>
                        <p className="text-sm text-muted-foreground">{exercise.exercise_category}</p>
                        <p className="mt-2 text-xs">{exercise.description?.slice(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Compliance Tracking</CardTitle>
                  <CardDescription>Real-time monitoring of patient adherence</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track patient completion rates, pain levels, and exercise difficulty ratings in real-time.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rtm" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Remote Therapeutic Monitoring (RTM) Billing</CardTitle>
                  <CardDescription>CPT Codes: 98975, 98976, 98977, 98980, 98981</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold">98975 - Initial Setup</h4>
                      <p className="text-sm text-muted-foreground">
                        RTM device setup, patient education (one-time per episode)
                      </p>
                      <p className="mt-2 text-lg font-bold">$19.50</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-semibold">98977 - Monthly Monitoring</h4>
                      <p className="text-sm text-muted-foreground">
                        16+ days of data collection, 30 mins treatment management
                      </p>
                      <p className="mt-2 text-lg font-bold">$50.77</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    RTM codes allow billing for remote monitoring of musculoskeletal conditions and therapeutic
                    exercises. Automatically tracked through patient app usage.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Alerts</CardTitle>
                  <CardDescription>Patients requiring therapist attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.alerts && data.alerts.length > 0 ? (
                    <div className="space-y-2">
                      {data.alerts.map((alert: any) => (
                        <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">{alert.alert_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {alert.patients?.first_name} {alert.patients?.last_name} -{" "}
                                {alert.hep_programs?.program_name}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No pending alerts</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
