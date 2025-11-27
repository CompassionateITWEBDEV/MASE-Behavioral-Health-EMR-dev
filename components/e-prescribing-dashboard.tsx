"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Plus, Search, Send, FileText, Clock, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Medication {
  id: string
  name: string
  strength: string
  form: string
}

interface Prescription {
  id: string
  patientName: string
  patient_id: string
  medicationName: string
  medication_id: string
  strength: string
  quantity: number
  daysSupply: number
  refills: number
  status: "pending" | "sent" | "filled" | "cancelled"
  prescribedDate: string
  pharmacyName?: string
  directions?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function EPrescribingDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/prescriptions", fetcher)
  const prescriptions: Prescription[] = data?.prescriptions || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />
      case "filled":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "filled":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendPrescription = async (id: string) => {
    try {
      const response = await fetch("/api/prescriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "sent" }),
      })
      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("Error sending prescription:", error)
    }
  }

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingCount = prescriptions.filter((p) => p.status === "pending").length
  const sentCount = prescriptions.filter((p) => p.status === "sent").length
  const filledCount = prescriptions.filter((p) => p.status === "filled").length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting transmission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
            <p className="text-xs text-muted-foreground">Transmitted to pharmacy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filledCount}</div>
            <p className="text-xs text-muted-foreground">Picked up by patients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="formulary">Drug Formulary</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prescription Management</CardTitle>
                <Dialog open={isNewPrescriptionOpen} onOpenChange={setIsNewPrescriptionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Prescription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Prescription</DialogTitle>
                    </DialogHeader>
                    <NewPrescriptionForm
                      onClose={() => setIsNewPrescriptionOpen(false)}
                      onSuccess={() => {
                        setIsNewPrescriptionOpen(false)
                        mutate()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No prescriptions found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm ? "Try adjusting your search" : "Create a new prescription to get started"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">{prescription.patientName}</TableCell>
                        <TableCell>{prescription.medicationName}</TableCell>
                        <TableCell>{prescription.strength}</TableCell>
                        <TableCell>{prescription.quantity}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(prescription.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(prescription.status)}
                              <span className="capitalize">{prescription.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{prescription.pharmacyName || "Not assigned"}</TableCell>
                        <TableCell>{new Date(prescription.prescribedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {prescription.status === "pending" && (
                              <Button size="sm" onClick={() => handleSendPrescription(prescription.id)}>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulary">
          <DrugFormularyTab />
        </TabsContent>

        <TabsContent value="interactions">
          <DrugInteractionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NewPrescriptionForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    medicationName: "",
    strength: "",
    dosageForm: "",
    quantity: "",
    daysSupply: "",
    directions: "",
    refills: "0",
    pharmacyName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients")
        if (response.ok) {
          const data = await response.json()
          setPatients(data.patients || [])
        }
      } catch (error) {
        console.error("Error fetching patients:", error)
      } finally {
        setLoadingPatients(false)
      }
    }

    const fetchMedications = async () => {
      try {
        const response = await fetch("/api/medications")
        if (response.ok) {
          const data = await response.json()
          setMedications(data.medications || [])
        }
      } catch (error) {
        console.error("Error fetching medications:", error)
      }
    }

    fetchPatients()
    fetchMedications()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId || !formData.medicationName || !formData.quantity) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedPatient = patients.find((p) => p.id === formData.patientId)
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: formData.patientId,
          patient_name: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "",
          medication_name: formData.medicationName,
          strength: formData.strength,
          quantity: Number.parseInt(formData.quantity) || 0,
          days_supply: Number.parseInt(formData.daysSupply) || 30,
          directions: formData.directions,
          refills: Number.parseInt(formData.refills) || 0,
          pharmacy_name: formData.pharmacyName,
          status: "pending",
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to create prescription")
      }
    } catch (error) {
      console.error("Error creating prescription:", error)
      alert("Failed to create prescription")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Patient *</Label>
          <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder={loadingPatients ? "Loading..." : "Select patient"} />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="medication">Medication *</Label>
          <Select
            value={formData.medicationName}
            onValueChange={(value) => {
              const med = medications.find((m) => m.name === value)
              setFormData({
                ...formData,
                medicationName: value,
                strength: med?.strength || "",
                dosageForm: med?.form || "",
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medication" />
            </SelectTrigger>
            <SelectContent>
              {medications.length > 0 ? (
                medications.map((med) => (
                  <SelectItem key={med.id} value={med.name}>
                    {med.name} {med.strength && `- ${med.strength}`}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Methadone">Methadone</SelectItem>
                  <SelectItem value="Buprenorphine">Buprenorphine</SelectItem>
                  <SelectItem value="Naltrexone">Naltrexone</SelectItem>
                  <SelectItem value="Suboxone">Suboxone</SelectItem>
                  <SelectItem value="Vivitrol">Vivitrol</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="strength">Strength</Label>
          <Input
            id="strength"
            value={formData.strength}
            onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
            placeholder="e.g., 50mg"
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="30"
          />
        </div>

        <div>
          <Label htmlFor="daysSupply">Days Supply</Label>
          <Input
            id="daysSupply"
            type="number"
            value={formData.daysSupply}
            onChange={(e) => setFormData({ ...formData, daysSupply: e.target.value })}
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="directions">Directions for Use</Label>
        <Textarea
          id="directions"
          value={formData.directions}
          onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
          placeholder="Take 1 tablet by mouth daily"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="refills">Refills</Label>
          <Select value={formData.refills} onValueChange={(value) => setFormData({ ...formData, refills: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pharmacy">Pharmacy</Label>
          <Select
            value={formData.pharmacyName}
            onValueChange={(value) => setFormData({ ...formData, pharmacyName: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pharmacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CVS Pharmacy">CVS Pharmacy</SelectItem>
              <SelectItem value="Walgreens">Walgreens</SelectItem>
              <SelectItem value="Rite Aid">Rite Aid</SelectItem>
              <SelectItem value="Walmart Pharmacy">Walmart Pharmacy</SelectItem>
              <SelectItem value="On-site Dispensary">On-site Dispensary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Prescription"
          )}
        </Button>
      </div>
    </form>
  )
}

function DrugFormularyTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, isLoading } = useSWR("/api/medications", fetcher)
  const medications = data?.medications || []

  const filteredMeds = medications.filter((med: Medication) =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Formulary</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredMeds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No medications match your search" : "No medications in formulary"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication Name</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeds.map((med: Medication) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell>{med.strength || "—"}</TableCell>
                  <TableCell>{med.form || "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Preferred</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function DrugInteractionsTab() {
  const [drug1, setDrug1] = useState("")
  const [drug2, setDrug2] = useState("")
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ severity: string; description: string } | null>(null)

  const checkInteraction = async () => {
    if (!drug1 || !drug2) {
      alert("Please enter both medications")
      return
    }

    setChecking(true)
    setResult(null)

    // Simulate interaction check
    setTimeout(() => {
      const interactions: Record<string, { severity: string; description: string }> = {
        "methadone-benzodiazepines": {
          severity: "severe",
          description:
            "Concurrent use of opioids with benzodiazepines may result in profound sedation, respiratory depression, coma, and death.",
        },
        "buprenorphine-naltrexone": {
          severity: "severe",
          description:
            "Naltrexone can precipitate acute withdrawal symptoms in patients physically dependent on opioids.",
        },
        "methadone-fluconazole": {
          severity: "moderate",
          description:
            "Fluconazole may increase methadone levels, potentially leading to increased sedation and respiratory depression.",
        },
      }

      const key = `${drug1.toLowerCase()}-${drug2.toLowerCase()}`
      const reverseKey = `${drug2.toLowerCase()}-${drug1.toLowerCase()}`

      if (interactions[key]) {
        setResult(interactions[key])
      } else if (interactions[reverseKey]) {
        setResult(interactions[reverseKey])
      } else {
        setResult({
          severity: "none",
          description: "No significant interactions found between these medications.",
        })
      }
      setChecking(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drug Interaction Checker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Medication</Label>
            <Input placeholder="Enter medication name" value={drug1} onChange={(e) => setDrug1(e.target.value)} />
          </div>
          <div>
            <Label>Second Medication</Label>
            <Input placeholder="Enter medication name" value={drug2} onChange={(e) => setDrug2(e.target.value)} />
          </div>
        </div>

        <Button onClick={checkInteraction} disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Interactions"
          )}
        </Button>

        {result && (
          <Card
            className={
              result.severity === "severe"
                ? "border-red-500 bg-red-50"
                : result.severity === "moderate"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-green-500 bg-green-50"
            }
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {result.severity === "severe" ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : result.severity === "moderate" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <h4
                    className={`font-semibold capitalize ${
                      result.severity === "severe"
                        ? "text-red-700"
                        : result.severity === "moderate"
                          ? "text-yellow-700"
                          : "text-green-700"
                    }`}
                  >
                    {result.severity === "none" ? "No Interaction" : `${result.severity} Interaction`}
                  </h4>
                  <p className="text-sm mt-1">{result.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
