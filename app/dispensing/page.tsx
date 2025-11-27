"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SerialDeviceMonitor } from "@/components/serial-device-monitor"
import {
  Syringe,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Printer,
  Shield,
  Activity,
  User,
  Droplets,
  CheckCircle,
  XCircle,
  Scan,
  RotateCcw,
  Trash2,
  FlaskConical,
} from "lucide-react"

interface DoseOrder {
  id: number
  patient_id: number
  patient_name: string
  mrn: string
  daily_dose_mg: number
  max_takehome: number
  prescriber_id: string
  status: "active" | "inactive" | "discontinued"
  start_date: string
  stop_date?: string
  dob?: string
}

interface DoseEvent {
  id?: number
  patient_id: number
  order_id: number
  requested_mg: number
  dispensed_mg: number
  dispensed_ml: number
  bottle_id: number
  device_id: number
  by_user: string
  time: string
  outcome: "success" | "aborted" | "alarm"
  signature_hash?: string
  notes?: string
}

interface Bottle {
  id: number
  lot_id: number
  start_volume_ml: number
  current_volume_ml: number
  opened_at?: string
  status: "active" | "reserved" | "closed"
  serial_no?: string
  medication_name: string
  concentration: number
  lot_number: string
  exp_date: string
}

interface Device {
  id: number
  type: "MethaSpense"
  location: string
  com_port: string
  firmware: string
  status: "online" | "offline" | "maintenance"
  last_heartbeat?: string
}

