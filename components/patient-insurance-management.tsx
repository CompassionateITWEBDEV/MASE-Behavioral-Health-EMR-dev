"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, Search, CreditCard, Calendar } from "lucide-react"

interface PatientInsurance {
  id: string
  patientId: string
  patientName: string
  payerName: string
  policyNumber: string
  groupNumber?: string
  subscriberName?: string
  relationshipToSubscriber: string
  effectiveDate: string
  terminationDate?: string
  copayAmount?: number
  deductibleAmount?: number
  priorityOrder: number
  isActive: boolean
}

const mockPatientInsurance: PatientInsurance[] = [
  {
    id: "1",
    patientId: "pat001",
    patientName: "Sarah Johnson",
    payerName: "Blue Cross Blue Shield",
    policyNumber: "BCM123456789",
    groupNumber: "GRP001234",
    subscriberName: "Sarah Johnson",
    relationshipToSubscriber: "self",
    effectiveDate: "2024-01-01",
    copayAmount: 25,
    deductibleAmount: 500,
    priorityOrder: 1,
    isActive: true,
  },
  {
    id: "2",
    patientId: "pat002",
    patientName: "Michael Chen",
    payerName: "Aetna",
    policyNumber: "AET987654321",
    groupNumber: "GRP005678",
    subscriberName: "Michael Chen",
    relationshipToSubscriber: "self",
    effectiveDate: "2024-03-15",
    copayAmount: 30,
    deductibleAmount: 750,
    priorityOrder: 1,
    isActive: true,
  },
  {
    id: "3",
    patientId: "pat003",
    patientName: "Emily Rodriguez",
    payerName: "UnitedHealthcare",
    policyNumber: "UHC456789123",
    subscriberName: "Carlos Rodriguez",
    relationshipToSubscriber: "spouse",
    effectiveDate: "2024-02-01",
    terminationDate: "2024-12-31",
    copayAmount: 20,
    deductibleAmount: 1000,
    priorityOrder: 1,
    isActive: false,
  },
]

