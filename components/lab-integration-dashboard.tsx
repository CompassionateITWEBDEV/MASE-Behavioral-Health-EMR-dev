"use client"

import type React from "react"
import { useState, useCallback } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Plus,
  Search,
  Send,
  FileText,
  Clock,
  CheckCircle,
  Beaker,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LabOrder {
  id: string
  patientName: string
  patientId: string
  testNames: string[]
  orderDate: string
  status: "pending" | "sent" | "collected" | "resulted" | "cancelled"
  priority: "stat" | "urgent" | "routine"
  labName: string
  collectionDate?: string
}

interface LabResult {
  id: string
  patientName: string
  patientId: string
  testName: string
  result: string
  referenceRange: string
  units?: string
  abnormalFlag?: string
  resultDate: string
  status: "preliminary" | "final" | "corrected"
}

interface Patient {
  id: string
  first_name: string
  last_name: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LabIntegrationDashboard() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<{
    orders: LabOrder[]
    results: LabResult[]
    patients: Patient[]
  }>("/api/lab", fetcher)

  const labOrders = data?.orders || []
  const labResults = data?.results || []
  const patients = data?.patients || []

  const handleSendOrder = useCallback(
    async (orderId: string) => {
      try {
        const response = await fetch("/api/lab", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, type: "order", status: "sent" }),
        })

        if (!response.ok) throw new Error("Failed to send order")

        toast({ title: "Success", description: "Lab order sent successfully" })
        mutate()
      } catch (error) {
        toast({ title: "Error", description: "Failed to send lab order", variant: "destructive" })
      }
    },
    [toast, mutate],
  )

  const handleReviewResult = useCallback(
    async (resultId: string) => {
      try {
        const response = await fetch("/api/lab", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resultId, type: "result", status: "final" }),
        })

        if (!response.ok) throw new Error("Failed to review result")

        toast({ title: "Success", description: "Result marked as reviewed" })
        mutate()
      } catch (error) {
        toast({ title: "Error", description: "Failed to review result", variant: "destructive" })
      }
    },
    [toast, mutate],
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />
      case "collected":
        return <Beaker className="h-4 w-4 text-purple-500" />
      case "resulted":
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
      case "collected":
        return "bg-purple-100 text-purple-800"
      case "resulted":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "bg-red-100 text-red-800"
      case "urgent":
        return "bg-orange-100 text-orange-800"
      case "routine":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = labOrders.filter(
    (order) =>
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.testNames.some((test) => test.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredResults = labResults.filter(
    (result) =>
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingOrders = labOrders.filter((o) => o.status === "pending").length
  const sentOrders = labOrders.filter((o) => o.status === "sent").length
  const collectedOrders = labOrders.filter((o) => o.status === "collected").length
  const resultedOrders = labOrders.filter((o) => o.status === "resulted").length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Failed to load lab data</h3>
          <p className="text-muted-foreground mb-4">There was an error loading the lab integration data.</p>
          <Button onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting transmission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Orders</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentOrders}</div>
            <p className="text-xs text-muted-foreground">Transmitted to lab</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <Beaker className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectedOrders}</div>
            <p className="text-xs text-muted-foreground">Specimens collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resultedOrders}</div>
            <p className="text-xs text-muted-foreground">Ready for review</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Lab Orders</TabsTrigger>
          <TabsTrigger value="results">Lab Results</TabsTrigger>
          <TabsTrigger value="interfaces">Lab Interfaces</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lab Orders</CardTitle>
                <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Lab Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Lab Order</DialogTitle>
                    </DialogHeader>
                    <NewLabOrderForm
                      patients={patients}
                      onClose={() => setIsNewOrderOpen(false)}
                      onSuccess={() => {
                        setIsNewOrderOpen(false)
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
                    placeholder="Search lab orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No lab orders found</h3>
                  <p className="text-muted-foreground">Create a new lab order to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Tests</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.patientName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.testNames.map((test, index) => (
                              <div key={index} className="text-sm">
                                {test}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{order.labName}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>{order.priority.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString() : "Not collected"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {order.status === "pending" && (
                              <Button size="sm" onClick={() => handleSendOrder(order.id)}>
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

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search lab results..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No lab results found</h3>
                  <p className="text-muted-foreground">Results will appear here once labs are processed.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reference Range</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.patientName}</TableCell>
                        <TableCell>{result.testName}</TableCell>
                        <TableCell className="font-mono">
                          {result.result}{" "}
                          {result.units && <span className="text-muted-foreground">{result.units}</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.referenceRange}</TableCell>
                        <TableCell>
                          {result.abnormalFlag && <Badge variant="destructive">{result.abnormalFlag}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              result.status === "final"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.resultDate ? new Date(result.resultDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {result.status !== "final" && (
                              <Button size="sm" onClick={() => handleReviewResult(result.id)}>
                                Review
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

        <TabsContent value="interfaces">
          <Card>
            <CardHeader>
              <CardTitle>Lab Interface Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">LabCorp Interface</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status: Connected</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Bi-directional HL7 interface for orders and results
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quest Diagnostics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status: Connected</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Bi-directional HL7 interface for orders and results
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NewLabOrderFormProps {
  patients: Patient[]
  onClose: () => void
  onSuccess: () => void
}

function NewLabOrderForm({ patients, onClose, onSuccess }: NewLabOrderFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    labName: "",
    tests: [] as string[],
    priority: "routine",
    specimenType: "",
    notes: "",
  })

  const commonTests = [
    "Comprehensive Metabolic Panel",
    "Complete Blood Count",
    "Lipid Panel",
    "Thyroid Function Panel",
    "Urine Drug Screen",
    "Hepatitis Panel",
    "HIV Screen",
    "Hemoglobin A1C",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId || !formData.labName || formData.tests.length === 0) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          patientId: formData.patientId,
          labName: formData.labName,
          testNames: formData.tests,
          testCodes: formData.tests.map((_, i) => `TEST-${i + 1}`),
          priority: formData.priority,
          specimenType: formData.specimenType,
          notes: formData.notes,
        }),
      })

      if (!response.ok) throw new Error("Failed to create lab order")

      toast({ title: "Success", description: "Lab order created successfully" })
      onSuccess()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create lab order", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient">Patient *</Label>
          <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
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
          <Label htmlFor="lab">Laboratory *</Label>
          <Select value={formData.labName} onValueChange={(value) => setFormData({ ...formData, labName: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select lab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LabCorp">LabCorp</SelectItem>
              <SelectItem value="Quest Diagnostics">Quest Diagnostics</SelectItem>
              <SelectItem value="BioReference">BioReference</SelectItem>
              <SelectItem value="In-House Lab">In-House Lab</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tests to Order *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {commonTests.map((test) => (
            <label key={test} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tests.includes(test)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, tests: [...formData.tests, test] })
                  } else {
                    setFormData({ ...formData, tests: formData.tests.filter((t) => t !== test) })
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{test}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="stat">STAT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="specimenType">Specimen Type</Label>
          <Select
            value={formData.specimenType}
            onValueChange={(value) => setFormData({ ...formData, specimenType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specimen type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blood">Blood</SelectItem>
              <SelectItem value="urine">Urine</SelectItem>
              <SelectItem value="saliva">Saliva</SelectItem>
              <SelectItem value="stool">Stool</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or instructions..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Lab Order"}
        </Button>
      </div>
    </form>
  )
}
