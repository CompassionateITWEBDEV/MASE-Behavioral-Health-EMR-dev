"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  QrCode,
  Search,
  Printer,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  Clock,
  Camera,
  Package,
  Scan,
  FileText,
  Download,
  Home,
} from "lucide-react"

// Mock data
const patientsForDispensing = [
  {
    id: "P001",
    name: "John Doe",
    dob: "1985-03-15",
    takehome_level: 6,
    medication: "Methadone",
    dose: "80mg",
    last_dose: "2025-01-27",
    next_pickup: "2025-01-28",
    bottles_due: 6,
    home_verified: true,
    biometric_enrolled: true,
    compliance_score: 94,
    alerts: [],
  },
  {
    id: "P002",
    name: "Jane Smith",
    dob: "1990-07-22",
    takehome_level: 13,
    medication: "Methadone",
    dose: "120mg",
    last_dose: "2025-01-14",
    next_pickup: "2025-01-28",
    bottles_due: 13,
    home_verified: true,
    biometric_enrolled: true,
    compliance_score: 98,
    alerts: [],
  },
  {
    id: "P003",
    name: "Mike Johnson",
    dob: "1978-11-30",
    takehome_level: 6,
    medication: "Buprenorphine",
    dose: "16mg",
    last_dose: "2025-01-21",
    next_pickup: "2025-01-28",
    bottles_due: 6,
    home_verified: true,
    biometric_enrolled: false,
    compliance_score: 85,
    alerts: ["Biometric enrollment required"],
  },
]

const recentDispensing = [
  {
    id: 1,
    patient: "Sarah Wilson",
    time: "8:30 AM",
    bottles: 6,
    medication: "Methadone 60mg",
    nurse: "Nancy RN",
    status: "complete",
  },
  {
    id: 2,
    patient: "Robert Brown",
    time: "9:15 AM",
    bottles: 13,
    medication: "Methadone 100mg",
    nurse: "Nancy RN",
    status: "complete",
  },
  {
    id: 3,
    patient: "Emily Davis",
    time: "10:00 AM",
    bottles: 6,
    medication: "Buprenorphine 8mg",
    nurse: "Nancy RN",
    status: "pending",
  },
]

