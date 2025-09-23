"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  AlertTriangle,
  Clock,
  Shield,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building,
} from "lucide-react"

interface Form222 {
  id: string
  formNumber: string
  supplierName: string
  supplierDEA: string
  executionDate: string
  expiresAt: string
  status: "executed" | "voided" | "expired" | "completed"
  signedBy: string
  daysRemaining: number
  lineItems: Form222Line[]
}

interface Form222Line {
  id: string
  lineNumber: number
  medication: string
  quantityOrdered: number
  unit: string
  containersShipped: number
  containersReceived: number
  dateShipped?: string
  dateReceived?: string
  status: "pending" | "partial" | "complete" | "expired"
}

export default function Form222Page() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [showReceiving, setShowReceiving] = useState(false)
  const [selectedForm, setSelectedForm] = useState<Form222 | null>(null)
  const [newFormLines, setNewFormLines] = useState<Partial<Form222Line>[]>([
    { lineNumber: 1, medication: "", quantityOrdered: 0, unit: "mL" },
  ])

  const [forms] = useState<Form222[]>([
    {
      id: "F222-2024-001",
      formNumber: "F222-2024-001",
      supplierName: "Cardinal Health",
      supplierDEA: "BC1234567",
      executionDate: "2024-12-01",
      expiresAt: "2025-01-30",
      status: "executed",
      signedBy: "Dr. Sarah Johnson",
      daysRemaining: 41,
      lineItems: [
        {
          id: "1",
          lineNumber: 1,
          medication: "Methadone HCl 10mg/mL",
          quantityOrdered: 1000,
          unit: "mL",
          containersShipped: 0,
          containersReceived: 0,
          status: "pending",
        },
        {
          id: "2",
          lineNumber: 2,
          medication: "Methadone HCl 10mg/mL",
          quantityOrdered: 500,
          unit: "mL",
          containersShipped: 0,
          containersReceived: 0,
          status: "pending",
        },
      ],
    },
    {
      id: "F222-2024-002",
      formNumber: "F222-2024-002",
      supplierName: "Hikma Pharmaceuticals",
      supplierDEA: "HK9876543",
      executionDate: "2024-11-15",
      expiresAt: "2025-01-14",
      status: "completed",
      signedBy: "PharmD Michael Smith",
      daysRemaining: 25,
      lineItems: [
        {
          id: "3",
          lineNumber: 1,
          medication: "Methadone HCl 10mg/mL",
          quantityOrdered: 750,
          unit: "mL",
          containersShipped: 1,
          containersReceived: 1,
          dateShipped: "2024-11-18",
          dateReceived: "2024-11-20",
          status: "complete",
        },
      ],
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "voided":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLineStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "partial":
        return "bg-orange-100 text-orange-800"
      case "complete":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addFormLine = () => {
    const nextLineNumber = newFormLines.length + 1
    setNewFormLines([
      ...newFormLines,
      {
        lineNumber: nextLineNumber,
        medication: "",
        quantityOrdered: 0,
        unit: "mL",
      },
    ])
  }

  const removeFormLine = (index: number) => {
    if (newFormLines.length > 1) {
      const updatedLines = newFormLines.filter((_, i) => i !== index)
      // Renumber lines
      const renumberedLines = updatedLines.map((line, i) => ({
        ...line,
        lineNumber: i + 1,
      }))
      setNewFormLines(renumberedLines)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">DEA Form 222 - Schedule II Ordering</h3>
            <p className="text-sm text-red-700 mt-1">
              Only DEA registrants or authorized POA signers may execute Form 222. No alterations permitted - changes
              void the form. 60-day expiry from execution date.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DEA Form 222 Management</h1>
          <p className="text-muted-foreground">Schedule II controlled substance ordering and receiving</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Form 222
          </Button>
          <Button variant="outline" onClick={() => setShowReceiving(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Process Receiving
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Within 60-day window</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Line items awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Forms expiring in 10 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authorized Signers</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Registrant + 2 POA</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form 222 Register</CardTitle>
          <CardDescription>All executed forms with 60-day tracking and receiving status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{form.formNumber}</h3>
                    <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                    {form.daysRemaining <= 10 && form.status === "executed" && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {form.daysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedForm(form)}>
                      View Details
                    </Button>
                    {form.status === "executed" && (
                      <Button size="sm" onClick={() => setShowReceiving(true)}>
                        Process Receipt
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {form.supplierName} (DEA: {form.supplierDEA})
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Signed by: {form.signedBy}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Executed: {form.executionDate}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Expires: {form.expiresAt}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Line Items:</h4>
                  {form.lineItems.map((line) => (
                    <div key={line.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-mono">#{line.lineNumber}</span>
                        <span className="text-sm">{line.medication}</span>
                        <span className="text-sm text-muted-foreground">
                          {line.quantityOrdered} {line.unit}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLineStatusColor(line.status)}>{line.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {line.containersReceived}/{line.quantityOrdered} received
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Form 222 Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execute New DEA Form 222</DialogTitle>
            <DialogDescription>
              Order Schedule II controlled substances - one supplier, one item per line, no alterations permitted
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>DEA Requirements:</strong> Only registrant or POA-authorized personnel may sign. Form expires 60
                days from execution. No alterations - changes void the form.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name *</Label>
                <Input placeholder="e.g., Cardinal Health" />
              </div>
              <div>
                <Label>Supplier DEA Number *</Label>
                <Input placeholder="e.g., BC1234567" />
              </div>
            </div>

            <div>
              <Label>Supplier Address *</Label>
              <Textarea placeholder="Complete supplier address including city, state, ZIP" />
            </div>

            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold mb-3">Line Items (One substance per line)</h4>
              <div className="space-y-3">
                {newFormLines.map((line, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                    <span className="font-mono text-sm w-8">#{line.lineNumber}</span>
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="methadone-10mg">Methadone HCl 10mg/mL</SelectItem>
                        <SelectItem value="methadone-5mg">Methadone HCl 5mg/mL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-24"
                      placeholder="Qty"
                      type="number"
                      value={line.quantityOrdered || ""}
                      onChange={(e) => {
                        const updated = [...newFormLines]
                        updated[index].quantityOrdered = Number.parseFloat(e.target.value) || 0
                        setNewFormLines(updated)
                      }}
                    />
                    <Select
                      value={line.unit}
                      onValueChange={(value) => {
                        const updated = [...newFormLines]
                        updated[index].unit = value
                        setNewFormLines(updated)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mL">mL</SelectItem>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="tabs">tabs</SelectItem>
                      </SelectContent>
                    </Select>
                    {newFormLines.length > 1 && (
                      <Button size="sm" variant="outline" onClick={() => removeFormLine(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={addFormLine}>
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3">Execution & Signature</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Authorized Signer *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select authorized signer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registrant">Dr. Sarah Johnson (Registrant)</SelectItem>
                      <SelectItem value="poa1">PharmD Michael Smith (POA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Execution Date *</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className="mt-3 p-3 bg-white border rounded">
                <p className="text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 inline mr-2" />
                  By executing this form, I certify that I am authorized to order Schedule II controlled substances and
                  that all information is accurate. This form expires 60 days from execution date.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <Lock className="w-4 h-4 mr-2" />
                Execute Form 222
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receiving Dialog */}
      <Dialog open={showReceiving} onOpenChange={setShowReceiving}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Process Form 222 Receipt</DialogTitle>
            <DialogDescription>Record containers received and arrival dates to close line items</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label>Select Form 222</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select form to process" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F222-2024-001">F222-2024-001 - Cardinal Health (2 pending lines)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Receiving Checklist</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Line #1: Methadone HCl 10mg/mL</p>
                    <p className="text-sm text-muted-foreground">Ordered: 1000 mL</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div>
                      <Label className="text-xs">Containers Received</Label>
                      <Input className="w-20" placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-xs">Date Received</Label>
                      <Input className="w-32" type="date" />
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Line #2: Methadone HCl 10mg/mL</p>
                    <p className="text-sm text-muted-foreground">Ordered: 500 mL</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div>
                      <Label className="text-xs">Containers Received</Label>
                      <Input className="w-20" placeholder="0" />
                    </div>
                    <div>
                      <Label className="text-xs">Date Received</Label>
                      <Input className="w-32" type="date" />
                    </div>
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                All line items must have containers received and date recorded before the form can be marked complete.
                Partial fills are allowed within the 60-day window.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReceiving(false)}>
                Save Progress
              </Button>
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
