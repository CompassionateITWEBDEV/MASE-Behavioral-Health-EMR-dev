"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pill, Plus, Search, AlertTriangle, User, Edit, Calendar, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/rbac-hooks"
import { RoleGuard } from "@/components/auth/role-guard"
import { PERMISSIONS } from "@/lib/auth/roles"

interface PatientMedication {
  id: string
  patient_id: string
  patient_name: string
  medication_name: string
  generic_name?: string
  dosage: string
  frequency: string
  route: string
  start_date: string
  end_date?: string
  prescribed_by: string
  prescriber_name: string
  medication_type: "regular" | "prn" | "controlled"
  ndc_number?: string
  pharmacy_name?: string
  pharmacy_phone?: string
  refills_remaining: number
  status: "active" | "discontinued" | "completed"
  notes?: string
  created_at: string
  updated_at: string
}

interface MedicationInteraction {
  medication1: string
  medication2: string
  severity: "minor" | "moderate" | "major"
  description: string
}

export default function MedicationsPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [medications, setMedications] = useState<PatientMedication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [interactions, setInteractions] = useState<MedicationInteraction[]>([])
  const { user, hasPermission } = useAuth()

  const [newMedication, setNewMedication] = useState({
    patient_id: "",
    medication_name: "",
    generic_name: "",
    dosage: "",
    frequency: "",
    route: "oral",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    medication_type: "regular" as const,
    ndc_number: "",
    pharmacy_name: "",
    pharmacy_phone: "",
    refills_remaining: 0,
    notes: "",
  })

  useEffect(() => {
    loadMedications()
    checkInteractions()
  }, [selectedPatient])

  const loadMedications = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedPatient !== "all") {
        params.append("patient_id", selectedPatient)
      }

      const response = await fetch(`/api/medications?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMedications(data.medications || [])
      }
    } catch (error) {
      console.error("[v0] Error loading medications:", error)
    }
  }

  const checkInteractions = async () => {
    try {
      const response = await fetch("/api/medications/interactions")
      if (response.ok) {
        const data = await response.json()
        setInteractions(data.interactions || [])
      }
    } catch (error) {
      console.error("[v0] Error checking drug interactions:", error)
    }
  }

  const handleAddMedication = async () => {
    if (!hasPermission(PERMISSIONS.MEDICATIONS_WRITE)) {
      alert("You do not have permission to add medications")
      return
    }

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMedication,
          prescribed_by: user?.id,
        }),
      })

      if (response.ok) {
        loadMedications()
        setShowAddDialog(false)
        setNewMedication({
          patient_id: "",
          medication_name: "",
          generic_name: "",
          dosage: "",
          frequency: "",
          route: "oral",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          medication_type: "regular",
          ndc_number: "",
          pharmacy_name: "",
          pharmacy_phone: "",
          refills_remaining: 0,
          notes: "",
        })
      }
    } catch (error) {
      console.error("Failed to add medication:", error)
    }
  }

  const handleDiscontinueMedication = async (medicationId: string, reason: string) => {
    if (!hasPermission(PERMISSIONS.MEDICATIONS_WRITE)) {
      alert("You do not have permission to modify medications")
      return
    }

    try {
      const response = await fetch(`/api/medications/${medicationId}/discontinue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          discontinued_by: user?.id,
        }),
      })

      if (response.ok) {
        loadMedications()
      }
    } catch (error) {
      console.error("Failed to discontinue medication:", error)
    }
  }

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.prescriber_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "active"
        ? med.status === "active"
        : activeTab === "discontinued"
          ? med.status === "discontinued"
          : activeTab === "prn"
            ? med.medication_type === "prn"
            : true

    const matchesPatient = selectedPatient === "all" || med.patient_id === selectedPatient

    return matchesSearch && matchesTab && matchesPatient
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medication Management</h1>
          <p className="text-muted-foreground">Manage patient medications and prescriptions</p>
        </div>
        <RoleGuard requiredPermissions={[PERMISSIONS.MEDICATIONS_WRITE]}>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>Add a new medication to a patient's medication list</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient</Label>
                    <Select
                      value={newMedication.patient_id}
                      onValueChange={(value) => setNewMedication((prev) => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-001">Sarah Johnson</SelectItem>
                        <SelectItem value="pt-002">Michael Chen</SelectItem>
                        <SelectItem value="pt-003">David Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="medication-type">Medication Type</Label>
                    <Select
                      value={newMedication.medication_type}
                      onValueChange={(value: any) => setNewMedication((prev) => ({ ...prev, medication_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="prn">PRN (As Needed)</SelectItem>
                        <SelectItem value="controlled">Controlled Substance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medication-name">Medication Name</Label>
                    <Input
                      id="medication-name"
                      value={newMedication.medication_name}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, medication_name: e.target.value }))}
                      placeholder="Brand name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="generic-name">Generic Name</Label>
                    <Input
                      id="generic-name"
                      value={newMedication.generic_name}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, generic_name: e.target.value }))}
                      placeholder="Generic name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newMedication.frequency}
                      onValueChange={(value) => setNewMedication((prev) => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                        <SelectItem value="Every other day">Every other day</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="route">Route</Label>
                    <Select
                      value={newMedication.route}
                      onValueChange={(value) => setNewMedication((prev) => ({ ...prev, route: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                        <SelectItem value="inhalation">Inhalation</SelectItem>
                        <SelectItem value="sublingual">Sublingual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newMedication.start_date}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newMedication.end_date}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacy">Pharmacy Name</Label>
                    <Input
                      id="pharmacy"
                      value={newMedication.pharmacy_name}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, pharmacy_name: e.target.value }))}
                      placeholder="Pharmacy name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refills">Refills Remaining</Label>
                    <Input
                      id="refills"
                      type="number"
                      min="0"
                      value={newMedication.refills_remaining}
                      onChange={(e) =>
                        setNewMedication((prev) => ({
                          ...prev,
                          refills_remaining: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newMedication.notes}
                    onChange={(e) => setNewMedication((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or instructions..."
                  />
                </div>

                <Button onClick={handleAddMedication} className="w-full">
                  Add Medication
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      {/* Drug Interactions Alert */}
      {interactions.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Drug Interaction Alerts</div>
            {interactions.map((interaction, index) => (
              <div key={index} className="text-sm">
                <Badge
                  variant={
                    interaction.severity === "major"
                      ? "destructive"
                      : interaction.severity === "moderate"
                        ? "secondary"
                        : "outline"
                  }
                  className="mr-2"
                >
                  {interaction.severity}
                </Badge>
                {interaction.medication1} + {interaction.medication2}: {interaction.description}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search medications, patients, or prescribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All patients</SelectItem>
            <SelectItem value="pt-001">Sarah Johnson</SelectItem>
            <SelectItem value="pt-002">Michael Chen</SelectItem>
            <SelectItem value="pt-003">David Wilson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="prn">PRN Medications</TabsTrigger>
          <TabsTrigger value="discontinued">Discontinued</TabsTrigger>
          <TabsTrigger value="all">All Medications</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredMedications.map((medication) => (
              <Card key={medication.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        {medication.medication_name}
                        {medication.generic_name && medication.generic_name !== medication.medication_name && (
                          <span className="text-sm text-muted-foreground">({medication.generic_name})</span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        <User className="w-4 h-4 inline mr-1" />
                        {medication.patient_name} • Prescribed by {medication.prescriber_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          medication.medication_type === "controlled"
                            ? "destructive"
                            : medication.medication_type === "prn"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {medication.medication_type.toUpperCase()}
                      </Badge>
                      <Badge variant={medication.status === "active" ? "default" : "secondary"}>
                        {medication.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Dosage & Frequency</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency} • {medication.route}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {medication.start_date} {medication.end_date && `- ${medication.end_date}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Pharmacy & Refills</div>
                      <div className="text-sm text-muted-foreground">
                        {medication.pharmacy_name || "No pharmacy"} • {medication.refills_remaining} refills left
                      </div>
                    </div>
                  </div>

                  {medication.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">Notes</div>
                      <div className="text-sm text-muted-foreground">{medication.notes}</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(medication.created_at).toLocaleDateString()}
                      {medication.ndc_number && ` • NDC: ${medication.ndc_number}`}
                    </div>
                    <div className="flex gap-2">
                      <RoleGuard requiredPermissions={[PERMISSIONS.MEDICATIONS_WRITE]}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {medication.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Reason for discontinuation:")
                              if (reason) {
                                handleDiscontinueMedication(medication.id, reason)
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Discontinue
                          </Button>
                        )}
                      </RoleGuard>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredMedications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No medications found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