export default function TakeHomeBottlesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<(typeof patientsForDispensing)[0] | null>(null)
  const [showDispenseDialog, setShowDispenseDialog] = useState(false)
  const [bottlesToDispense, setBottlesToDispense] = useState<number[]>([])
  const [generatedQRCodes, setGeneratedQRCodes] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [dispensingComplete, setDispensingComplete] = useState(false)

  const handleSelectPatient = (patient: (typeof patientsForDispensing)[0]) => {
    setSelectedPatient(patient)
    setBottlesToDispense(Array.from({ length: patient.bottles_due }, (_, i) => i + 1))
    setGeneratedQRCodes([])
    setDispensingComplete(false)
    setShowDispenseDialog(true)
  }

  const handleGenerateQRCodes = async () => {
    if (!selectedPatient) return

    setIsGenerating(true)

    // Simulate QR code generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const qrCodes = bottlesToDispense.map((bottleNum) => ({
      bottle_id: `BTL-${Date.now()}-${String(bottleNum).padStart(3, "0")}`,
      bottle_number: bottleNum,
      qr_data: `MASE|${selectedPatient.id}|${selectedPatient.medication}|${selectedPatient.dose}|${bottleNum}|${Date.now()}`,
      expected_date: new Date(Date.now() + (bottleNum - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }))

    setGeneratedQRCodes(qrCodes)
    setIsGenerating(false)
  }

  const handleCompleteDispensing = async () => {
    // Submit to server
    try {
      await fetch("/api/takehome-diversion/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient?.id,
          bottles: generatedQRCodes,
          dispensed_by: "current_nurse_id",
          dispense_timestamp: new Date().toISOString(),
        }),
      })

      setDispensingComplete(true)
    } catch (error) {
      console.error("Failed to record dispensing:", error)
    }
  }

  const handlePrintLabels = () => {
    // Print QR code labels
    window.print()
  }

  const filteredPatients = patientsForDispensing.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashboardSidebar />

      <main className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
              Take-Home Bottle Dispensing
            </h1>
            <p style={{ color: "#64748b" }}>Generate QR codes and dispense take-home medications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Dispensing Log
            </Button>
            <Button className="gap-2" style={{ backgroundColor: "#0891b2" }}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#e0f2fe" }}>
                  <Package className="h-5 w-5" style={{ color: "#0891b2" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Pending Pickups
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                    12
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#dcfce7" }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Dispensed Today
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                    8
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Enrollment Issues
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#d97706" }}>
                    2
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#f3e8ff" }}>
                  <QrCode className="h-5 w-5" style={{ color: "#9333ea" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Bottles Generated
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                    156
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Patient Selection */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" style={{ color: "#0891b2" }} />
                  Patients Due for Take-Home
                </CardTitle>
                <CardDescription>Select a patient to generate QR-coded bottles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>TH Level</TableHead>
                      <TableHead>Bottles Due</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{patient.medication}</p>
                            <p className="text-sm text-gray-500">{patient.dose}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.takehome_level} days</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg">{patient.bottles_due}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  patient.compliance_score >= 95
                                    ? "#22c55e"
                                    : patient.compliance_score >= 85
                                      ? "#eab308"
                                      : "#ef4444",
                              }}
                            />
                            <span>{patient.compliance_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {patient.home_verified ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Home className="h-3 w-3 mr-1" />
                                GPS
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                <Home className="h-3 w-3 mr-1" />
                                No GPS
                              </Badge>
                            )}
                            {patient.biometric_enrolled ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Camera className="h-3 w-3 mr-1" />
                                Bio
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                <Camera className="h-3 w-3 mr-1" />
                                No Bio
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectPatient(patient)}
                            style={{ backgroundColor: "#0891b2" }}
                            disabled={!patient.home_verified || !patient.biometric_enrolled}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Dispense
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Recent Dispensing */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" style={{ color: "#0891b2" }} />
                  Recent Dispensing
                </CardTitle>
                <CardDescription>Today's take-home activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDispensing.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{item.patient}</p>
                        <Badge
                          variant={item.status === "complete" ? "default" : "secondary"}
                          className={item.status === "complete" ? "bg-green-100 text-green-800" : ""}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>{item.medication}</p>
                        <p>
                          {item.bottles} bottles at {item.time}
                        </p>
                        <p>By: {item.nurse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Home className="h-4 w-4" />
                  Register Home Address
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Camera className="h-4 w-4" />
                  Enroll Biometrics
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Scan className="h-4 w-4" />
                  Scan Returned Bottle
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dispense Dialog */}
        <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" style={{ color: "#0891b2" }} />
                Generate Take-Home Bottles
              </DialogTitle>
              <DialogDescription>
                Generate QR-coded labels for {selectedPatient?.name}'s take-home medication
              </DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <div className="space-y-4">
                {/* Patient Info */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#f1f5f9" }}>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient</p>
                      <p className="font-bold">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medication</p>
                      <p className="font-bold">
                        {selectedPatient.medication} {selectedPatient.dose}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Take-Home Level</p>
                      <p className="font-bold">{selectedPatient.takehome_level} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bottles to Generate</p>
                      <p className="font-bold text-xl" style={{ color: "#0891b2" }}>
                        {bottlesToDispense.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Home Address Verified</p>
                        <p className="text-sm text-green-600">GPS coordinates registered</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Biometrics Enrolled</p>
                        <p className="text-sm text-green-600">Facial recognition active</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated QR Codes */}
                {generatedQRCodes.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <QrCode className="h-4 w-4" style={{ color: "#0891b2" }} />
                      Generated Bottle Labels
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {generatedQRCodes.map((qr) => (
                        <div key={qr.bottle_id} className="p-3 border rounded-lg text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center">
                            <QrCode className="h-12 w-12 text-gray-600" />
                          </div>
                          <p className="font-mono text-xs">{qr.bottle_id}</p>
                          <p className="text-xs text-gray-500">Bottle #{qr.bottle_number}</p>
                          <p className="text-xs text-gray-500">{qr.expected_date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nurse Verification */}
                {!dispensingComplete && generatedQRCodes.length > 0 && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Nurse Verification Required</AlertTitle>
                    <AlertDescription>
                      By completing this dispensing, you confirm that you have:
                      <ul className="list-disc ml-4 mt-2">
                        <li>Verified patient identity</li>
                        <li>Prepared {bottlesToDispense.length} labeled bottles</li>
                        <li>Affixed QR code labels to each bottle</li>
                        <li>Provided patient education on the verification process</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {dispensingComplete && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Dispensing Complete</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {bottlesToDispense.length} bottles have been dispensed and recorded. The patient will receive SMS
                      reminders for daily dose verification.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter>
              {!generatedQRCodes.length ? (
                <Button onClick={handleGenerateQRCodes} disabled={isGenerating} style={{ backgroundColor: "#0891b2" }}>
                  {isGenerating ? "Generating..." : "Generate QR Codes"}
                </Button>
              ) : !dispensingComplete ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrintLabels}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Labels
                  </Button>
                  <Button onClick={handleCompleteDispensing} style={{ backgroundColor: "#16a34a" }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Dispensing
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowDispenseDialog(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
