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
import {
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Scale,
  User,
  FileText,
  Shield,
} from "lucide-react"

interface TakehomeOrder {
  id: number
  patient_id: number
  patient_name: string
  days: number
  start_date: string
  end_date: string
  risk_level: string
  status: string
  created_at: string
}

interface TakehomeKit {
  id: number
  takehome_order_id: number
  issue_time: string
  issued_by: string
  seal_batch: string
  status: string
  doses: TakehomeDose[]
}

interface TakehomeDose {
  id: number
  kit_id: number
  day_date: string
  dose_mg: number
  dose_ml: number
  bottle_uid: string
  seal_uid: string
  status: string
}

interface ComplianceHold {
  id: number
  patient_id: number
  patient_name: string
  reason_code: string
  opened_by: string
  opened_time: string
  requires_counselor: boolean
  status: string
}

export default function TakeHomePage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState<TakehomeOrder[]>([])
  const [kits, setKits] = useState<TakehomeKit[]>([])
  const [holds, setHolds] = useState<ComplianceHold[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [returnBottleUid, setReturnBottleUid] = useState("")
  const [inspectionData, setInspectionData] = useState({
    seal_intact: true,
    residue_ml_est: 0,
    notes: "",
    outcome: "ok",
  })
  const [overrideReason, setOverrideReason] = useState("")
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [selectedHoldId, setSelectedHoldId] = useState<number | null>(null)

  useEffect(() => {
    // Load initial data
    loadOrders()
    loadKits()
    loadHolds()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/takehome/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("[v0] Error loading take-home orders:", error)
    }
  }

  const loadKits = async () => {
    try {
      const response = await fetch("/api/takehome/kits")
      if (response.ok) {
        const data = await response.json()
        setKits(data.kits || [])
      }
    } catch (error) {
      console.error("[v0] Error loading take-home kits:", error)
    }
  }

  const loadHolds = async () => {
    try {
      const response = await fetch("/api/takehome/holds")
      if (response.ok) {
        const data = await response.json()
        setHolds(data.holds || [])
      }
    } catch (error) {
      console.error("[v0] Error loading compliance holds:", error)
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
        // Refresh data and clear form
        loadKits()
        setReturnBottleUid("")
        setInspectionData({
          seal_intact: true,
          residue_ml_est: 0,
          notes: "",
          outcome: "ok",
        })
      }
    } catch (error) {
      console.error("Return intake failed:", error)
    }
  }

  const createTakehomeOrder = async (patientId: number, days: number, riskLevel: string) => {
    try {
      const response = await fetch("/api/takehome/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          days,
          risk_level: riskLevel,
          start_date: new Date().toISOString().split("T")[0],
        }),
      })

      if (response.ok) {
        loadOrders()
      }
    } catch (error) {
      console.error("Order creation failed:", error)
    }
  }

  const issueKit = async (orderId: number) => {
    try {
      const response = await fetch(`/api/takehome/kits/${orderId}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        loadKits()
        loadOrders()
      }
    } catch (error) {
      console.error("Kit issuance failed:", error)
    }
  }

  const handleChargeNurseOverride = async (holdId: number, reason: string) => {
    try {
      const response = await fetch(`/api/takehome/holds/${holdId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          override_reason: reason,
          override_type: "charge_nurse_medical",
          overridden_by: "Charge Nurse Smith", // In real app, get from auth context
        }),
      })

      if (response.ok) {
        loadHolds()
        setShowOverrideDialog(false)
        setOverrideReason("")
        setSelectedHoldId(null)
      }
    } catch (error) {
      console.error("Override failed:", error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Take-Home Management</h1>
          <p className="text-muted-foreground">Manage take-home methadone orders, kits, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
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
                      <SelectItem value="101">Sarah Johnson</SelectItem>
                      <SelectItem value="102">Michael Chen</SelectItem>
                      <SelectItem value="103">David Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="days">Days</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk">Risk Level</Label>
                  <Select>
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
                <Button className="w-full">Create Order</Button>
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
                        {order.days} days • {order.start_date} to {order.end_date}
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
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <div className="grid gap-4">
            {kits.map((kit) => (
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
                      {kit.doses.map((dose) => (
                        <div key={dose.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{dose.day_date}</span>
                            <span className="text-muted-foreground">
                              {dose.dose_mg}mg ({dose.dose_ml}ml)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dose.status === "returned" ? "default" : "secondary"}>{dose.status}</Badge>
                            <span className="text-xs text-muted-foreground">{dose.bottle_uid}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holds" className="space-y-4">
          <div className="grid gap-4">
            {holds.map((hold) => (
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
                    Reason: {hold.reason_code.replace("_", " ")} • Opened: {new Date(hold.opened_time).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div>Opened by: {hold.opened_by}</div>
                      {hold.requires_counselor && (
                        <div className="text-amber-600 font-medium">⚠️ Counselor clearance required</div>
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
                            <DialogDescription>Document counselor encounter for {hold.patient_name}</DialogDescription>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedHoldId(hold.id)
                          setShowOverrideDialog(true)
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Charge Nurse Override
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                  <AlertDescription>Bottle found: Sarah Johnson - Day 1 (80mg) - Issued 01/15/2024</AlertDescription>
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
                    <SelectItem value="ok">OK - No Issues</SelectItem>
                    <SelectItem value="concern">Concern - Monitor</SelectItem>
                    <SelectItem value="diversion_suspected">Diversion Suspected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inspectionData.outcome !== "ok" && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This outcome will automatically create a compliance hold requiring counselor review.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleReturnIntake} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Process Return
                </Button>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Shield className="w-5 h-5" />
              Charge Nurse Medical Override
            </DialogTitle>
            <DialogDescription>
              This is a one-time override for medically necessary situations. Document the medical necessity reason.
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This override will be permanently logged and audited. Use only for genuine
              medical emergencies.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="override-reason">Medical Necessity Reason *</Label>
              <Textarea
                id="override-reason"
                placeholder="Document the specific medical reason requiring this override (e.g., patient hospitalized, emergency surgery, acute medical condition preventing normal return schedule)..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Override will be logged with timestamp and user ID</div>
              <div>• Medical Director will be automatically notified</div>
              <div>• Patient's take-home privileges will be reviewed within 24 hours</div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowOverrideDialog(false)
                  setOverrideReason("")
                  setSelectedHoldId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => selectedHoldId && handleChargeNurseOverride(selectedHoldId, overrideReason)}
                disabled={!overrideReason.trim() || overrideReason.length < 20}
              >
                <Shield className="w-4 h-4 mr-2" />
                Authorize Override
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
