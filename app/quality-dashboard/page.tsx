"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, TrendingUp, Award, AlertCircle, Download, CheckCircle2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function QualityDashboardPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")

  const { data: qualityData, mutate } = useSWR(
    `/api/quality-measures?year=${selectedYear}&specialty=${selectedSpecialty}`,
    fetcher,
  )

  const measures = qualityData?.measures || []

  // Calculate overall statistics
  const totalMeasures = measures.length
  const measuresReporting = measures.filter((m: any) => m.denominator > 0).length
  const measuresMeetingGoal = measures.filter((m: any) => m.performance_rate >= 75).length
  const avgPerformance =
    measures.length > 0
      ? (measures.reduce((sum: number, m: any) => sum + m.performance_rate, 0) / measures.length).toFixed(1)
      : "0.0"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MIPS Quality Dashboard</h1>
            <p className="text-muted-foreground">Track quality measures and value-based care performance</p>
          </div>

          <div className="flex gap-3">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="Behavioral Health">Behavioral Health</SelectItem>
                <SelectItem value="Primary Care">Primary Care</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="OB/GYN">OB/GYN</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                <SelectItem value="Podiatry">Podiatry</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export QRDA
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Measures</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMeasures}</div>
              <p className="text-xs text-muted-foreground">{measuresReporting} actively reporting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPerformance}%</div>
              <p className="text-xs text-muted-foreground">Across all measures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meeting Goal</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{measuresMeetingGoal}</div>
              <p className="text-xs text-muted-foreground">Measures ≥75% performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{measures.filter((m: any) => m.meets_data_completeness).length}</div>
              <p className="text-xs text-muted-foreground">Measures meeting 75% threshold</p>
            </CardContent>
          </Card>
        </div>

        {/* Measures Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Measures Performance</CardTitle>
            <CardDescription>MIPS 2025 requires reporting 6 measures including 1 outcome measure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {measures.map((measure: any) => (
                <div key={measure.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{measure.measure_name}</h3>
                        <Badge variant="outline">{measure.measure_id}</Badge>
                        <Badge variant={measure.category === "outcome" ? "default" : "secondary"}>
                          {measure.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{measure.description}</p>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold">{measure.performance_rate}%</div>
                      <div className="text-xs text-muted-foreground">
                        {measure.numerator} / {measure.denominator} patients
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Performance Rate</span>
                        <span className="font-medium">{measure.performance_rate}%</span>
                      </div>
                      <Progress value={measure.performance_rate} />
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Data Completeness</span>
                        <span className="font-medium">{measure.data_completeness}%</span>
                      </div>
                      <Progress
                        value={measure.data_completeness}
                        className={measure.meets_data_completeness ? "" : "bg-red-100"}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    {measure.meets_minimum ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Meets minimum cases
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Needs {20 - measure.denominator} more cases
                      </Badge>
                    )}

                    {measure.meets_data_completeness ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Meets data completeness
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Below 75% threshold
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
