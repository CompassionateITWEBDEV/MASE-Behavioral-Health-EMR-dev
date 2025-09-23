"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building2, Plus, Edit, Trash2, Phone, Mail, MapPin, Search } from "lucide-react"

interface InsurancePayer {
  id: string
  payerName: string
  payerId: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  billingAddress?: string
  electronicPayerId?: string
  claimSubmissionMethod: string
  priorAuthRequired: boolean
  networkType: string
  isActive: boolean
}

const mockPayers: InsurancePayer[] = [
  {
    id: "1",
    payerName: "Blue Cross Blue Shield",
    payerId: "BCBS001",
    contactName: "Provider Relations",
    contactPhone: "(800) 555-0001",
    contactEmail: "provider@bcbs.com",
    billingAddress: "123 Insurance Way, Detroit, MI 48201",
    electronicPayerId: "BCBS",
    claimSubmissionMethod: "electronic",
    priorAuthRequired: true,
    networkType: "in-network",
    isActive: true,
  },
  {
    id: "2",
    payerName: "Aetna",
    payerId: "AETNA001",
    contactName: "Provider Services",
    contactPhone: "(800) 555-0002",
    contactEmail: "provider@aetna.com",
    billingAddress: "456 Healthcare Blvd, Grand Rapids, MI 49503",
    electronicPayerId: "AETNA",
    claimSubmissionMethod: "electronic",
    priorAuthRequired: false,
    networkType: "in-network",
    isActive: true,
  },
  {
    id: "3",
    payerName: "UnitedHealthcare",
    payerId: "UHC001",
    contactName: "Provider Network",
    contactPhone: "(800) 555-0003",
    contactEmail: "provider@uhc.com",
    billingAddress: "789 Medical Center Dr, Ann Arbor, MI 48104",
    electronicPayerId: "UHC",
    claimSubmissionMethod: "electronic",
    priorAuthRequired: true,
    networkType: "in-network",
    isActive: true,
  },
]

