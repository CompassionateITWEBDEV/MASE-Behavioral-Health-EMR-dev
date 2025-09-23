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
import { AlertCircle, Plus, Search, Send, FileText, Clock, CheckCircle } from "lucide-react"

interface Prescription {
  id: string
  patientName: string
  medicationName: string
  strength: string
  quantity: number
  daysSupply: number
  refills: number
  status: "pending" | "sent" | "filled" | "cancelled"
  prescribedDate: string
  pharmacyName?: string
}

export function EPrescribingDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPrescriptions: Prescription[] = [
      {
        id: "1",
        patientName: "John Smith",
        medicationName: "Suboxone",
        strength: "8mg/2mg",
        quantity: 30,
        daysSupply: 30,
        refills: 0,
        status: "sent",
        prescribedDate: "2024-01-15",
        pharmacyName: "CVS Pharmacy",
      },
      {
        id: "2",
        patientName: "Sarah Johnson",
        medicationName: "Naltrexone",
        strength: "50mg",
        quantity: 30,
        daysSupply: 30,
        refills: 2,
        status: "filled",
        prescribedDate: "2024-01-14",
        pharmacyName: "Walgreens",
      },
      {
        id: "3",
        patientName: "Mike Davis",
        medicationName: "Clonidine",
        strength: "0.1mg",
        quantity: 60,
        daysSupply: 30,
        refills: 1,
        status: "pending",
        prescribedDate: "2024-01-16",
      },
    ]
    setPrescriptions(mockPrescriptions)
  }, [])

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

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingCount = prescriptions.filter((p) => p.status === "pending").length
  const sentCount = prescriptions.filter((p) => p.status === "sent").length
  const filledCount = prescriptions.filter((p) => p.status === "filled").length

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
                    <NewPrescriptionForm onClose={() => setIsNewPrescriptionOpen(false)} />
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
                            <Button size="sm">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulary">
          <Card>
            <CardHeader>
              <CardTitle>Drug Formulary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Drug formulary search and preferred medications will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Drug Interaction Checker</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Drug interaction checking tools will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NewPrescriptionForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    medicationName: "",
    strength: "",
    dosageForm: "",
    quantity: "",
    daysSupply: "",
    directions: "",
    refills: "0",
    pharmacyId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle prescription creation
    console.log("Creating prescription:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Sarah Johnson</SelectItem>
              <SelectItem value="3">Mike Davis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="medication">Medication</Label>
          <Input
            id="medication"
            value={formData.medicationName}
            onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
            placeholder="Search medications..."
          />
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
          <Label htmlFor="quantity">Quantity</Label>
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
            value={formData.pharmacyId}
            onValueChange={(value) => setFormData({ ...formData, pharmacyId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pharmacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">CVS Pharmacy</SelectItem>
              <SelectItem value="2">Walgreens</SelectItem>
              <SelectItem value="3">Rite Aid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Prescription</Button>
      </div>
    </form>
  )
}