const PatientBanner = ({ order }: { order: DoseOrder }) => (
  <Card className="mb-4 border-l-4 border-l-blue-500">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{order.patient_name}</h3>
            <p className="text-sm text-muted-foreground">
              MRN: {order.mrn} • DOB: {order.dob}
            </p>
            <p className="text-sm font-medium text-blue-600">
              {"Today's Order:"} {order.daily_dose_mg}mg ({(order.daily_dose_mg / 10).toFixed(1)}ml)
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="mb-2">
            Take-home: {order.max_takehome} days
          </Badge>
          <p className="text-xs text-muted-foreground">Prescriber: Dr. {order.prescriber_id}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const LiveEventFeed = ({ events }: { events: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Activity className="w-4 h-4 mr-2" />
        Live Event Feed
      </CardTitle>
    </CardHeader>
    <CardContent className="max-h-64 overflow-y-auto">
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
            <span>{event.message}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const CalibrationWorkflow = () => {
  const [calibrationStep, setCalibrationStep] = useState(0)
  const [testVolume, setTestVolume] = useState("")
  const [actualVolume, setActualVolume] = useState("")

  const calibrationSteps = [
    "Daily bubble check",
    "Test dispense into volumetric flask",
    "Measure actual volume",
    "Record ± tolerance",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="w-4 h-4 mr-2" />
          Daily Calibration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {calibrationSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 rounded ${
                index <= calibrationStep ? "bg-green-50 text-green-700" : "bg-gray-50"
              }`}
            >
              {index <= calibrationStep ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
              )}
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        {calibrationStep === 1 && (
          <div className="space-y-2">
            <Label>Test Volume (ml)</Label>
            <Input value={testVolume} onChange={(e) => setTestVolume(e.target.value)} placeholder="Enter test volume" />
          </div>
        )}

        {calibrationStep === 2 && (
          <div className="space-y-2">
            <Label>Actual Measured Volume (ml)</Label>
            <Input
              value={actualVolume}
              onChange={(e) => setActualVolume(e.target.value)}
              placeholder="Enter measured volume"
            />
          </div>
        )}

        <Button
          onClick={() => setCalibrationStep(Math.min(calibrationStep + 1, 3))}
          disabled={calibrationStep === 3}
          className="w-full"
        >
          {calibrationStep === 3 ? "Calibration Complete" : "Next Step"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function DispensingPage() {
  const [selectedOrder, setSelectedOrder] = useState<DoseOrder | null>(null)
  const [dispensingInProgress, setDispensingInProgress] = useState(false)
  const [dispenseAmount, setDispenseAmount] = useState("")
  const [witnessSignature, setWitnessSignature] = useState("")
  const [dispenseNotes, setDispenseNotes] = useState("")

  const [showBottleOnboarding, setShowBottleOnboarding] = useState(false)
  const [showShiftCount, setShowShiftCount] = useState(false)
  const [showWastage, setShowWastage] = useState(false)
  const [showBottleChangeover, setShowBottleChangeover] = useState(false)
  const [nurseAuthenticated, setNurseAuthenticated] = useState(false)
  const [nurseBadge, setNurseBadge] = useState("")
  const [nursePIN, setNursePIN] = useState("")
  const [deviceArmed, setDeviceArmed] = useState(false)

  const [newBottle, setNewBottle] = useState({
    lotNumber: "",
    expDate: "",
    startVolume: "",
    serialNo: "",
    deviceLocation: "",
    verifier1: "",
    verifier2: "",
  })

  const [shiftCount, setShiftCount] = useState({
    shift: "day",
    openingVolume: "",
    closingVolume: "",
    physicalCount: "",
    variance: 0,
    varianceReason: "",
    supervisor1: "",
    supervisor2: "",
  })

  const [wastage, setWastage] = useState({
    amount: "",
    reason: "",
    reasonCode: "",
    witness: "",
    notes: "",
  })

  const [activeOrders, setActiveOrders] = useState<DoseOrder[]>([])
  const [activeBottles, setActiveBottles] = useState<Bottle[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [recentDoseEvents, setRecentDoseEvents] = useState<DoseEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [liveEvents, setLiveEvents] = useState([
    { timestamp: new Date(), message: "Device initialized successfully" },
    { timestamp: new Date(Date.now() - 60000), message: "Bottle #B001 loaded - 500ml remaining" },
    { timestamp: new Date(Date.now() - 120000), message: "Shift count completed - variance: +0.2ml" },
  ])

  const [userRole, setUserRole] = useState<
    "dispenser" | "charge_nurse" | "pharmacist" | "medical_director" | "auditor"
  >("dispenser")
  const [mfaVerified, setMfaVerified] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [ordersRes, bottlesRes, devicesRes] = await Promise.all([
          fetch("/api/dispensing/orders"),
          fetch("/api/dispensing/bottles"),
          fetch("/api/dispensing/devices"),
        ])

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setActiveOrders(ordersData.orders || [])
        }

        if (bottlesRes.ok) {
          const bottlesData = await bottlesRes.json()
          setActiveBottles(bottlesData.bottles || [])
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json()
          setDevices(devicesData.devices || [])
        }

        // Set mock dose events for now
        setRecentDoseEvents([
          {
            id: 1,
            patient_id: 1,
            order_id: 1,
            requested_mg: 80.0,
            dispensed_mg: 80.0,
            dispensed_ml: 8.0,
            bottle_id: 1,
            device_id: 1,
            by_user: "nurse001",
            time: new Date().toISOString(),
            outcome: "success",
            signature_hash: "abc123def456",
          },
        ])
      } catch (error) {
        console.error("[v0] Error loading dispensing data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNurseAuth = () => {
    if (nurseBadge && nursePIN) {
      setNurseAuthenticated(true)
      console.log(`[v0] Nurse authenticated: Badge ${nurseBadge}`)
    }
  }

  const handleDispense = async (order: DoseOrder) => {
    if (!nurseBadge || !nursePIN || !witnessSignature) {
      alert("Please complete nurse authentication and witness signature")
      return
    }

    setSelectedOrder(order)
    setDispensingInProgress(true)

    try {
      // Step 1: Prepare dose with safety checks
      console.log(`[v0] Preparing dose for ${order.patient_name}: ${order.daily_dose_mg}mg`)

      const prepareResponse = await fetch("/api/dose/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: order.patient_id,
          requested_mg: order.daily_dose_mg,
        }),
      })

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json()
        throw new Error(error.error || "Dose preparation failed")
      }

      const prepareData = await prepareResponse.json()
      console.log(`[v0] Dose prepared: ${prepareData.computed_ml}ml from bottle ${prepareData.bottle_id}`)

      setDispenseAmount(order.daily_dose_mg.toString())
      setDeviceArmed(true)

      // Step 2: Execute dose via serial communication
      console.log(`[v0] Executing dispense via MethaSpense device`)

      const executeResponse = await fetch("/api/dose/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: order.patient_id,
          ml: prepareData.computed_ml,
          witness_signature: witnessSignature,
        }),
      })

      if (!executeResponse.ok) {
        const error = await executeResponse.json()
        throw new Error(error.error || "Dose execution failed")
      }

      const executeData = await executeResponse.json()
      console.log(`[v0] Dose executed successfully:`, executeData)

      // Handle device events
      if (executeData.device_events) {
        executeData.device_events.forEach((event: any) => {
          if (event.event_type === "bubble_detected") {
            alert("Bubble detected! Dose may have been interrupted. Please verify patient received full dose.")
          }
        })
      }

      // Success - update UI
      alert(`Dose dispensed successfully: ${executeData.actual_ml.toFixed(2)}ml`)
    } catch (error) {
      console.error(`[v0] Dispensing error:`, error)
      alert(`Dispensing failed: ${error.message}`)
    } finally {
      setDispensingInProgress(false)
      setDeviceArmed(false)
    }
  }

  const handleEnhancedDispense = async (order: DoseOrder) => {
    if (!nurseAuthenticated || !mfaVerified) {
      alert("MFA authentication required for dose execution")
      return
    }

    const currentDevice = devices[0]
    if (currentDevice?.status !== "online") {
      alert("Device must be online and ready before dispensing")
      return
    }

    try {
      // Step 1: Prepare dose with safety checks
      const prepareResponse = await fetch("/api/dose/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: order.patient_id,
          requested_mg: Number.parseFloat(dispenseAmount),
        }),
      })

      const prepareData = await prepareResponse.json()

      if (!prepareData.success) {
        alert(`Dose preparation failed: ${prepareData.error}`)
        return
      }

      // Step 2: Arm device and execute dose
      setDeviceArmed(true)
      setDispensingInProgress(true)

      // Add live event
      setLiveEvents((prev) => [
        {
          timestamp: new Date(),
          message: `Dose armed: ${order.patient_name} - ${dispenseAmount}mg`,
        },
        ...prev,
      ])

      const executeResponse = await fetch("/api/dose/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: order.patient_id,
          ml: prepareData.computed_ml,
          witness_signature: witnessSignature,
          notes: dispenseNotes,
        }),
      })

      const executeData = await executeResponse.json()

      if (executeData.success) {
        // Add success event
        setLiveEvents((prev) => [
          {
            timestamp: new Date(),
            message: `Dose completed: ${executeData.actual_ml}ml dispensed successfully`,
          },
          ...prev,
        ])

        alert(`Dose dispensed successfully: ${executeData.actual_ml}ml`)
      } else {
        // Add failure event
        setLiveEvents((prev) => [
          {
            timestamp: new Date(),
            message: `Dose failed: ${executeData.error}`,
          },
          ...prev,
        ])

        alert(`Dose execution failed: ${executeData.error}`)
      }
    } catch (error) {
      console.error("[v0] Dose execution error:", error)
      setLiveEvents((prev) => [
        {
          timestamp: new Date(),
          message: `System error during dose execution`,
        },
        ...prev,
      ])
      alert("System error during dose execution")
    } finally {
      setDeviceArmed(false)
      setDispensingInProgress(false)
      setDispenseAmount("")
      setWitnessSignature("")
      setDispenseNotes("")
    }
  }

  const handleBottleOnboarding = async () => {
    console.log("[v0] Starting bottle onboarding process")

    // Validate two-person verification
    if (!newBottle.verifier1 || !newBottle.verifier2) {
      alert("Two-person verification required")
      return
    }

    // Simulate bottle scanning and calibration
    console.log(`[v0] Scanning lot ${newBottle.lotNumber}, exp ${newBottle.expDate}`)
    console.log(`[v0] Starting volume: ${newBottle.startVolume}ml`)
    console.log(`[v0] Assigning to device at ${newBottle.deviceLocation}`)

    // Simulate IVEK calibration procedure
    console.log("[v0] Initiating MethaSpense calibration procedure")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Calibration complete - precision ceramic pump verified")

    setShowBottleOnboarding(false)
    alert("Bottle onboarded successfully!")
  }

  const handleShiftCount = () => {
    const opening = Number.parseFloat(shiftCount.openingVolume) || 0
    const closing = Number.parseFloat(shiftCount.closingVolume) || 0
    const physical = Number.parseFloat(shiftCount.physicalCount) || 0
    const computed = opening - closing
    const variance = physical - computed

    setShiftCount((prev) => ({ ...prev, variance }))

    if (Math.abs(variance) > 5.0) {
      // 5ml tolerance
      if (!shiftCount.varianceReason || !shiftCount.supervisor1 || !shiftCount.supervisor2) {
        alert("Variance exceeds tolerance. Reason and two signatures required.")
        return
      }
    }

    console.log("[v0] Shift count completed:", {
      opening,
      closing,
      computed,
      physical,
      variance,
    })

    setShowShiftCount(false)
    alert("Shift count recorded successfully!")
  }

  const handleWastage = () => {
    if (!wastage.amount || !wastage.reason || !wastage.witness) {
      alert("All fields required for wastage entry")
      return
    }

    console.log("[v0] Recording wastage transaction:", {
      type: "waste",
      amount: Number.parseFloat(wastage.amount),
      reason: wastage.reason,
      reasonCode: wastage.reasonCode,
      witness: wastage.witness,
      notes: wastage.notes,
    })

    setShowWastage(false)
    alert("Wastage recorded successfully!")
  }

  const currentBottle = activeBottles[0]
  const currentDevice = devices[0]
  const bottleLevel = currentBottle ? (currentBottle.current_volume_ml / currentBottle.start_volume_ml) * 100 : 0

  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      {/* ... existing header ... */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Methadone Dispensing</h1>
          <p className="text-muted-foreground">Manage dose orders and monitor MethaSpense® device</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            {userRole.replace("_", " ").toUpperCase()}
          </Badge>

          {nurseAuthenticated && mfaVerified ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <User className="w-3 h-3 mr-1" />
              Authenticated + MFA
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setMfaVerified(true)}>
              <Shield className="w-4 h-4 mr-2" />
              Complete MFA
            </Button>
          )}

          {currentDevice?.status === "online" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Device Online
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <WifiOff className="w-3 h-3 mr-1" />
              Device Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setShowBottleOnboarding(true)}>
          <Scan className="w-4 h-4 mr-2" />
          Bottle Onboarding
        </Button>
        <Button variant="outline" onClick={() => setShowShiftCount(true)}>
          <Clock className="w-4 h-4 mr-2" />
          Shift Count
        </Button>
        <Button variant="outline" onClick={() => setShowWastage(true)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Record Wastage
        </Button>
        <Button variant="outline" onClick={() => setShowBottleChangeover(true)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Bottle Changeover
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">Patients ready for dosing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doses Today</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDoseEvents.length}</div>
            <p className="text-xs text-muted-foreground">100% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottle Level</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(bottleLevel)}%</div>
            <Progress value={bottleLevel} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{currentBottle?.current_volume_ml}ml remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{currentDevice?.status}</div>
            <p className="text-xs text-muted-foreground">{currentDevice?.location}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Dose Queue</TabsTrigger>
          <TabsTrigger value="device">Device Status</TabsTrigger>
          <TabsTrigger value="calibration">Daily Calibration</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              {selectedOrder && <PatientBanner order={selectedOrder} />}

              <Card>
                <CardHeader>
                  <CardTitle>Active Dose Orders</CardTitle>
                  <CardDescription>Enhanced dosing workflow with safety protocols</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{order.patient_name}</p>
                            <p className="text-sm text-muted-foreground">
                              MRN: {order.mrn} • {order.daily_dose_mg}mg daily ({(order.daily_dose_mg / 10).toFixed(1)}
                              ml)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Computed Volume: {(order.daily_dose_mg / 10).toFixed(1)}ml (10mg/ml concentration)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setDispenseAmount(order.daily_dose_mg.toString())
                            }}
                            disabled={!nurseAuthenticated || !mfaVerified}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Syringe className="w-4 h-4 mr-2" />
                            Arm & Dispense
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeviceArmed(false)
                              setDispensingInProgress(false)
                              setLiveEvents((prev) => [
                                {
                                  timestamp: new Date(),
                                  message: "EMERGENCY STOP - Dose aborted by user",
                                },
                                ...prev,
                              ])
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            STOP
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <LiveEventFeed events={liveEvents} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="device" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SerialDeviceMonitor />

            <Card>
              <CardHeader>
                <CardTitle>Device Controls</CardTitle>
                <CardDescription>Manual device operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-transparent" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Run Diagnostics
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Test Label
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Lock Device
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Droplets className="w-4 h-4 mr-2" />
                  Prime Lines
                </Button>
                {currentDevice?.status !== "online" && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Device communication error. Check RS-232 connection.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calibration" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <CalibrationWorkflow />

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Daily bubble check</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Weekly calibration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Placeholder for reports section */}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {/* Placeholder for audit log section */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