export function InsurancePayerManagement() {
  const [payers, setPayers] = useState<InsurancePayer[]>(mockPayers)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPayer, setEditingPayer] = useState<InsurancePayer | null>(null)
  const [newPayer, setNewPayer] = useState<Partial<InsurancePayer>>({
    payerName: "",
    payerId: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    billingAddress: "",
    electronicPayerId: "",
    claimSubmissionMethod: "electronic",
    priorAuthRequired: false,
    networkType: "in-network",
    isActive: true,
  })

  const filteredPayers = payers.filter(
    (payer) =>
      payer.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payer.payerId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPayer = () => {
    const payer: InsurancePayer = {
      id: Date.now().toString(),
      payerName: newPayer.payerName || "",
      payerId: newPayer.payerId || "",
      contactName: newPayer.contactName,
      contactPhone: newPayer.contactPhone,
      contactEmail: newPayer.contactEmail,
      billingAddress: newPayer.billingAddress,
      electronicPayerId: newPayer.electronicPayerId,
      claimSubmissionMethod: newPayer.claimSubmissionMethod || "electronic",
      priorAuthRequired: newPayer.priorAuthRequired || false,
      networkType: newPayer.networkType || "in-network",
      isActive: newPayer.isActive !== false,
    }

    setPayers([...payers, payer])
    setNewPayer({
      payerName: "",
      payerId: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      billingAddress: "",
      electronicPayerId: "",
      claimSubmissionMethod: "electronic",
      priorAuthRequired: false,
      networkType: "in-network",
      isActive: true,
    })
    setShowAddForm(false)
  }

  const handleEditPayer = (payer: InsurancePayer) => {
    setEditingPayer(payer)
    setNewPayer(payer)
    setShowAddForm(true)
  }

  const handleUpdatePayer = () => {
    if (!editingPayer) return

    setPayers(payers.map((p) => (p.id === editingPayer.id ? ({ ...editingPayer, ...newPayer } as InsurancePayer) : p)))
    setEditingPayer(null)
    setNewPayer({
      payerName: "",
      payerId: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      billingAddress: "",
      electronicPayerId: "",
      claimSubmissionMethod: "electronic",
      priorAuthRequired: false,
      networkType: "in-network",
      isActive: true,
    })
    setShowAddForm(false)
  }

  const handleDeletePayer = (payerId: string) => {
    setPayers(payers.filter((p) => p.id !== payerId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Insurance Payer Management</h2>
          <p className="text-muted-foreground">Manage insurance companies and billing information</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Payer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payers by name or ID..."
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
            <CardTitle>{editingPayer ? "Edit" : "Add New"} Insurance Payer</CardTitle>
            <CardDescription>{editingPayer ? "Update" : "Enter"} the insurance payer information below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payerName">Payer Name *</Label>
                <Input
                  id="payerName"
                  value={newPayer.payerName}
                  onChange={(e) => setNewPayer({ ...newPayer, payerName: e.target.value })}
                  placeholder="Blue Cross Blue Shield"
                />
              </div>
              <div>
                <Label htmlFor="payerId">Payer ID *</Label>
                <Input
                  id="payerId"
                  value={newPayer.payerId}
                  onChange={(e) => setNewPayer({ ...newPayer, payerId: e.target.value })}
                  placeholder="BCBS001"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={newPayer.contactName}
                  onChange={(e) => setNewPayer({ ...newPayer, contactName: e.target.value })}
                  placeholder="Provider Relations"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={newPayer.contactPhone}
                  onChange={(e) => setNewPayer({ ...newPayer, contactPhone: e.target.value })}
                  placeholder="(800) 555-0000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newPayer.contactEmail}
                  onChange={(e) => setNewPayer({ ...newPayer, contactEmail: e.target.value })}
                  placeholder="provider@insurance.com"
                />
              </div>
              <div>
                <Label htmlFor="electronicPayerId">Electronic Payer ID</Label>
                <Input
                  id="electronicPayerId"
                  value={newPayer.electronicPayerId}
                  onChange={(e) => setNewPayer({ ...newPayer, electronicPayerId: e.target.value })}
                  placeholder="BCBS"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={newPayer.billingAddress}
                onChange={(e) => setNewPayer({ ...newPayer, billingAddress: e.target.value })}
                placeholder="123 Insurance Way, City, State ZIP"
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="claimSubmissionMethod">Claim Submission</Label>
                <Select
                  value={newPayer.claimSubmissionMethod}
                  onValueChange={(value) => setNewPayer({ ...newPayer, claimSubmissionMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="paper">Paper</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="networkType">Network Type</Label>
                <Select
                  value={newPayer.networkType}
                  onValueChange={(value) => setNewPayer({ ...newPayer, networkType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-network">In-Network</SelectItem>
                    <SelectItem value="out-of-network">Out-of-Network</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="priorAuthRequired"
                  checked={newPayer.priorAuthRequired}
                  onCheckedChange={(checked) => setNewPayer({ ...newPayer, priorAuthRequired: checked })}
                />
                <Label htmlFor="priorAuthRequired">Prior Auth Required</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newPayer.isActive}
                onCheckedChange={(checked) => setNewPayer({ ...newPayer, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Payer</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingPayer ? handleUpdatePayer : handleAddPayer}
                className="bg-primary hover:bg-primary/90"
              >
                {editingPayer ? "Update" : "Add"} Payer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingPayer(null)
                  setNewPayer({
                    payerName: "",
                    payerId: "",
                    contactName: "",
                    contactPhone: "",
                    contactEmail: "",
                    billingAddress: "",
                    electronicPayerId: "",
                    claimSubmissionMethod: "electronic",
                    priorAuthRequired: false,
                    networkType: "in-network",
                    isActive: true,
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payers List */}
      <div className="grid gap-4">
        {filteredPayers.map((payer) => (
          <Card key={payer.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{payer.payerName}</h3>
                    <Badge variant="outline">{payer.payerId}</Badge>
                    <Badge variant={payer.isActive ? "default" : "secondary"}>
                      {payer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    {payer.contactName && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Contact:</span>
                        <span>{payer.contactName}</span>
                      </div>
                    )}
                    {payer.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{payer.contactPhone}</span>
                      </div>
                    )}
                    {payer.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{payer.contactEmail}</span>
                      </div>
                    )}
                    {payer.billingAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{payer.billingAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-3 text-sm">
                    <Badge variant="outline">{payer.claimSubmissionMethod}</Badge>
                    <Badge variant="outline">{payer.networkType}</Badge>
                    {payer.priorAuthRequired && <Badge variant="destructive">Prior Auth Required</Badge>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPayer(payer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeletePayer(payer.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No payers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Add your first insurance payer to get started."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
