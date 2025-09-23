"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertTriangle,
  Truck,
  BarChart3,
  FileText,
  Search,
  Shield,
  Camera,
  Users,
  Lock,
  Download,
  Calendar,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react"

interface InventoryItem {
  id: string
  batchNumber: string
  concentration: number
  quantity: number
  unit: string
  expirationDate: string
  manufacturer: string
  status: "active" | "low" | "expired" | "quarantine"
  location: string
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(null)
  const [showInitialInventory, setShowInitialInventory] = useState(false)
  const [showBiennialInventory, setShowBiennialInventory] = useState(false)
  const [showAcquisitionRecord, setShowAcquisitionRecord] = useState(false)
  const [showDisposalRecord, setShowDisposalRecord] = useState(false)

  const [inventory] = useState<InventoryItem[]>([
    {
      id: "INV-001",
      batchNumber: "B-2024-001",
      concentration: 10,
      quantity: 2500,
      unit: "mg",
      expirationDate: "2025-06-15",
      manufacturer: "Mallinckrodt",
      status: "active",
      location: "Vault A-1",
    },
    {
      id: "INV-002",
      batchNumber: "B-2024-002",
      concentration: 10,
      quantity: 450,
      unit: "mg",
      expirationDate: "2025-08-20",
      manufacturer: "Roxane Labs",
      status: "low",
      location: "Vault A-2",
    },
    {
      id: "INV-003",
      batchNumber: "B-2023-045",
      concentration: 10,
      quantity: 0,
      unit: "mg",
      expirationDate: "2024-12-01",
      manufacturer: "Mallinckrodt",
      status: "expired",
      location: "Vault B-1",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "low":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "quarantine":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DEA Compliant Inventory</h1>
          <p className="text-muted-foreground">Controlled substance tracking with perpetual counts and audit trails</p>
        </div>
        <div className="flex space-x-2">
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

      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule II Stock</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,950mg</div>
            <p className="text-xs text-muted-foreground">Methadone (exact count required)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Biennial</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">347</div>
            <p className="text-xs text-muted-foreground">Days ago (due in 383 days)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Form 222</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting documentation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disposal Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Expired batch needs Form 41</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance Alert</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.2%</div>
            <p className="text-xs text-muted-foreground">Within acceptable limits</p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search by batch number or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="space-y-4">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{item.batchNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.manufacturer} • {item.concentration}mg/ml • Expires: {item.expirationDate}
                        </p>
                        <p className="text-sm text-muted-foreground">Location: {item.location}</p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {item.quantity.toLocaleString()}
                          {item.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">Available</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Adjust
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Initial Inventory - Opening Day</p>
                    <p className="text-sm text-muted-foreground">
                      Taken: Jan 15, 2024 • Opening of Business • By: Head Nurse Johnson • Verified: Dr. Smith
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Locked & Signed</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Biennial Inventory 2024</p>
                    <p className="text-sm text-muted-foreground">
                      Due: Jan 15, 2026 • Schedule II: Exact Count • Schedule III-V: Estimated
                    </p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Due in 383 days</Badge>
                  </div>
                  <Button onClick={() => setShowBiennialInventory(true)}>Start Biennial</Button>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Cardinal Health - Methadone HCl 10mg/mL</p>
                    <p className="text-sm text-muted-foreground">
                      Received: Dec 15, 2024 • DEA: BC1234567 • Quantity: 1000mL • Form 222: F222-2024-001
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Complete Documentation</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Form 222
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <div>
                    <p className="font-medium">Hikma Pharmaceuticals - Methadone HCl 10mg/mL</p>
                    <p className="text-sm text-muted-foreground">
                      Received: Dec 20, 2024 • DEA: HK9876543 • Quantity: 500mL
                    </p>
                    <Badge className="mt-2 bg-red-100 text-red-800">Missing Form 222</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 bg-transparent">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Upload Form 222
                  </Button>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Waste - Partial Dose Remainder</p>
                    <p className="text-sm text-muted-foreground">
                      Date: Dec 20, 2024 • Quantity: 2.5mL • Witnesses: Nurse Adams, Dr. Wilson
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reason: Patient dose adjustment - 77.5mL dispensed from 80mL order
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Witnessed Waste</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                  <div>
                    <p className="font-medium">Destruction - Expired Batch B-2023-045</p>
                    <p className="text-sm text-muted-foreground">
                      Expired: Dec 1, 2024 • Quantity: 150mL • Method: Incineration
                    </p>
                    <Badge className="mt-2 bg-red-100 text-red-800">Requires DEA Form 41</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-300 bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Complete Form 41
                  </Button>
                </div>
              </div>
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
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Form 222 Documentation
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">1 Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Disposal Documentation
                  </span>
                  <Badge className="bg-red-100 text-red-800">1 Overdue</Badge>
                </div>
                <Button className="w-full mt-4">Generate Compliance Summary</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showInitialInventory} onOpenChange={setShowInitialInventory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Initial Inventory Wizard</DialogTitle>
            <DialogDescription>
              Complete accurate physical count of all controlled substances on hand (first day of dispensing)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">DEA Requirement</h4>
              <p className="text-sm text-blue-700">
                Take Initial Inventory on first dispensing day; mark "Opening" or "Close of Business." If none on hand,
                record 0.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Business Period</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opening">Opening of Business</SelectItem>
                    <SelectItem value="closing">Close of Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Inventory Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Physical Count - Schedule II Substances</h4>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Methadone HCl 10mg/mL - Batch B-2024-001</span>
                  <div className="flex items-center space-x-2">
                    <Input className="w-24" placeholder="0.0" />
                    <span className="text-sm text-muted-foreground">mL</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Methadone HCl 10mg/mL - Batch B-2024-002</span>
                  <div className="flex items-center space-x-2">
                    <Input className="w-24" placeholder="0.0" />
                    <span className="text-sm text-muted-foreground">mL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taken By (Staff Initials)</Label>
                <Input placeholder="e.g., RN-JJ" />
              </div>
              <div>
                <Label>Verified By (Supervisor)</Label>
                <Input placeholder="e.g., PharmD-MS" />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any additional observations or notes..." />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="lock-snapshot" />
              <Label htmlFor="lock-snapshot" className="text-sm">
                Lock this snapshot (cannot be modified after submission)
              </Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInitialInventory(false)}>
                Cancel
              </Button>
              <Button>
                <Lock className="w-4 h-4 mr-2" />
                Submit & Lock Inventory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBiennialInventory} onOpenChange={setShowBiennialInventory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Biennial Inventory</DialogTitle>
            <DialogDescription>
              Complete biennial inventory within 2 years of last snapshot (exact count for Schedule I-II, estimated for
              III-V)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">DEA Requirement</h4>
              <p className="text-sm text-yellow-700">
                Take Biennial Inventory at least every 2 years; exact counts for Schedules I-II; estimated for III-V
                unless container &gt;1,000 tabs/caps (then exact).
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Schedule II - Exact Count Required</h4>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Methadone HCl 10mg/mL - Batch B-2024-001</p>
                    <p className="text-sm text-muted-foreground">Opened container</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input className="w-24" placeholder="0.0" />
                    <span className="text-sm text-muted-foreground">mL</span>
                    <Badge className="bg-red-100 text-red-800">Exact</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBiennialInventory(false)}>
                Save Draft
              </Button>
              <Button>Complete Biennial Inventory</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAcquisitionRecord} onOpenChange={setShowAcquisitionRecord}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Controlled Substance Acquisition</DialogTitle>
            <DialogDescription>
              Document receipt of controlled substances with supplier information and DEA Form 222 (Schedule II)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name</Label>
                <Input placeholder="e.g., Cardinal Health" />
              </div>
              <div>
                <Label>Supplier DEA Number</Label>
                <Input placeholder="e.g., BC1234567" />
              </div>
            </div>

            <div>
              <Label>Supplier Address</Label>
              <Textarea placeholder="Complete supplier address..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Medication</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="methadone">Methadone HCl</SelectItem>
                    <SelectItem value="buprenorphine">Buprenorphine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Strength</Label>
                <Input placeholder="e.g., 10mg/mL" />
              </div>
              <div>
                <Label>Quantity Received</Label>
                <Input placeholder="e.g., 1000" />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Schedule II Requirement</h4>
              <div className="space-y-3">
                <div>
                  <Label>DEA Form 222 Number</Label>
                  <Input placeholder="e.g., F222-2024-001" />
                </div>
                <div>
                  <Label>Form 222 Attachment</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="file" accept=".pdf,.jpg,.png" />
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAcquisitionRecord(false)}>
                Cancel
              </Button>
              <Button>Record Acquisition</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisposalRecord} onOpenChange={setShowDisposalRecord}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Controlled Substance Disposal</DialogTitle>
            <DialogDescription>
              Document waste or destruction with proper witness signatures and DEA Form 41 (if applicable)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Disposal Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select disposal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waste">Waste (partial dose, spillage)</SelectItem>
                  <SelectItem value="destruction">Destruction (expired, recalled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Medication/Batch</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b-2023-045">Methadone - Batch B-2023-045 (Expired)</SelectItem>
                    <SelectItem value="b-2024-001">Methadone - Batch B-2024-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity Disposed</Label>
                <Input placeholder="e.g., 150.0" />
              </div>
            </div>

            <div>
              <Label>Reason for Disposal</Label>
              <Textarea placeholder="Detailed reason for disposal (e.g., expired on 12/1/2024, patient dose adjustment remainder, etc.)" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Witness 1 (Staff Initials)</Label>
                <Input placeholder="e.g., RN-JA" />
              </div>
              <div>
                <Label>Witness 2 (Staff Initials)</Label>
                <Input placeholder="e.g., MD-RW" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Destruction - DEA Form 41 Required</h4>
              <div className="space-y-3">
                <div>
                  <Label>DEA Form 41 Number</Label>
                  <Input placeholder="e.g., F41-2024-001" />
                </div>
                <div>
                  <Label>Destruction Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incineration">Incineration</SelectItem>
                      <SelectItem value="chemical">Chemical Destruction</SelectItem>
                      <SelectItem value="reverse-distributor">Reverse Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Form 41 Attachment</Label>
                  <Input type="file" accept=".pdf,.jpg,.png" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDisposalRecord(false)}>
                Cancel
              </Button>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Record Witnessed Disposal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
