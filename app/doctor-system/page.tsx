"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Send, Pill, ClipboardCheck, CheckCircle, Plus, Search, Fingerprint, Lock, X, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Patient {
  id: string
  first_name: string
  last_name: string
  mrn?: string
  date_of_birth?: string
}

export default function DoctorSystemPage() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [treatmentPlanDialogOpen, setTreatmentPlanDialogOpen] = useState(false)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState("pin")
  const [pinValue, setPinValue] = useState("")
  
  // Dynamic patient data
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientSearchQuery, setPatientSearchQuery] = useState("")

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true)
        const response = await fetch("/api/patients?status=active&limit=1000")
        if (response.ok) {
          const data = await response.json()
          setPatients(data.patients || [])
        }
      } catch (error) {
        console.error("[Doctor System] Error fetching patients:", error)
      } finally {
        setPatientsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) => {
    if (!patientSearchQuery) return true
    const query = patientSearchQuery.toLowerCase()
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const mrn = patient.mrn?.toLowerCase() || ""
    return fullName.includes(query) || mrn.includes(query)
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Physician Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Medical treatment planning, orders, prescriptions, and MAPS integration
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setTreatmentPlanDialogOpen(true)} className="bg-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Treatment Plan
                </Button>
                <Button onClick={() => setPrescriptionDialogOpen(true)} variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  E-Prescribe
                </Button>
              </div>
            </div>

            {/* Patient Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Select Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Search Patient</Label>
                    <Input 
                      placeholder="Search by name or MRN..." 
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>My Patient Panel</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select from your panel"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patientsLoading ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading patients...
                          </SelectItem>
                        ) : filteredPatients.length === 0 ? (
                          <SelectItem value="no-patients" disabled>
                            No patients found
                          </SelectItem>
                        ) : (
                          filteredPatients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.first_name} {patient.last_name}
                              {patient.mrn && ` - ${patient.mrn}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="orders">Order Queue</TabsTrigger>
                <TabsTrigger value="treatment">Treatment Plans</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              {/* Order Queue Tab */}
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-cyan-600" />
                      Pending Medication Orders
                      <Badge variant="destructive" className="ml-2">
                        8 Pending
                      </Badge>
                    </CardTitle>
                    <CardDescription>Review and sign medication orders from nursing staff</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {patientsLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading orders...
                            </div>
                          ) : (
                            "No pending medication orders"
                          )}
                        </div>
                      ) : (
                        // TODO: Replace with actual API call to fetch pending orders
                        <div className="text-center py-8 text-gray-500">
                          Pending orders will be displayed here once API is connected
                        </div>
                      )}
                      {/* Example structure - remove when API is connected
                      {orders.map((order, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">{order.patient}</div>
                              <div className="text-sm text-gray-600">Requested by {order.requestedBy}</div>
                            </div>
                            <Badge variant={order.priority === "urgent" ? "destructive" : "secondary"}>
                              {order.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-600">Medication:</span>
                              <span className="ml-2 font-medium">{order.medication}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Current:</span>
                              <span className="ml-2 font-medium">{order.currentDose}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Requested:</span>
                              <span className="ml-2 font-medium text-cyan-600">{order.requestedDose}</span>
                            </div>
                          </div>
                          <div className="text-sm mb-3">
                            <span className="text-gray-600">Clinical Justification:</span>
                            <p className="mt-1">{order.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600"
                              onClick={() => {
                                setSignatureDialogOpen(true)
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Sign
                            </Button>
                            <Button size="sm" variant="outline">
                              Request More Info
                            </Button>
                            <Button size="sm" variant="destructive">
                              Deny
                            </Button>
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Treatment Plans Tab */}
              <TabsContent value="treatment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Treatment Plans</CardTitle>
                    <CardDescription>Create and manage comprehensive medical treatment plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {patientsLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading treatment plans...
                            </div>
                          ) : (
                            "No treatment plans found. Create a new treatment plan using the button above."
                          )}
                        </div>
                      ) : (
                        // TODO: Replace with actual API call to fetch treatment plans
                        <div className="text-center py-8 text-gray-500">
                          Treatment plans will be displayed here once API is connected
                        </div>
                      )}
                      {/* Example structure - remove when API is connected
                      {treatmentPlans.map((plan, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{plan.patient}</div>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <strong>Diagnosis:</strong> {plan.diagnosis}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Treatment:</strong> {plan.plan}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              View Full Plan
                            </Button>
                            <Button size="sm" variant="outline">
                              Modify
                            </Button>
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Pill className="w-5 h-5 text-cyan-600" />
                          E-Prescribing & MAPS Integration
                        </CardTitle>
                        <CardDescription>Electronic prescribing with PDMP/MAPS monitoring</CardDescription>
                      </div>
                      <Button onClick={() => setPrescriptionDialogOpen(true)} className="bg-cyan-600">
                        <Plus className="w-4 h-4 mr-2" />
                        New Prescription
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {patientsLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading prescriptions...
                            </div>
                          ) : (
                            "No prescriptions found. Create a new prescription using the button above."
                          )}
                        </div>
                      ) : (
                        // TODO: Replace with actual API call to fetch prescriptions
                        <div className="text-center py-8 text-gray-500">
                          Prescriptions will be displayed here once API is connected
                        </div>
                      )}
                      {/* Example structure - remove when API is connected
                      {prescriptions.map((rx, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold">{rx.patient}</div>
                              <div className="text-sm text-gray-600">{rx.medication}</div>
                            </div>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Pharmacy:</strong> {rx.pharmacy}
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Last Fill:</strong> {rx.lastFill}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Check MAPS/PDMP
                            </Button>
                            <Button size="sm" variant="outline">
                              Modify
                            </Button>
                            <Button size="sm" variant="outline">
                              Discontinue
                            </Button>
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Specialist Referrals</CardTitle>
                      <Button onClick={() => setReferralDialogOpen(true)} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        New Referral
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {patientsLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading referrals...
                            </div>
                          ) : (
                            "No referrals found. Create a new referral using the button above."
                          )}
                        </div>
                      ) : (
                        // TODO: Replace with actual API call to fetch referrals
                        <div className="text-center py-8 text-gray-500">
                          Referrals will be displayed here once API is connected
                        </div>
                      )}
                      {/* Example structure - remove when API is connected
                      {referrals.map((referral, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{referral.patient}</div>
                            <Badge variant={referral.status === "scheduled" ? "default" : "secondary"}>
                              {referral.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <strong>Specialty:</strong> {referral.specialty}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Reason:</strong> {referral.reason}
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Signature Dialog */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Medical Order</DialogTitle>
            <DialogDescription>Authenticate using PIN or biometric verification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={signatureMethod === "pin" ? "default" : "outline"}
                onClick={() => setSignatureMethod("pin")}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                PIN
              </Button>
              <Button
                variant={signatureMethod === "fingerprint" ? "default" : "outline"}
                onClick={() => setSignatureMethod("fingerprint")}
                className="flex-1"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                Fingerprint
              </Button>
            </div>

            {signatureMethod === "pin" && (
              <div>
                <Label>Enter 4-Digit PIN</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value)}
                />
              </div>
            )}

            {signatureMethod === "fingerprint" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Fingerprint className="w-24 h-24 text-cyan-600 mb-4" />
                <p className="text-center text-gray-600">Place your finger on the scanner to authenticate</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600">Approve & Sign Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment Plan Dialog */}
      <Dialog open={treatmentPlanDialogOpen} onOpenChange={setTreatmentPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Treatment Plan</DialogTitle>
            <DialogDescription>
              Create a comprehensive medical treatment plan for the selected patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading patients...
                    </SelectItem>
                  ) : filteredPatients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>
                      No patients found
                    </SelectItem>
                  ) : (
                    filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                        {patient.mrn && ` (${patient.mrn})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Primary Diagnosis</Label>
              <Input placeholder="e.g., Opioid Use Disorder" />
            </div>

            <div>
              <Label>Treatment Modality</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="methadone">MAT with Methadone</SelectItem>
                  <SelectItem value="buprenorphine">MAT with Buprenorphine</SelectItem>
                  <SelectItem value="naltrexone">MAT with Naltrexone</SelectItem>
                  <SelectItem value="counseling">Counseling Only</SelectItem>
                  <SelectItem value="combined">Combined Treatment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Medication & Dosage</Label>
              <Input placeholder="e.g., Methadone 80mg daily" />
            </div>

            <div>
              <Label>Treatment Goals</Label>
              <Textarea 
                placeholder="Enter treatment goals and objectives..."
                rows={4}
              />
            </div>

            <div>
              <Label>Clinical Justification</Label>
              <Textarea 
                placeholder="Clinical reasoning for this treatment plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Review Date</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTreatmentPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-cyan-600"
              onClick={() => {
                setTreatmentPlanDialogOpen(false)
                // TODO: Add API call to save treatment plan
              }}
            >
              Create Treatment Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>E-Prescribe Medication</DialogTitle>
            <DialogDescription>
              Create a new electronic prescription with MAPS/PDMP integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading patients...
                    </SelectItem>
                  ) : filteredPatients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>
                      No patients found
                    </SelectItem>
                  ) : (
                    filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                        {patient.mrn && ` (${patient.mrn})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Medication</Label>
              <Input placeholder="e.g., Methadone 80mg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dosage</Label>
                <Input placeholder="e.g., 80mg" />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="bid">Twice Daily (BID)</SelectItem>
                    <SelectItem value="tid">Three Times Daily (TID)</SelectItem>
                    <SelectItem value="qid">Four Times Daily (QID)</SelectItem>
                    <SelectItem value="prn">As Needed (PRN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Pharmacy</Label>
              <Input placeholder="Search pharmacy name or NPI..." />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input type="number" placeholder="Number of units" />
            </div>

            <div>
              <Label>Refills</Label>
              <Input type="number" placeholder="Number of refills" />
            </div>

            <div>
              <Label>Instructions</Label>
              <Textarea 
                placeholder="Patient instructions for medication use..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <Label className="font-normal">Check MAPS/PDMP before prescribing</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-cyan-600"
              onClick={() => {
                setPrescriptionDialogOpen(false)
                // TODO: Add API call to create prescription
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Specialist Referral</DialogTitle>
            <DialogDescription>
              Refer patient to a specialist for additional care
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading patients...
                    </SelectItem>
                  ) : filteredPatients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>
                      No patients found
                    </SelectItem>
                  ) : (
                    filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                        {patient.mrn && ` (${patient.mrn})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Specialty</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="pain-management">Pain Management</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Referring Provider Name</Label>
              <Input placeholder="Your name" />
            </div>

            <div>
              <Label>Reason for Referral</Label>
              <Textarea 
                placeholder="Describe the reason for referral and relevant clinical information..."
                rows={4}
              />
            </div>

            <div>
              <Label>Urgency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergent">Emergent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Provider/Clinic (Optional)</Label>
              <Input placeholder="Name of preferred specialist or clinic" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReferralDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-cyan-600"
              onClick={() => {
                setReferralDialogOpen(false)
                // TODO: Add API call to create referral
              }}
            >
              Create Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
