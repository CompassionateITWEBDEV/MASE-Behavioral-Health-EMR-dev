"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileCheck, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Eye, Send } from "lucide-react"

interface PriorAuth {
  id: string
  patientName: string
  service: string
  status: "pending" | "approved" | "denied" | "expired"
  submittedDate: string
  responseDate?: string
  authNumber?: string
  expirationDate?: string
  notes?: string
}

const mockPriorAuths: PriorAuth[] = [
  {
    id: "PA001",
    patientName: "Sarah Johnson",
    service: "Intensive Outpatient Program (IOP)",
    status: "approved",
    submittedDate: "2024-12-01",
    responseDate: "2024-12-03",
    authNumber: "AUTH123456",
    expirationDate: "2025-03-03",
    notes: "Approved for 12 weeks of IOP services",
  },
  {
    id: "PA002",
    patientName: "Michael Chen",
    service: "Medication Assisted Treatment",
    status: "pending",
    submittedDate: "2024-12-08",
    notes: "Awaiting medical necessity review",
  },
  {
    id: "PA003",
    patientName: "Emily Rodriguez",
    service: "Residential Treatment",
    status: "denied",
    submittedDate: "2024-11-28",
    responseDate: "2024-12-02",
    notes: "Insufficient documentation of medical necessity",
  },
]

export function PriorAuthorization() {
  const [priorAuths, setPriorAuths] = useState<PriorAuth[]>(mockPriorAuths)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAuth, setNewAuth] = useState({
    patientName: "",
    service: "",
    diagnosis: "",
    justification: "",
    urgency: "routine",
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "denied":
        return "destructive"
      case "pending":
        return "secondary"
      case "expired":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleSubmitAuth = () => {
    const newPriorAuth: PriorAuth = {
      id: `PA${String(priorAuths.length + 1).padStart(3, "0")}`,
      patientName: newAuth.patientName,
      service: newAuth.service,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      notes: newAuth.justification,
    }

    setPriorAuths([newPriorAuth, ...priorAuths])
    setNewAuth({
      patientName: "",
      service: "",
      diagnosis: "",
      justification: "",
      urgency: "routine",
    })
    setShowNewForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prior Authorization Management</h2>
          <p className="text-muted-foreground">Submit and track prior authorization requests</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Prior Auth
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Prior Authorization</CardTitle>
            <CardDescription>Complete the form below to submit a new prior authorization request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={newAuth.patientName}
                  onChange={(e) => setNewAuth({ ...newAuth, patientName: e.target.value })}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="service">Service/Treatment</Label>
                <Select value={newAuth.service} onValueChange={(value) => setNewAuth({ ...newAuth, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iop">Intensive Outpatient Program (IOP)</SelectItem>
                    <SelectItem value="php">Partial Hospitalization Program (PHP)</SelectItem>
                    <SelectItem value="residential">Residential Treatment</SelectItem>
                    <SelectItem value="mat">Medication Assisted Treatment</SelectItem>
                    <SelectItem value="detox">Medical Detoxification</SelectItem>
                    <SelectItem value="counseling">Individual/Group Counseling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={newAuth.diagnosis}
                  onChange={(e) => setNewAuth({ ...newAuth, diagnosis: e.target.value })}
                  placeholder="ICD-10 code and description"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={newAuth.urgency} onValueChange={(value) => setNewAuth({ ...newAuth, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine (5-7 business days)</SelectItem>
                    <SelectItem value="urgent">Urgent (24-48 hours)</SelectItem>
                    <SelectItem value="emergent">Emergent (Same day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="justification">Medical Necessity Justification</Label>
              <Textarea
                id="justification"
                value={newAuth.justification}
                onChange={(e) => setNewAuth({ ...newAuth, justification: e.target.value })}
                placeholder="Provide detailed justification for medical necessity..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmitAuth} className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Submit Authorization
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prior Authorization Requests</CardTitle>
          <CardDescription>Track the status of submitted prior authorization requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorAuths.map((auth) => (
              <div key={auth.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{auth.patientName}</h4>
                      <Badge variant="outline">{auth.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{auth.service}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(auth.status)}
                    <Badge variant={getStatusColor(auth.status)}>{auth.status.toUpperCase()}</Badge>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>
                    <span className="font-medium">Submitted:</span> {auth.submittedDate}
                  </div>
                  {auth.responseDate && (
                    <div>
                      <span className="font-medium">Response:</span> {auth.responseDate}
                    </div>
                  )}
                  {auth.authNumber && (
                    <div>
                      <span className="font-medium">Auth #:</span> {auth.authNumber}
                    </div>
                  )}
                </div>

                {auth.expirationDate && (
                  <div className="text-sm">
                    <span className="font-medium">Expires:</span> {auth.expirationDate}
                  </div>
                )}

                {auth.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span> {auth.notes}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {auth.status === "pending" && (
                    <Button variant="outline" size="sm">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