export function PatientInsuranceManagement() {
  const [patientInsurance, setPatientInsurance] = useState<PatientInsurance[]>(mockPatientInsurance)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInsurance, setEditingInsurance] = useState<PatientInsurance | null>(null)
  const [newInsurance, setNewInsurance] = useState<Partial<PatientInsurance>>({
    patientName: "",
    payerName: "",
    policyNumber: "",
    groupNumber: "",
    subscriberName: "",
    relationshipToSubscriber: "self",
    effectiveDate: "",
    terminationDate: "",
    copayAmount: 0,
    deductibleAmount: 0,
    priorityOrder: 1,
    isActive: true,
  })

  const filteredInsurance = patientInsurance.filter(
    (insurance) =>
      insurance.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddInsurance = () => {
    const insurance: PatientInsurance = {
      id: Date.now().toString(),
      patientId: `pat${Date.now()}`,
      patientName: newInsurance.patientName || "",
      payerName: newInsurance.payerName || "",
      policyNumber: newInsurance.policyNumber || "",
      groupNumber: newInsurance.groupNumber,
      subscriberName: newInsurance.subscriberName,
      relationshipToSubscriber: newInsurance.relationshipToSubscriber || "self",
      effectiveDate: newInsurance.effectiveDate || "",
      terminationDate: newInsurance.terminationDate,
      copayAmount: newInsurance.copayAmount,
      deductibleAmount: newInsurance.deductibleAmount,
      priorityOrder: newInsurance.priorityOrder || 1,
      isActive: newInsurance.isActive !== false,
    }

    setPatientInsurance([...patientInsurance, insurance])
    resetForm()
  }

  const handleEditInsurance = (insurance: PatientInsurance) => {
    setEditingInsurance(insurance)
    setNewInsurance(insurance)
    setShowAddForm(true)
  }

  const handleUpdateInsurance = () => {
    if (!editingInsurance) return

    setPatientInsurance(
      patientInsurance.map((ins) =>
        ins.id === editingInsurance.id ? ({ ...editingInsurance, ...newInsurance } as PatientInsurance) : ins,
      ),
    )
    setEditingInsurance(null)
    resetForm()
  }

  const handleDeleteInsurance = (insuranceId: string) => {
    setPatientInsurance(patientInsurance.filter((ins) => ins.id !== insuranceId))
  }

  const resetForm = () => {
    setNewInsurance({
      patientName: "",
      payerName: "",
      policyNumber: "",
      groupNumber: "",
      subscriberName: "",
      relationshipToSubscriber: "self",
      effectiveDate: "",
      terminationDate: "",
      copayAmount: 0,
      deductibleAmount: 0,
      priorityOrder: 1,
      isActive: true,
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Patient Insurance Management</h2>
          <p className="text-muted-foreground">Manage patient insurance coverage and benefits</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient Insurance
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, payer, or policy number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingInsurance ? "Edit" : "Add"} Patient Insurance</CardTitle>
            <CardDescription>{editingInsurance ? "Update" : "Enter"} patient insurance information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={newInsurance.patientName}
                  onChange={(e) => setNewInsurance({ ...newInsurance, patientName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="payerName">Insurance Payer *</Label>
                <Select
                  value={newInsurance.payerName}
                  onValueChange={(value) => setNewInsurance({ ...newInsurance, payerName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                    <SelectItem value="Aetna">Aetna</SelectItem>
                    <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                    <SelectItem value="Cigna">Cigna</SelectItem>
                    <SelectItem value="Medicare">Medicare</SelectItem>
                    <SelectItem value="Medicaid">Medicaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={newInsurance.policyNumber}
                  onChange={(e) => setNewInsurance({ ...newInsurance, policyNumber: e.target.value })}
                  placeholder="Policy number"
                />
              </div>
              <div>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  value={newInsurance.groupNumber}
                  onChange={(e) => setNewInsurance({ ...newInsurance, groupNumber: e.target.value })}
                  placeholder="Group number"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="subscriberName">Subscriber Name</Label>
                <Input
                  id="subscriberName"
                  value={newInsurance.subscriberName}
                  onChange={(e) => setNewInsurance({ ...newInsurance, subscriberName: e.target.value })}
                  placeholder="Primary subscriber name"
                />
              </div>
              <div>
                <Label htmlFor="relationshipToSubscriber">Relationship to Subscriber</Label>
                <Select
                  value={newInsurance.relationshipToSubscriber}
                  onValueChange={(value) => setNewInsurance({ ...newInsurance, relationshipToSubscriber: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="effectiveDate">Effective Date *</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={newInsurance.effectiveDate}
                  onChange={(e) => setNewInsurance({ ...newInsurance, effectiveDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="terminationDate">Termination Date</Label>
                <Input
                  id="terminationDate"
                  type="date"
                  value={newInsurance.terminationDate}
                  onChange={(e) => setNewInsurance({ ...newInsurance, terminationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="copayAmount">Copay Amount ($)</Label>
                <Input
                  id="copayAmount"
                  type="number"
                  value={newInsurance.copayAmount}
                  onChange={(e) =>
                    setNewInsurance({ ...newInsurance, copayAmount: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="25.00"
                />
              </div>
              <div>
                <Label htmlFor="deductibleAmount">Deductible Amount ($)</Label>
                <Input
                  id="deductibleAmount"
                  type="number"
                  value={newInsurance.deductibleAmount}
                  onChange={(e) =>
                    setNewInsurance({ ...newInsurance, deductibleAmount: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="500.00"
                />
              </div>
              <div>
                <Label htmlFor="priorityOrder">Priority Order</Label>
                <Select
                  value={newInsurance.priorityOrder?.toString()}
                  onValueChange={(value) => setNewInsurance({ ...newInsurance, priorityOrder: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primary (1)</SelectItem>
                    <SelectItem value="2">Secondary (2)</SelectItem>
                    <SelectItem value="3">Tertiary (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newInsurance.isActive}
                onCheckedChange={(checked) => setNewInsurance({ ...newInsurance, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Coverage</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingInsurance ? handleUpdateInsurance : handleAddInsurance}
                className="bg-primary hover:bg-primary/90"
              >
                {editingInsurance ? "Update" : "Add"} Insurance
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance List */}
      <div className="grid gap-4">
        {filteredInsurance.map((insurance) => (
          <Card key={insurance.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{insurance.patientName}</h3>
                    <Badge variant={insurance.priorityOrder === 1 ? "default" : "secondary"}>
                      {insurance.priorityOrder === 1
                        ? "Primary"
                        : insurance.priorityOrder === 2
                          ? "Secondary"
                          : "Tertiary"}
                    </Badge>
                    <Badge variant={insurance.isActive ? "default" : "destructive"}>
                      {insurance.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{insurance.payerName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Policy:</span> {insurance.policyNumber}
                    </div>
                    {insurance.groupNumber && (
                      <div>
                        <span className="font-medium">Group:</span> {insurance.groupNumber}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Subscriber:</span> {insurance.subscriberName || "N/A"}
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Effective: {insurance.effectiveDate}</span>
                    </div>
                    {insurance.terminationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Expires: {insurance.terminationDate}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Relationship:</span> {insurance.relationshipToSubscriber}
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm">
                    {insurance.copayAmount && <Badge variant="outline">Copay: ${insurance.copayAmount}</Badge>}
                    {insurance.deductibleAmount && (
                      <Badge variant="outline">Deductible: ${insurance.deductibleAmount}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditInsurance(insurance)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteInsurance(insurance.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsurance.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No patient insurance found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Add patient insurance coverage to get started."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
