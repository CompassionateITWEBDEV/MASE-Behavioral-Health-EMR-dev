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
import {
  FileText,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Pill,
  Phone,
  MapPin,
  Edit,
  Printer,
} from "lucide-react"
import { useAuth } from "@/lib/auth/rbac-hooks"
import { RoleGuard } from "@/components/auth/role-guard"
import { PERMISSIONS } from "@/lib/auth/roles"

interface Prescription {
  id: string
  patient_id: string
  patient_name: string
  prescribed_by: string
  prescriber_name: string
  medication_name: string
  generic_name?: string
  dosage: string
  quantity: number
  refills: number
  directions: string
  pharmacy_name?: string
  pharmacy_address?: string
  pharmacy_phone?: string
  pharmacy_npi?: string
  prescription_number?: string
  status: "pending" | "sent" | "filled" | "cancelled" | "expired"
  prescribed_date: string
  sent_date?: string
  filled_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  npi: string
  fax?: string
  email?: string
  is_preferred: boolean
}

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("all")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showPharmacyDialog, setShowPharmacyDialog] = useState(false)
  const { user, hasPermission } = useAuth()

  const [newPrescription, setNewPrescription] = useState({
    patient_id: "",
    medication_name: "",
    generic_name: "",
    dosage: "",
    quantity: 30,
    refills: 0,
    directions: "",
    pharmacy_id: "",
    notes: "",
  })

  const [newPharmacy, setNewPharmacy] = useState({
    name: "",
    address: "",
    phone: "",
    npi: "",
    fax: "",
    email: "",
    is_preferred: false,
  })

  useEffect(() => {
    loadPrescriptions()
    loadPharmacies()
  }, [])

  const loadPrescriptions = async () => {
    // Mock data - replace with actual API call
    setPrescriptions([
      {
        id: "rx-001",
        patient_id: "pt-001",
        patient_name: "Sarah Johnson",
        prescribed_by: "dr-001",
        prescriber_name: "Dr. Smith",
        medication_name: "Lisinopril",
        generic_name: "Lisinopril",
        dosage: "10mg tablets",
        quantity: 30,
        refills: 3,
        directions: "Take one tablet by mouth once daily",
        pharmacy_name: "CVS Pharmacy",
        pharmacy_address: "123 Main St, Rochester, NY 14604",
        pharmacy_phone: "(555) 123-4567",
        pharmacy_npi: "1234567890",
        prescription_number: "RX2024001",
        status: "filled",
        prescribed_date: "2024-01-15T08:00:00Z",
        sent_date: "2024-01-15T08:30:00Z",
        filled_date: "2024-01-15T14:20:00Z",
        notes: "Patient tolerating well",
        created_at: "2024-01-15T08:00:00Z",
        updated_at: "2024-01-15T14:20:00Z",
      },
      {
        id: "rx-002",
        patient_id: "pt-001",
        patient_name: "Sarah Johnson",
        prescribed_by: "dr-002",
        prescriber_name: "Dr. Wilson",
        medication_name: "Sertraline",
        generic_name: "Sertraline HCl",
        dosage: "50mg tablets",
        quantity: 30,
        refills: 5,
        directions: "Take one tablet by mouth once daily with food",
        pharmacy_name: "Walgreens",
        pharmacy_address: "456 Oak Ave, Rochester, NY 14605",
        pharmacy_phone: "(555) 987-6543",
        status: "sent",
        prescribed_date: "2024-01-16T09:00:00Z",
        sent_date: "2024-01-16T09:15:00Z",
        notes: "Monitor for side effects",
        created_at: "2024-01-16T09:00:00Z",
        updated_at: "2024-01-16T09:15:00Z",
      },
      {
        id: "rx-003",
        patient_id: "pt-002",
        patient_name: "Michael Chen",
        prescribed_by: "dr-001",
        prescriber_name: "Dr. Smith",
        medication_name: "Ibuprofen",
        generic_name: "Ibuprofen",
        dosage: "400mg tablets",
        quantity: 60,
        refills: 2,
        directions: "Take one tablet by mouth every 6-8 hours as needed for pain. Do not exceed 3 tablets per day.",
        status: "pending",
        prescribed_date: "2024-01-17T10:00:00Z",
        notes: "Short-term use only",
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      },
    ])
  }

  const loadPharmacies = async () => {
    // Mock data - replace with actual API call
    setPharmacies([
      {
        id: "pharm-001",
        name: "CVS Pharmacy",
        address: "123 Main St, Rochester, NY 14604",
        phone: "(555) 123-4567",
        npi: "1234567890",
        fax: "(555) 123-4568",
        email: "pharmacy@cvs.com",
        is_preferred: true,
      },
      {
        id: "pharm-002",
        name: "Walgreens",
        address: "456 Oak Ave, Rochester, NY 14605",
        phone: "(555) 987-6543",
        npi: "0987654321",
        fax: "(555) 987-6544",
        is_preferred: true,
      },
      {
        id: "pharm-003",
        name: "Rite Aid",
        address: "789 Elm St, Rochester, NY 14606",
        phone: "(555) 555-0123",
        npi: "1122334455",
        is_preferred: false,
      },
    ])
  }

  const handleCreatePrescription = async () => {
    if (!hasPermission(PERMISSIONS.MEDICATIONS_PRESCRIBE)) {
      alert("You don't have permission to prescribe medications")
      return
    }

    try {
      const selectedPharmacy = pharmacies.find((p) => p.id === newPrescription.pharmacy_id)

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPrescription,
          prescribed_by: user?.id,
          pharmacy_name: selectedPharmacy?.name,
          pharmacy_address: selectedPharmacy?.address,
          pharmacy_phone: selectedPharmacy?.phone,
          pharmacy_npi: selectedPharmacy?.npi,
        }),
      })

      if (response.ok) {
        loadPrescriptions()
        setShowNewDialog(false)
        setNewPrescription({
          patient_id: "",
          medication_name: "",
          generic_name: "",
          dosage: "",
          quantity: 30,
          refills: 0,
          directions: "",
          pharmacy_id: "",
          notes: "",
        })
      }
    } catch (error) {
      console.error("Failed to create prescription:", error)
    }
  }

  const handleSendPrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        loadPrescriptions()
        alert("Prescription sent successfully")
      }
    } catch (error) {
      console.error("Failed to send prescription:", error)
    }
  }

  const handleCancelPrescription = async (prescriptionId: string, reason: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        loadPrescriptions()
      }
    } catch (error) {
      console.error("Failed to cancel prescription:", error)
    }
  }

  const handleAddPharmacy = async () => {
    try {
      const response = await fetch("/api/pharmacies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPharmacy),
      })

      if (response.ok) {
        loadPharmacies()
        setShowPharmacyDialog(false)
        setNewPharmacy({
          name: "",
          address: "",
          phone: "",
          npi: "",
          fax: "",
          email: "",
          is_preferred: false,
        })
      }
    } catch (error) {
      console.error("Failed to add pharmacy:", error)
    }
  }

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.prescriber_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rx.prescription_number && rx.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTab = activeTab === "all" || rx.status === activeTab

    const matchesPatient = selectedPatient === "all" || rx.patient_id === selectedPatient

    return matchesSearch && matchesTab && matchesPatient
  })

  const getStatusIcon = (status: Prescription["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "sent":
        return <Send className="w-4 h-4" />
      case "filled":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      case "expired":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusVariant = (status: Prescription["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "sent":
        return "default"
      case "filled":
        return "default"
      case "cancelled":
        return "destructive"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescription Management</h1>
          <p className="text-muted-foreground">Create, send, and track electronic prescriptions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPharmacyDialog} onOpenChange={setShowPharmacyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Add Pharmacy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Pharmacy</DialogTitle>
                <DialogDescription>Add a pharmacy to the preferred pharmacy list</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
                  <Input
                    id="pharmacy-name"
                    value={newPharmacy.name}
                    onChange={(e) => setNewPharmacy((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Pharmacy name"
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacy-address">Address</Label>
                  <Input
                    id="pharmacy-address"
                    value={newPharmacy.address}
                    onChange={(e) => setNewPharmacy((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacy-phone">Phone</Label>
                    <Input
                      id="pharmacy-phone"
                      value={newPharmacy.phone}
                      onChange={(e) => setNewPharmacy((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pharmacy-npi">NPI Number</Label>
                    <Input
                      id="pharmacy-npi"
                      value={newPharmacy.npi}
                      onChange={(e) => setNewPharmacy((prev) => ({ ...prev, npi: e.target.value }))}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <Button onClick={handleAddPharmacy} className="w-full">
                  Add Pharmacy
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <RoleGuard requiredPermissions={[PERMISSIONS.MEDICATIONS_PRESCRIBE]}>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                  <DialogDescription>Create and send an electronic prescription</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select
                        value={newPrescription.patient_id}
                        onValueChange={(value) => setNewPrescription((prev) => ({ ...prev, patient_id: value }))}
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
                      <Label htmlFor="pharmacy">Pharmacy</Label>
                      <Select
                        value={newPrescription.pharmacy_id}
                        onValueChange={(value) => setNewPrescription((prev) => ({ ...prev, pharmacy_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pharmacy" />
                        </SelectTrigger>
                        <SelectContent>
                          {pharmacies.map((pharmacy) => (
                            <SelectItem key={pharmacy.id} value={pharmacy.id}>
                              {pharmacy.name} {pharmacy.is_preferred && "⭐"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medication-name">Medication Name</Label>
                      <Input
                        id="medication-name"
                        value={newPrescription.medication_name}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, medication_name: e.target.value }))}
                        placeholder="Brand name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="generic-name">Generic Name</Label>
                      <Input
                        id="generic-name"
                        value={newPrescription.generic_name}
                        onChange={(e) => setNewPrescription((prev) => ({ ...prev, generic_name: e.target.value }))}
                        placeholder="Generic name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dosage">Dosage & Form</Label>
                    <Input
                      id="dosage"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg tablets"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newPrescription.quantity}
                        onChange={(e) =>
                          setNewPrescription((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 30 }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="refills">Refills</Label>
                      <Select
                        value={newPrescription.refills.toString()}
                        onValueChange={(value) =>
                          setNewPrescription((prev) => ({ ...prev, refills: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 refills</SelectItem>
                          <SelectItem value="1">1 refill</SelectItem>
                          <SelectItem value="2">2 refills</SelectItem>
                          <SelectItem value="3">3 refills</SelectItem>
                          <SelectItem value="4">4 refills</SelectItem>
                          <SelectItem value="5">5 refills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="directions">Directions for Use</Label>
                    <Textarea
                      id="directions"
                      value={newPrescription.directions}
                      onChange={(e) => setNewPrescription((prev) => ({ ...prev, directions: e.target.value }))}
                      placeholder="Take one tablet by mouth once daily..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Clinical Notes</Label>
                    <Textarea
                      id="notes"
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional clinical notes..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreatePrescription} className="flex-1">
                      Create & Send Prescription
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Save as draft functionality
                        alert("Draft saved")
                      }}
                    >
                      Save as Draft
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </RoleGuard>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search prescriptions, patients, or medications..."
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="filled">Filled</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        {prescription.medication_name}
                        {prescription.generic_name && prescription.generic_name !== prescription.medication_name && (
                          <span className="text-sm text-muted-foreground">({prescription.generic_name})</span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        <User className="w-4 h-4 inline mr-1" />
                        {prescription.patient_name} • Prescribed by {prescription.prescriber_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(prescription.status)} className="flex items-center gap-1">
                        {getStatusIcon(prescription.status)}
                        {prescription.status}
                      </Badge>
                      {prescription.prescription_number && (
                        <Badge variant="outline">#{prescription.prescription_number}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Prescription Details</div>
                      <div className="text-sm text-muted-foreground">
                        {prescription.dosage} • Qty: {prescription.quantity} • Refills: {prescription.refills}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Pharmacy</div>
                      <div className="text-sm text-muted-foreground">
                        {prescription.pharmacy_name || "No pharmacy selected"}
                        {prescription.pharmacy_phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {prescription.pharmacy_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Timeline</div>
                      <div className="text-sm text-muted-foreground">
                        Prescribed: {new Date(prescription.prescribed_date).toLocaleDateString()}
                        {prescription.sent_date && (
                          <div>Sent: {new Date(prescription.sent_date).toLocaleDateString()}</div>
                        )}
                        {prescription.filled_date && (
                          <div>Filled: {new Date(prescription.filled_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Directions</div>
                    <div className="text-sm text-muted-foreground">{prescription.directions}</div>
                  </div>

                  {prescription.notes && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Clinical Notes</div>
                      <div className="text-sm text-muted-foreground">{prescription.notes}</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(prescription.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {prescription.status === "pending" && (
                        <RoleGuard requiredPermissions={[PERMISSIONS.MEDICATIONS_PRESCRIBE]}>
                          <Button size="sm" onClick={() => handleSendPrescription(prescription.id)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Pharmacy
                          </Button>
                        </RoleGuard>
                      )}

                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>

                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>

                      {(prescription.status === "pending" || prescription.status === "sent") && (
                        <RoleGuard requiredPermissions={[PERMISSIONS.MEDICATIONS_PRESCRIBE]}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Reason for cancellation:")
                              if (reason) {
                                handleCancelPrescription(prescription.id, reason)
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </RoleGuard>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPrescriptions.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No prescriptions found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
