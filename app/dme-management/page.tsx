"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Truck, Building2, FileCheck, AlertCircle, Zap, Brain } from "lucide-react"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DMEManagementPage() {
  const { data, error, isLoading } = useSWR("/api/dme", fetcher)
  const { data: suppliersData } = useSWR("/api/dme?action=suppliers", fetcher)
  const { data: ordersData } = useSWR("/api/dme?action=orders", fetcher)
  const { data: integrationData } = useSWR("/api/dme/integrations", fetcher)

  const [newSupplierOpen, setNewSupplierOpen] = useState(false)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [parachuteOrderOpen, setParachuteOrderOpen] = useState(false)
  const [verseOrderOpen, setVerseOrderOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    supplierName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    npi: "",
    specialties: [] as string[],
  })

  // New Order Form
  const [orderForm, setOrderForm] = useState({
    patientId: "",
    providerId: "",
    supplierId: "",
    urgency: "Routine",
    equipmentCategory: "",
    equipmentName: "",
    hcpcsCode: "",
    quantity: 1,
    rentalOrPurchase: "Purchase",
    diagnosisCodes: "",
    clinicalIndication: "",
    priorAuthRequired: false,
    deliveryAddress: "",
  })

  // Parachute Order Form
  const [parachuteForm, setParachuteForm] = useState({
    patientId: "",
    providerId: "",
    productSearchQuery: "",
    selectedProducts: [],
    deliveryAddress: "",
  })

  // Verse Order Form
  const [verseForm, setVerseForm] = useState({
    patientId: "",
    providerId: "",
    medicalRecordFile: null,
    autoExtract: true,
  })

  const handleCreateSupplier = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/dme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-supplier",
          ...supplierForm,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("DME supplier added successfully")
        setNewSupplierOpen(false)
        mutate("/api/dme?action=suppliers")
        setSupplierForm({
          supplierName: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          npi: "",
          specialties: [],
        })
      } else {
        toast.error(result.error || "Failed to add supplier")
      }
    } catch (error) {
      console.error("[v0] Error creating supplier:", error)
      toast.error("Failed to add supplier")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!orderForm.patientId || !orderForm.providerId || !orderForm.equipmentName) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/dme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-order",
          ...orderForm,
          diagnosisCodes: orderForm.diagnosisCodes
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("DME order created successfully")
        setNewOrderOpen(false)
        mutate("/api/dme?action=orders")
        setOrderForm({
          patientId: "",
          providerId: "",
          supplierId: "",
          urgency: "Routine",
          equipmentCategory: "",
          equipmentName: "",
          hcpcsCode: "",
          quantity: 1,
          rentalOrPurchase: "Purchase",
          diagnosisCodes: "",
          clinicalIndication: "",
          priorAuthRequired: false,
          deliveryAddress: "",
        })
      } else {
        toast.error(result.error || "Failed to create order")
      }
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      toast.error("Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  const handleParachuteOrder = async () => {
    if (!parachuteForm.patientId || !parachuteForm.productSearchQuery) {
      toast.error("Please fill in required fields")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/dme/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_parachute_order",
          orderData: parachuteForm,
        }),
      })

      const result = await response.json()

      if (result.order) {
        toast.success("Parachute order created - ready to submit to supplier")
        setParachuteOrderOpen(false)
        mutate("/api/dme/integrations")
      } else {
        toast.error("Failed to create Parachute order")
      }
    } catch (error) {
      console.error("[v0] Error creating Parachute order:", error)
      toast.error("Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerseOrder = async () => {
    if (!verseForm.patientId) {
      toast.error("Please select a patient")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/dme/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_verse_order",
          orderData: verseForm,
        }),
      })

      const result = await response.json()

      if (result.order) {
        toast.success("Verse AI order created - medical records being processed")
        setVerseOrderOpen(false)
        mutate("/api/dme/integrations")
      } else {
        toast.error("Failed to create Verse order")
      }
    } catch (error) {
      console.error("[v0] Error creating Verse order:", error)
      toast.error("Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading)
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    )
  if (error)
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-8">Error loading DME data</div>
      </div>
    )

  const stats = data?.stats || { pending: 0, in_process: 0, delivered: 0, total: 0 }
  const patients = data?.patients || []
  const providers = data?.providers || []
  const suppliers = suppliersData?.suppliers || []
  const orders = ordersData?.orders || []
  const parachuteOrders = integrationData?.parachuteOrders || []
  const verseOrders = integrationData?.verseOrders || []
  const supplierCatalog = integrationData?.supplierCatalog || []

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">DME Management</h1>
              <p className="text-muted-foreground">Durable Medical Equipment Orders & Suppliers</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={newSupplierOpen} onOpenChange={setNewSupplierOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add DME Supplier</DialogTitle>
                    <DialogDescription>Register a new durable medical equipment supplier</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Supplier Name *</Label>
                        <Input
                          value={supplierForm.supplierName}
                          onChange={(e) => setSupplierForm({ ...supplierForm, supplierName: e.target.value })}
                          placeholder="ABC Medical Equipment"
                        />
                      </div>
                      <div>
                        <Label>Contact Name</Label>
                        <Input
                          value={supplierForm.contactName}
                          onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                          placeholder="John Smith"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={supplierForm.phone}
                          onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={supplierForm.email}
                          onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                          placeholder="contact@supplier.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={supplierForm.city}
                          onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={supplierForm.state}
                          onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label>ZIP</Label>
                        <Input
                          value={supplierForm.zip}
                          onChange={(e) => setSupplierForm({ ...supplierForm, zip: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>NPI Number</Label>
                      <Input
                        value={supplierForm.npi}
                        onChange={(e) => setSupplierForm({ ...supplierForm, npi: e.target.value })}
                        placeholder="1234567890"
                      />
                    </div>
                    <Button onClick={handleCreateSupplier} disabled={submitting}>
                      {submitting ? "Adding..." : "Add Supplier"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New DME Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create DME Order</DialogTitle>
                    <DialogDescription>Order durable medical equipment for a patient</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient *</Label>
                        <Select
                          value={orderForm.patientId}
                          onValueChange={(v) => setOrderForm({ ...orderForm, patientId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name} ({p.patient_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ordering Provider *</Label>
                        <Select
                          value={orderForm.providerId}
                          onValueChange={(v) => setOrderForm({ ...orderForm, providerId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}, {p.credentials}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>DME Supplier</Label>
                        <Select
                          value={orderForm.supplierId}
                          onValueChange={(v) => setOrderForm({ ...orderForm, supplierId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s: any) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.supplier_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Urgency</Label>
                        <Select
                          value={orderForm.urgency}
                          onValueChange={(v) => setOrderForm({ ...orderForm, urgency: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Routine">Routine</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Equipment Category</Label>
                        <Select
                          value={orderForm.equipmentCategory}
                          onValueChange={(v) => setOrderForm({ ...orderForm, equipmentCategory: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mobility">Mobility (Walker, Wheelchair)</SelectItem>
                            <SelectItem value="Respiratory">Respiratory (Nebulizer, Oxygen)</SelectItem>
                            <SelectItem value="Diabetic">Diabetic Supplies</SelectItem>
                            <SelectItem value="CPAP">CPAP/BiPAP</SelectItem>
                            <SelectItem value="Wound Care">Wound Care</SelectItem>
                            <SelectItem value="Hospital Bed">Hospital Bed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Rental or Purchase</Label>
                        <Select
                          value={orderForm.rentalOrPurchase}
                          onValueChange={(v) => setOrderForm({ ...orderForm, rentalOrPurchase: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Purchase">Purchase</SelectItem>
                            <SelectItem value="Rental">Rental</SelectItem>
                            <SelectItem value="Rent-to-Own">Rent-to-Own</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Equipment Name *</Label>
                      <Input
                        value={orderForm.equipmentName}
                        onChange={(e) => setOrderForm({ ...orderForm, equipmentName: e.target.value })}
                        placeholder="e.g., Standard Wheelchair, Portable Oxygen Concentrator"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>HCPCS Code</Label>
                        <Input
                          value={orderForm.hcpcsCode}
                          onChange={(e) => setOrderForm({ ...orderForm, hcpcsCode: e.target.value })}
                          placeholder="E.g., E0601, K0001"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={orderForm.quantity}
                          onChange={(e) =>
                            setOrderForm({ ...orderForm, quantity: Number.parseInt(e.target.value) || 1 })
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>ICD-10 Diagnosis Codes</Label>
                      <Input
                        value={orderForm.diagnosisCodes}
                        onChange={(e) => setOrderForm({ ...orderForm, diagnosisCodes: e.target.value })}
                        placeholder="E.g., M25.561, I50.9 (comma separated)"
                      />
                    </div>

                    <div>
                      <Label>Clinical Indication / Medical Necessity</Label>
                      <Textarea
                        value={orderForm.clinicalIndication}
                        onChange={(e) => setOrderForm({ ...orderForm, clinicalIndication: e.target.value })}
                        placeholder="Describe why this equipment is medically necessary..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Delivery Address</Label>
                      <Textarea
                        value={orderForm.deliveryAddress}
                        onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                        placeholder="Enter delivery address if different from patient's address"
                        rows={2}
                      />
                    </div>

                    <Button onClick={handleCreateOrder} disabled={submitting}>
                      {submitting ? "Creating Order..." : "Create DME Order"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={parachuteOrderOpen} onOpenChange={setParachuteOrderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    Parachute ePrescribe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Parachute Health ePrescribing</DialogTitle>
                    <DialogDescription>
                      Order DME electronically with 14x faster submission and supplier network access
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient *</Label>
                        <Select
                          value={parachuteForm.patientId}
                          onValueChange={(v) => setParachuteForm({ ...parachuteForm, patientId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ordering Provider *</Label>
                        <Select
                          value={parachuteForm.providerId}
                          onValueChange={(v) => setParachuteForm({ ...parachuteForm, providerId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Product Search *</Label>
                      <Input
                        value={parachuteForm.productSearchQuery}
                        onChange={(e) => setParachuteForm({ ...parachuteForm, productSearchQuery: e.target.value })}
                        placeholder="Search 26,000+ products (e.g., wheelchair, CPAP, walker)"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Access to 3,000+ supplier locations nationwide
                      </p>
                    </div>

                    <div>
                      <Label>Delivery Address</Label>
                      <Textarea
                        value={parachuteForm.deliveryAddress}
                        onChange={(e) => setParachuteForm({ ...parachuteForm, deliveryAddress: e.target.value })}
                        placeholder="Patient's delivery address"
                        rows={2}
                      />
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="font-semibold text-sm mb-2">Parachute Benefits:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ 14x faster than fax ordering</li>
                        <li>✓ Real-time order tracking and digital chat with suppliers</li>
                        <li>✓ Auto-fill documentation with eSignature</li>
                        <li>✓ Median delivery in less than 1 day</li>
                      </ul>
                    </div>

                    <Button onClick={handleParachuteOrder} disabled={submitting}>
                      {submitting ? "Creating..." : "Create Parachute ePrescribe Order"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={verseOrderOpen} onOpenChange={setVerseOrderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Brain className="mr-2 h-4 w-4" />
                    Verse AI Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Verse Medical AI Ordering</DialogTitle>
                    <DialogDescription>
                      AI-powered DME ordering with automatic medical record extraction and coverage validation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient *</Label>
                        <Select
                          value={verseForm.patientId}
                          onValueChange={(v) => setVerseForm({ ...verseForm, patientId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ordering Provider *</Label>
                        <Select
                          value={verseForm.providerId}
                          onValueChange={(v) => setVerseForm({ ...verseForm, providerId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                      <h4 className="font-semibold text-sm mb-2">Verse AI Features:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ AI extracts diagnosis and supply orders from medical records</li>
                        <li>✓ Real-time insurance coverage validation</li>
                        <li>✓ Medical necessity validation down to the record level</li>
                        <li>✓ Automatic documentation - submit orders in 1 minute</li>
                        <li>✓ SMS tracking updates for patients</li>
                        <li>✓ 95%+ on-time delivery rate</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm">
                        <strong>How it works:</strong> Verse AI will automatically extract diagnostic information and
                        equipment needs from the patient's medical record, validate insurance coverage, and process the
                        order - eliminating manual data entry.
                      </p>
                    </div>

                    <Button onClick={handleVerseOrder} disabled={submitting}>
                      {submitting ? "Processing..." : "Create Verse AI Order"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Process</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.in_process}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <Truck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.delivered}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileCheck className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">DME Orders</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="parachute">Parachute Health</TabsTrigger>
              <TabsTrigger value="verse">Verse Medical</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent DME Orders</CardTitle>
                  <CardDescription>Track equipment orders and delivery status</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No DME orders yet. Click "New DME Order" to create one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold">{order.equipment_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Patient: {order.patients?.first_name} {order.patients?.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">Order #: {order.order_number}</div>
                            </div>
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "secondary"
                                  : order.status === "delivered"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Category: {order.equipment_category}</div>
                            <div>HCPCS: {order.hcpcs_code || "N/A"}</div>
                            <div>Supplier: {order.dme_suppliers?.supplier_name || "Not assigned"}</div>
                            <div>Order Date: {new Date(order.order_date).toLocaleDateString()}</div>
                            {order.delivery_date && (
                              <div>Delivery Date: {new Date(order.delivery_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DME Suppliers</CardTitle>
                  <CardDescription>Registered equipment suppliers</CardDescription>
                </CardHeader>
                <CardContent>
                  {suppliers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No suppliers registered. Click "Add Supplier" to add one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suppliers.map((supplier: any) => (
                        <div key={supplier.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold">{supplier.supplier_name}</div>
                              <div className="text-sm text-muted-foreground">{supplier.contact_name}</div>
                            </div>
                            {supplier.preferred_status && <Badge>Preferred</Badge>}
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Phone: {supplier.phone}</div>
                            <div>Email: {supplier.email}</div>
                            {supplier.address && (
                              <div>
                                Address: {supplier.address}, {supplier.city}, {supplier.state} {supplier.zip}
                              </div>
                            )}
                            {supplier.npi && <div>NPI: {supplier.npi}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parachute" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parachute Health ePrescribing</CardTitle>
                  <CardDescription>
                    Digital DME ordering platform with 3,000+ supplier locations and 26,000+ products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parachuteOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Zap className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>No Parachute orders yet</p>
                        <p className="text-sm">Create your first ePrescribe order above</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {parachuteOrders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">
                                  {order.patients?.first_name} {order.patients?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">Order #{order.parachute_order_id}</p>
                              </div>
                              <Badge variant={order.order_status === "delivered" ? "default" : "secondary"}>
                                {order.order_status}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">
                              <strong>Supplier:</strong> {order.supplier_name || "Not assigned"}
                            </p>
                            {order.tracking_number && (
                              <p className="text-sm text-muted-foreground">Tracking: {order.tracking_number}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verse" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verse Medical AI Orders</CardTitle>
                  <CardDescription>
                    AI-powered ordering with automatic medical record extraction and coverage validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verseOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Brain className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>No Verse AI orders yet</p>
                        <p className="text-sm">Create your first AI-powered order above</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {verseOrders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">
                                  {order.patients?.first_name} {order.patients?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">Verse Order #{order.verse_order_id}</p>
                              </div>
                              <Badge variant={order.order_status === "delivered" ? "default" : "secondary"}>
                                {order.order_status}
                              </Badge>
                            </div>
                            {order.medical_necessity_validated && (
                              <Badge variant="outline" className="mb-2">
                                ✓ Medical Necessity Validated
                              </Badge>
                            )}
                            {order.insurance_coverage_checked && (
                              <p className="text-sm text-green-600 mb-1">✓ Coverage validated</p>
                            )}
                            {order.estimated_patient_cost && (
                              <p className="text-sm">
                                <strong>Est. Patient Cost:</strong> ${order.estimated_patient_cost}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
