"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Calendar, Package, CheckCircle, XCircle, Camera, Scale, User, FileText, Shield, RefreshCw } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TakehomeOrder {
  id: number
  patient_id: number
  patient_name: string
  days: number
  daily_dose_mg: number
  start_date: string
  end_date: string
  risk_level: string
  status: string
  created_at: string
}

interface Patient {
  id: string | number
  name: string
}

export default function TakeHomePage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDays, setSelectedDays] = useState("")
  const [selectedRisk, setSelectedRisk] = useState("")
  const [returnBottleUid, setReturnBottleUid] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [inspectionData, setInspectionData] = useState({
    seal_intact: true,
    residue_ml_est: 0,
    notes: "",
    outcome: "ok",
  })

  // Fetch data using SWR
  const { data: ordersData, error: ordersError, mutate: mutateOrders } = useSWR("/api/takehome/orders", fetcher)
  const { data: patientsData } = useSWR("/api/takehome/patients", fetcher)
  const { data: kitsData, mutate: mutateKits } = useSWR("/api/takehome/kits", fetcher)
  const { data: holdsData, mutate: mutateHolds } = useSWR("/api/takehome/holds", fetcher)

  const orders: TakehomeOrder[] = ordersData?.orders || []
  const patients: Patient[] = patientsData?.patients || []
  const kits = kitsData?.kits || []
  const holds = holdsData?.holds || []

  const isLoading = !ordersData && !ordersError

  const createTakehomeOrder = async () => {
    if (!selectedPatient || !selectedDays || !selectedRisk) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/takehome/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          days: Number.parseInt(selectedDays),
          risk_level: selectedRisk,
          start_date: new Date().toISOString().split("T")[0],
          daily_dose_mg: 80,
        }),
      })

      if (response.ok) {
        mutateOrders()
        setNewOrderOpen(false)
        setSelectedPatient("")
        setSelectedDays("")
        setSelectedRisk("")
      }
    } catch (error) {
      console.error("[v0] Order creation failed:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const issueKit = async (orderId: number) => {
    try {
      const response = await fetch(`/api/takehome/kits/${orderId}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        mutateKits()
        mutateOrders()
      }
    } catch (error) {
      console.error("[v0] Kit issuance failed:", error)
    }
  }

  const handleReturnIntake = async () => {
    if (!returnBottleUid) return

    try {
      const response = await fetch("/api/takehome/returns/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bottle_uid: returnBottleUid,
          ...inspectionData,
        }),
      })

      if (response.ok) {
        mutateKits()
        setReturnBottleUid("")
        setInspectionData({
          seal_intact: true,
          residue_ml_est: 0,
          notes: "",
          outcome: "ok",
        })
      }
    } catch (error) {
      console.error("[v0] Return intake failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Take-Home Management</h1>
              <p className="text-muted-foreground">Manage take-home methadone orders, kits, and compliance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => mutateOrders()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Package className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Take-Home Order</DialogTitle>
                    <DialogDescription>Create a new take-home methadone order for a patient</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Patient</Label>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No patients found
                            </SelectItem>
                          ) : (
                            patients.map((patient) => (
                              <SelectItem key={patient.id} value={String(patient.id)}>
                                {patient.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="days">Days</Label>
                      <Select value={selectedDays} onValueChange={setSelectedDays}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="28">28 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="risk">Risk Level</Label>
                      <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={createTakehomeOrder}
                      disabled={!selectedPatient || !selectedDays || !selectedRisk || isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Order"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="kits">Kits & Returns</TabsTrigger>
              <TabsTrigger value="holds">Compliance Holds</TabsTrigger>
              <TabsTrigger value="intake">Return Intake</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-10 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Take-Home Orders</p>
                    <p className="text-muted-foreground">Create a new order to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {order.patient_name}
                            </CardTitle>
                            <CardDescription>
                              {order.days} days - {order.daily_dose_mg}mg daily - {order.start_date} to {order.end_date}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                order.risk_level === "high"
                                  ? "destructive"
                                  : order.risk_level === "low"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {order.risk_level} risk
                            </Badge>
                            <Badge variant={order.status === "active" ? "default" : "secondary"}>{order.status}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          {order.status === "pending" && (
                            <Button onClick={() => issueKit(order.id)}>
                              <Package className="w-4 h-4 mr-2" />
                              Issue Kit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="kits" className="space-y-4">
              {kits.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Kits Issued</p>
                    <p className="text-muted-foreground">Issue a kit from a pending order to see it here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {kits.map(
                    (kit: {
                      id: number
                      status: string
                      issue_time: string
                      issued_by: string
                      seal_batch: string
                      doses: Array<{
                        id: number
                        day_date: string
                        dose_mg: number
                        dose_ml: number
                        bottle_uid: string
                        status: string
                      }>
                    }) => (
                      <Card key={kit.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Package className="w-5 h-5" />
                              Kit #{kit.id}
                            </CardTitle>
                            <Badge variant={kit.status === "issued" ? "default" : "secondary"}>{kit.status}</Badge>
                          </div>
                          <CardDescription>
                            Issued: {new Date(kit.issue_time).toLocaleString()} by {kit.issued_by}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <strong>Seal Batch:</strong> {kit.seal_batch}
                            </div>
                            <div className="grid gap-2">
                              <div className="text-sm font-medium">Doses:</div>
                              {kit.doses?.map((dose) => (
                                <div key={dose.id} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{dose.day_date}</span>
                                    <span className="text-muted-foreground">
                                      {dose.dose_mg}mg ({dose.dose_ml}ml)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={dose.status === "returned" ? "default" : "secondary"}>
                                      {dose.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{dose.bottle_uid}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="holds" className="space-y-4">
              {holds.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No Compliance Holds</p>
                    <p className="text-muted-foreground">All patients are in good standing</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {holds.map(
                    (hold: {
                      id: number
                      patient_name: string
                      reason_code: string
                      opened_time: string
                      opened_by: string
                      requires_counselor: boolean
                      status: string
                    }) => (
                      <Card key={hold.id} className="border-red-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-red-700">
                              <Shield className="w-5 h-5" />
                              Compliance Hold - {hold.patient_name}
                            </CardTitle>
                            <Badge variant="destructive">{hold.status}</Badge>
                          </div>
                          <CardDescription>
                            Reason: {hold.reason_code?.replace("_", " ")} - Opened:{" "}
                            {new Date(hold.opened_time).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div>Opened by: {hold.opened_by}</div>
                              {hold.requires_counselor && (
                                <div className="text-amber-600 font-medium">Counselor clearance required</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Counselor Note
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Counselor Encounter</DialogTitle>
                                    <DialogDescription>
                                      Document counselor encounter for {hold.patient_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="summary">Encounter Summary</Label>
                                      <Textarea placeholder="Document the counselor encounter..." />
                                    </div>
                                    <div>
                                      <Label htmlFor="disposition">Disposition</Label>
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select disposition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="clear_hold">Clear Hold</SelectItem>
                                          <SelectItem value="maintain_hold">Maintain Hold</SelectItem>
                                          <SelectItem value="escalate">Escalate to MD</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button className="w-full">Submit Encounter</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="destructive" size="sm">
                                <XCircle className="w-4 h-4 mr-2" />
                                Charge Nurse Override
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="intake" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Return Intake Station
                  </CardTitle>
                  <CardDescription>Scan and inspect returned take-home bottles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bottle-scan">Bottle UID</Label>
                    <Input
                      id="bottle-scan"
                      placeholder="Scan or enter bottle UID"
                      value={returnBottleUid}
                      onChange={(e) => setReturnBottleUid(e.target.value)}
                    />
                  </div>

                  {returnBottleUid && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Bottle scanned: {returnBottleUid}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Seal Integrity</Label>
                      <Select
                        value={inspectionData.seal_intact ? "intact" : "compromised"}
                        onValueChange={(value) =>
                          setInspectionData((prev) => ({ ...prev, seal_intact: value === "intact" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intact">Intact</SelectItem>
                          <SelectItem value="compromised">Compromised</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="residue">Residue Estimate (ml)</Label>
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        <Input
                          id="residue"
                          type="number"
                          step="0.1"
                          value={inspectionData.residue_ml_est}
                          onChange={(e) =>
                            setInspectionData((prev) => ({
                              ...prev,
                              residue_ml_est: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Inspection Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any concerns or observations..."
                      value={inspectionData.notes}
                      onChange={(e) => setInspectionData((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Outcome</Label>
                    <Select
                      value={inspectionData.outcome}
                      onValueChange={(value) => setInspectionData((prev) => ({ ...prev, outcome: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">OK - Normal Return</SelectItem>
                        <SelectItem value="flag">Flag - Requires Review</SelectItem>
                        <SelectItem value="diversion_concern">Diversion Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleReturnIntake} disabled={!returnBottleUid}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Return Intake
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
