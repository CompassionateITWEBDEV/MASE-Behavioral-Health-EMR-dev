"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Truck,
  BarChart3,
  FileText,
  Search,
  Shield,
  Lock,
  Download,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

interface InventoryItem {
  id: string
  serialNo: string
  batchNumber: string
  concentration: number
  quantity: number
  startVolume: number
  unit: string
  expirationDate: string | null
  manufacturer: string
  status: string
  location: string
  openedAt: string | null
  medicationName: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showInitialInventory, setShowInitialInventory] = useState(false)
  const [showBiennialInventory, setShowBiennialInventory] = useState(false)
  const [showAcquisitionRecord, setShowAcquisitionRecord] = useState(false)
  const [showDisposalRecord, setShowDisposalRecord] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [acquisitionForm, setAcquisitionForm] = useState({
    formNumber: "",
    supplierName: "",
    supplierDea: "",
    registrantName: "",
    registrantDea: "",
    executionDate: new Date().toISOString().split("T")[0],
  })

  const [disposalForm, setDisposalForm] = useState({
    bottleId: "",
    quantity: "",
    reason: "",
    witnesses: "",
    fullDisposal: false,
  })

  const [inventoryForm, setInventoryForm] = useState({
    physicalCount: "",
    countedBy: "",
    verifiedBy: "",
    notes: "",
  })

  const { data, error, isLoading, mutate } = useSWR("/api/inventory", fetcher)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in_use":
        return "bg-green-100 text-green-800"
      case "low":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
      case "disposed":
        return "bg-red-100 text-red-800"
      case "quarantine":
      case "sealed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const inventory: InventoryItem[] = data?.inventory || []
  const metrics = data?.metrics || {}
  const form222s = data?.form222s || []
  const shiftCounts = data?.shiftCounts || []
  const transactions = data?.transactions || []

  const filteredInventory = inventory.filter(
    (item) =>
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRecordAcquisition = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_acquisition", data: acquisitionForm }),
      })
      setShowAcquisitionRecord(false)
      setAcquisitionForm({
        formNumber: "",
        supplierName: "",
        supplierDea: "",
        registrantName: "",
        registrantDea: "",
        executionDate: new Date().toISOString().split("T")[0],
      })
      mutate()
    } catch (err) {
      console.error("Error recording acquisition:", err)
    } finally {
      setIsSubmitting(false)
    }
  }, [acquisitionForm, mutate])

  const handleRecordDisposal = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_disposal",
          data: {
            ...disposalForm,
            quantity: Number.parseFloat(disposalForm.quantity),
            user: disposalForm.witnesses,
          },
        }),
      })
      setShowDisposalRecord(false)
      setDisposalForm({ bottleId: "", quantity: "", reason: "", witnesses: "", fullDisposal: false })
      mutate()
    } catch (err) {
      console.error("Error recording disposal:", err)
    } finally {
      setIsSubmitting(false)
    }
  }, [disposalForm, mutate])

  const handleInventorySnapshot = useCallback(
    async (type: "initial" | "biennial") => {
      setIsSubmitting(true)
      try {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: type === "initial" ? "initial_inventory" : "biennial_inventory",
            data: {
              physicalCount: Number.parseFloat(inventoryForm.physicalCount),
              openingCount: metrics.totalStock || 0,
              variance: Number.parseFloat(inventoryForm.physicalCount) - (metrics.totalStock || 0),
              countedBy: inventoryForm.countedBy,
              verifiedBy: inventoryForm.verifiedBy,
              notes: inventoryForm.notes,
            },
          }),
        })
        type === "initial" ? setShowInitialInventory(false) : setShowBiennialInventory(false)
        setInventoryForm({ physicalCount: "", countedBy: "", verifiedBy: "", notes: "" })
        mutate()
      } catch (err) {
        console.error("Error recording inventory:", err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [inventoryForm, metrics.totalStock, mutate],
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="flex-1 space-y-6 p-6">
          {/* DEA Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">DEA Diversion Control Priority</h3>
                <p className="text-sm text-red-700 mt-1">
                  OTPs must prevent diversion by keeping accurate inventories and complete records from acquisition →
                  dispensing → disposal. DEA conducts inspections that scrutinize these records and physical counts.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">DEA Compliant Inventory</h1>
              <p className="text-muted-foreground">
                Controlled substance tracking with perpetual counts and audit trails
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setShowInitialInventory(true)}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Initial Inventory
              </Button>
              <Button variant="outline" onClick={() => setShowBiennialInventory(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Biennial Inventory
              </Button>
              <Button variant="outline" onClick={() => setShowAcquisitionRecord(true)}>
                <Truck className="w-4 h-4 mr-2" />
                Record Acquisition
              </Button>
              <Button variant="outline" onClick={() => setShowDisposalRecord(true)}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Record Disposal
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule II Stock</CardTitle>
                  <Lock className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalStock?.toFixed(1) || 0}mL</div>
                  <p className="text-xs text-muted-foreground">Methadone (exact count required)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Biennial</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.daysSinceBiennial ?? "N/A"}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.daysSinceBiennial !== null
                      ? `Days ago (due in ${730 - metrics.daysSinceBiennial} days)`
                      : "No biennial recorded"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Form 222</CardTitle>
                  <FileText className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.pendingForm222 || 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting documentation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disposal Pending</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.expiredBatches || 0}</div>
                  <p className="text-xs text-muted-foreground">Expired batch needs Form 41</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Variance Alert</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.variancePercent || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    {Number.parseFloat(metrics.variancePercent || 0) < 1
                      ? "Within acceptable limits"
                      : "Requires investigation"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
              <TabsTrigger value="snapshots">Inventory Snapshots</TabsTrigger>
              <TabsTrigger value="acquisitions">Acquisition Records</TabsTrigger>
              <TabsTrigger value="disposals">Disposal Records</TabsTrigger>
              <TabsTrigger value="reports">DEA Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Batches</CardTitle>
                  <CardDescription>Monitor all methadone batches and stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by batch number, serial, or manufacturer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <Skeleton className="h-9 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredInventory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No inventory batches found</p>
                      <p className="text-sm">Record an acquisition to add inventory</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInventory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{item.batchNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.manufacturer} • {item.concentration}mg/mL •
                                {item.expirationDate ? ` Expires: ${item.expirationDate}` : " No expiry set"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Location: {item.location} • Serial: {item.serialNo || "N/A"}
                              </p>
                            </div>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium">
                                {item.quantity.toFixed(1)}
                                {item.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                of {item.startVolume.toFixed(1)}
                                {item.unit}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Adjust
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="snapshots" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Snapshots</CardTitle>
                  <CardDescription>DEA-required inventory counts and documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-96" />
                        </div>
                      ))}
                    </div>
                  ) : shiftCounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No inventory snapshots recorded</p>
                      <p className="text-sm">Complete an initial or biennial inventory</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shiftCounts.map(
                        (count: {
                          id: number
                          date: string
                          shift: string
                          by_user: string
                          verified_by: string
                          physical_count_ml: number
                          variance_ml: number
                          notes: string
                        }) => (
                          <div key={count.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                {count.shift} Inventory - {count.date}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Counted by: {count.by_user || "Unknown"} • Verified: {count.verified_by || "Pending"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Physical Count: {count.physical_count_ml}mL • Variance: {count.variance_ml || 0}mL
                              </p>
                              {count.notes && (
                                <Badge className="mt-2 bg-green-100 text-green-800">
                                  {count.notes.includes("Biennial") ? "Biennial" : "Snapshot"}
                                </Badge>
                              )}
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="acquisitions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Acquisition Records</CardTitle>
                  <CardDescription>Controlled substance receipts with supplier documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <Skeleton className="h-5 w-64 mb-2" />
                          <Skeleton className="h-4 w-96" />
                        </div>
                      ))}
                    </div>
                  ) : form222s.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No acquisition records found</p>
                      <Button className="mt-4" onClick={() => setShowAcquisitionRecord(true)}>
                        Record First Acquisition
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form222s.map(
                        (form: {
                          id: number
                          supplier_name: string
                          form_number: string
                          supplier_dea_number: string
                          execution_date: string
                          status: string
                          lines: { quantity_ordered: number }[]
                        }) => (
                          <div
                            key={form.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              form.status === "pending" ? "border-yellow-200 bg-yellow-50" : ""
                            }`}
                          >
                            <div>
                              <p className="font-medium">{form.supplier_name} - Methadone HCl</p>
                              <p className="text-sm text-muted-foreground">
                                Form 222: {form.form_number} • DEA: {form.supplier_dea_number} • Date:{" "}
                                {form.execution_date}
                              </p>
                              <Badge
                                className={`mt-2 ${
                                  form.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {form.status === "completed" ? "Complete Documentation" : "Pending"}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              View Form 222
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disposals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disposal Records</CardTitle>
                  <CardDescription>Waste documentation and destruction records with DEA Form 41</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-80" />
                        </div>
                      ))}
                    </div>
                  ) : transactions.filter((t: { type: string }) => t.type === "disposal" || t.type === "waste")
                      .length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No disposal records found</p>
                      <Button className="mt-4" onClick={() => setShowDisposalRecord(true)}>
                        Record Disposal
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions
                        .filter((t: { type: string }) => t.type === "disposal" || t.type === "waste")
                        .map(
                          (txn: {
                            id: number
                            type: string
                            at_time: string
                            qty_ml: number
                            by_user: string
                            reason: string
                          }) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-medium">{txn.type === "waste" ? "Witnessed Waste" : "Disposal"}</p>
                                <p className="text-sm text-muted-foreground">
                                  Date: {new Date(txn.at_time).toLocaleDateString()} • Quantity: {Math.abs(txn.qty_ml)}
                                  mL • By: {txn.by_user}
                                </p>
                                <p className="text-sm text-muted-foreground">Reason: {txn.reason || "Not specified"}</p>
                              </div>
                              <Badge
                                className={
                                  txn.type === "waste" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                                }
                              >
                                {txn.type === "waste" ? "Witnessed Waste" : "Requires Form 41"}
                              </Badge>
                            </div>
                          ),
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>DEA Inspection Reports</CardTitle>
                    <CardDescription>One-click compliance reports for DEA inspections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-transparent" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Initial Inventory Report
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Biennial Inventory Report
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Acquisitions Register
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Dispensing Log
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Waste & Destruction Register
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Variance & Reconciliation
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Current DEA compliance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Schedule II Records Separated
                      </span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Records Retention ≥2 Years
                      </span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${metrics.pendingForm222 > 0 ? "bg-yellow-500" : "bg-green-500"}`}
                        ></div>
                        Form 222 Documentation
                      </span>
                      <Badge
                        className={
                          metrics.pendingForm222 > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }
                      >
                        {metrics.pendingForm222 > 0 ? `${metrics.pendingForm222} Pending` : "Compliant"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${metrics.expiredBatches > 0 ? "bg-red-500" : "bg-green-500"}`}
                        ></div>
                        Disposal Documentation
                      </span>
                      <Badge
                        className={
                          metrics.expiredBatches > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }
                      >
                        {metrics.expiredBatches > 0 ? `${metrics.expiredBatches} Overdue` : "Compliant"}
                      </Badge>
                    </div>
                    <Button className="w-full mt-4">Generate Compliance Summary</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Initial Inventory Dialog */}
          <Dialog open={showInitialInventory} onOpenChange={setShowInitialInventory}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Initial Inventory</DialogTitle>
                <DialogDescription>
                  Complete accurate physical count of all controlled substances on hand
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    DEA requires an initial inventory on the first day of dispensing. Schedule II substances require
                    exact counts.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Physical Count (mL)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={inventoryForm.physicalCount}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, physicalCount: e.target.value })}
                    placeholder="Enter exact count"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Counted By</Label>
                  <Input
                    value={inventoryForm.countedBy}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, countedBy: e.target.value })}
                    placeholder="Name of person counting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verified By</Label>
                  <Input
                    value={inventoryForm.verifiedBy}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, verifiedBy: e.target.value })}
                    placeholder="Name of verifier"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={inventoryForm.notes}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInitialInventory(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleInventorySnapshot("initial")} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Initial Inventory"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Biennial Inventory Dialog */}
          <Dialog open={showBiennialInventory} onOpenChange={setShowBiennialInventory}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Biennial Inventory</DialogTitle>
                <DialogDescription>Complete the required two-year inventory count</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    DEA requires biennial inventory every two years. Schedule II: exact count. Schedule III-V: estimated
                    allowed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Physical Count (mL)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={inventoryForm.physicalCount}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, physicalCount: e.target.value })}
                    placeholder="Enter exact count"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Counted By</Label>
                  <Input
                    value={inventoryForm.countedBy}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, countedBy: e.target.value })}
                    placeholder="Name of person counting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verified By</Label>
                  <Input
                    value={inventoryForm.verifiedBy}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, verifiedBy: e.target.value })}
                    placeholder="Name of verifier"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={inventoryForm.notes}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBiennialInventory(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleInventorySnapshot("biennial")} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Biennial Inventory"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Record Acquisition Dialog */}
          <Dialog open={showAcquisitionRecord} onOpenChange={setShowAcquisitionRecord}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Acquisition</DialogTitle>
                <DialogDescription>Document controlled substance receipt with DEA Form 222</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Form 222 Number</Label>
                  <Input
                    value={acquisitionForm.formNumber}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, formNumber: e.target.value })}
                    placeholder="F222-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input
                    value={acquisitionForm.supplierName}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, supplierName: e.target.value })}
                    placeholder="Cardinal Health"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier DEA Number</Label>
                  <Input
                    value={acquisitionForm.supplierDea}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, supplierDea: e.target.value })}
                    placeholder="BC1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registrant Name</Label>
                  <Input
                    value={acquisitionForm.registrantName}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, registrantName: e.target.value })}
                    placeholder="Your facility name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registrant DEA Number</Label>
                  <Input
                    value={acquisitionForm.registrantDea}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, registrantDea: e.target.value })}
                    placeholder="Your DEA number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Execution Date</Label>
                  <Input
                    type="date"
                    value={acquisitionForm.executionDate}
                    onChange={(e) => setAcquisitionForm({ ...acquisitionForm, executionDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAcquisitionRecord(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordAcquisition} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Record Acquisition"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Record Disposal Dialog */}
          <Dialog open={showDisposalRecord} onOpenChange={setShowDisposalRecord}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Disposal</DialogTitle>
                <DialogDescription>Document waste or destruction with proper witnessing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    All disposals must be witnessed. Destruction of significant quantities requires DEA Form 41.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Quantity (mL)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={disposalForm.quantity}
                    onChange={(e) => setDisposalForm({ ...disposalForm, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={disposalForm.reason}
                    onChange={(e) => setDisposalForm({ ...disposalForm, reason: e.target.value })}
                    placeholder="Reason for disposal (e.g., expired, patient refusal, dose adjustment)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Witnesses</Label>
                  <Input
                    value={disposalForm.witnesses}
                    onChange={(e) => setDisposalForm({ ...disposalForm, witnesses: e.target.value })}
                    placeholder="Names of witnesses"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDisposalRecord(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordDisposal} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Record Disposal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
