"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Users, Search, Clock, Eye, Send, AlertTriangle } from "lucide-react"

interface PatientConsentTrackerProps {
  data: {
    patientConsentData: Array<{
      id: string
      patientId: string
      patientName: string
      totalForms: number
      completedForms: number
      pendingForms: number
      expiringSoon: number
      lastActivity: string
      status: string
    }>
    pendingForms: Array<{
      id: string
      patientName: string
      formName: string
      category: string
      dueDate: string
      priority: string
      daysOverdue: number
    }>
  } | null
  isLoading: boolean
  error: Error | null
}

export function PatientConsentTracker({ data, isLoading, error }: PatientConsentTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const patientConsents = data?.patientConsentData || []
  const pendingConsentForms = data?.pendingForms || []

  const filteredPatients = patientConsents.filter((patient) => {
    const matchesSearch =
      patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCompletionPercentage = (patient: { completedForms: number; totalForms: number }) => {
    if (patient.totalForms === 0) return 0
    return Math.round((patient.completedForms / patient.totalForms) * 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "incomplete":
        return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground text-center">Failed to load patient consent data. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Patient Consent Status
            </CardTitle>
            <CardDescription>Overview of consent form completion by patient</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No patients found matching your criteria.</div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{patient.patientName}</div>
                        <div className="text-sm text-muted-foreground">ID: {patient.patientId}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {patient.completedForms}/{patient.totalForms} forms
                        </div>
                        <Progress value={getCompletionPercentage(patient)} className="w-24 mt-1" />
                      </div>
                      {getStatusBadge(patient.status)}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Pending Consent Forms
            </CardTitle>
            <CardDescription>Forms awaiting patient signatures</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingConsentForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending consent forms.</div>
            ) : (
              <div className="space-y-4">
                {pendingConsentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{form.formName}</div>
                      <div className="text-sm text-muted-foreground">
                        Patient: {form.patientName} - Due: {form.dueDate}
                      </div>
                      {form.daysOverdue > 0 && (
                        <div className="text-sm text-red-600">{form.daysOverdue} days overdue</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(form.priority)}
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Patient Consent Tracking</CardTitle>
          <CardDescription>Comprehensive view of all patient consent forms</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No patients found matching your criteria.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Expiring Soon</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.patientName}</div>
                        <div className="text-sm text-muted-foreground">{patient.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={getCompletionPercentage(patient)} className="w-16" />
                        <span className="text-sm">
                          {patient.completedForms}/{patient.totalForms}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.pendingForms > 0 ? (
                        <Badge variant="outline">{patient.pendingForms}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.expiringSoon > 0 ? (
                        <Badge variant="destructive">{patient.expiringSoon}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.lastActivity ? new Date(patient.lastActivity).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
