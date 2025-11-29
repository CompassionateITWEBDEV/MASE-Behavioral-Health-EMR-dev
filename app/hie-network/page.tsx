"use client"

import type React from "react"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Network, Building2, FileText, CheckCircle2, Clock, XCircle, Search, Plus, Send, Shield } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HIENetworkPage() {
  const [selectedTab, setSelectedTab] = useState("directory")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClinic, setSelectedClinic] = useState<any>(null)
  const [consentDialogOpen, setConsentDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)

  // Fetch network data
  const { data: registryData, mutate: mutateRegistry } = useSWR("/api/hie/registry", fetcher)
  const { data: consentsData, mutate: mutateConsents } = useSWR("/api/hie/consents", fetcher)
  const { data: requestsData, mutate: mutateRequests } = useSWR("/api/hie/data-requests", fetcher)
  const { data: referralsData, mutate: mutateReferrals } = useSWR("/api/hie/referrals?direction=outgoing", fetcher)
  const { data: incomingReferrals } = useSWR("/api/hie/referrals?direction=incoming", fetcher)
  const { data: patientsData } = useSWR("/api/patients", fetcher)

  const clinics = registryData?.clinics || []
  const directory = registryData?.directory || []
  const consents = consentsData?.consents || []
  const requests = requestsData?.requests || []
  const referrals = referralsData?.referrals || []
  const incoming = incomingReferrals?.referrals || []
  const patients = patientsData?.patients || []

  const filteredClinics = directory.filter(
    (clinic: any) =>
      clinic.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.specialties?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateConsent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const response = await fetch("/api/hie/consents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: formData.get("patient_id"),
        consent_type: formData.get("consent_type"),
        share_demographics: formData.get("share_demographics") === "on",
        share_medications: formData.get("share_medications") === "on",
        share_diagnoses: formData.get("share_diagnoses") === "on",
        share_lab_results: formData.get("share_lab_results") === "on",
        share_treatment_plans: formData.get("share_treatment_plans") === "on",
        share_clinical_notes: formData.get("share_clinical_notes") === "on",
        share_mental_health_records: formData.get("share_mental_health_records") === "on",
        share_substance_use_records: formData.get("share_substance_use_records") === "on",
        authorized_clinics: formData.getAll("authorized_clinics"),
        effective_date: formData.get("effective_date"),
        expiration_date: formData.get("expiration_date"),
        consent_form_signed: true,
        signed_date: new Date().toISOString().split("T")[0],
        witness_name: formData.get("witness_name"),
      }),
    })

    if (response.ok) {
      setConsentDialogOpen(false)
      mutateConsents()
    }
  }

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const response = await fetch("/api/hie/data-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_clinic_id: formData.get("source_clinic_id"),
        patient_id: formData.get("patient_id"),
        requesting_provider_name: formData.get("requesting_provider_name"),
        requesting_provider_npi: formData.get("requesting_provider_npi"),
        request_type: formData.get("request_type"),
        request_reason: formData.get("request_reason"),
        urgency: formData.get("urgency"),
        data_types_requested: formData.getAll("data_types"),
        date_range_start: formData.get("date_range_start"),
        date_range_end: formData.get("date_range_end"),
      }),
    })

    if (response.ok) {
      setRequestDialogOpen(false)
      mutateRequests()
    }
  }

  const handleCreateReferral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const response = await fetch("/api/hie/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiving_clinic_id: formData.get("receiving_clinic_id"),
        patient_id: formData.get("patient_id"),
        referring_provider_name: formData.get("referring_provider_name"),
        referring_provider_npi: formData.get("referring_provider_npi"),
        receiving_provider_name: formData.get("receiving_provider_name"),
        receiving_provider_specialty: formData.get("receiving_provider_specialty"),
        referral_type: formData.get("referral_type"),
        referral_reason: formData.get("referral_reason"),
        chief_complaint: formData.get("chief_complaint"),
        diagnosis_codes: formData
          .get("diagnosis_codes")
          ?.toString()
          .split(",")
          .map((c) => c.trim()),
        clinical_summary: formData.get("clinical_summary"),
        urgency: formData.get("urgency"),
        preferred_appointment_date: formData.get("preferred_appointment_date"),
      }),
    })

    if (response.ok) {
      setReferralDialogOpen(false)
      mutateReferrals()
    }
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Network className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">MASE Health Information Exchange</h1>
            </div>
            <p className="text-muted-foreground">
              Connect with other MASE EMR clinics to share patient data securely and streamline referrals
            </p>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Clinics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registryData?.network_stats?.total_clinics || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across {registryData?.network_stats?.total_states || 0} states
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consents.length}</div>
                <p className="text-xs text-muted-foreground">Patients authorized</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests.filter((r: any) => r.request_status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Data requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {referrals.filter((r: any) => ["pending", "scheduled"].includes(r.referral_status)).length}
                </div>
                <p className="text-xs text-muted-foreground">Outgoing referrals</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="directory">Clinic Directory</TabsTrigger>
              <TabsTrigger value="consents">Patient Consents</TabsTrigger>
              <TabsTrigger value="requests">Data Requests</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>

            {/* Clinic Directory Tab */}
            <TabsContent value="directory" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clinics by name, location, or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClinics.map((clinic: any) => (
                  <Card key={clinic.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{clinic.display_name}</CardTitle>
                          <CardDescription>
                            {clinic.city}, {clinic.state}
                          </CardDescription>
                        </div>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {clinic.specialties?.map((spec: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={clinic.accepting_new_patients ? "text-green-600" : "text-muted-foreground"}>
                          {clinic.accepting_new_patients ? "✓ Accepting new patients" : "Not accepting new patients"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedClinic(clinic)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Referral
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create Referral to {clinic.display_name}</DialogTitle>
                              <DialogDescription>Send a patient referral to this clinic</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateReferral} className="space-y-4">
                              <input type="hidden" name="receiving_clinic_id" value={selectedClinic?.clinic_id} />

                              <div>
                                <Label>Patient</Label>
                                <Select name="patient_id" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {patients.map((patient: any) => (
                                      <SelectItem key={patient.id} value={patient.id}>
                                        {patient.first_name} {patient.last_name} - DOB: {patient.date_of_birth}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Your Name</Label>
                                  <Input name="referring_provider_name" required placeholder="Dr. John Smith" />
                                </div>
                                <div>
                                  <Label>Your NPI</Label>
                                  <Input name="referring_provider_npi" placeholder="1234567890" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Receiving Provider (Optional)</Label>
                                  <Input name="receiving_provider_name" placeholder="Dr. Jane Doe" />
                                </div>
                                <div>
                                  <Label>Specialty</Label>
                                  <Select name="receiving_provider_specialty">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                                      <SelectItem value="primary_care">Primary Care</SelectItem>
                                      <SelectItem value="cardiology">Cardiology</SelectItem>
                                      <SelectItem value="behavioral_health">Behavioral Health</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <Label>Referral Type</Label>
                                <Select name="referral_type" required>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="specialist">Specialist Consultation</SelectItem>
                                    <SelectItem value="primary_care">Primary Care</SelectItem>
                                    <SelectItem value="mental_health">Mental Health</SelectItem>
                                    <SelectItem value="substance_use">Substance Use Treatment</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Referral Reason</Label>
                                <Textarea name="referral_reason" required placeholder="Brief reason for referral..." />
                              </div>

                              <div>
                                <Label>Chief Complaint</Label>
                                <Input name="chief_complaint" placeholder="Patient's main concern..." />
                              </div>

                              <div>
                                <Label>Diagnosis Codes (comma-separated)</Label>
                                <Input name="diagnosis_codes" placeholder="F11.20, Z87.891" />
                              </div>

                              <div>
                                <Label>Clinical Summary</Label>
                                <Textarea
                                  name="clinical_summary"
                                  rows={4}
                                  placeholder="Relevant clinical information..."
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Urgency</Label>
                                  <Select name="urgency" defaultValue="routine">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="emergency">Emergency</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                      <SelectItem value="routine">Routine</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Preferred Appointment Date</Label>
                                  <Input type="date" name="preferred_appointment_date" />
                                </div>
                              </div>

                              <Button type="submit" className="w-full">
                                Create Referral
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClinic(clinic)
                            setRequestDialogOpen(true)
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Request Records
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Patient Consents Tab */}
            <TabsContent value="consents" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {consents.length} active consent{consents.length !== 1 ? "s" : ""} for data sharing
                </p>
                <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Consent
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Patient Consent for HIE Data Sharing</DialogTitle>
                      <DialogDescription>
                        Obtain patient authorization to share records with other MASE network clinics
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateConsent} className="space-y-4">
                      <div>
                        <Label>Patient</Label>
                        <Select name="patient_id" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient: any) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.first_name} {patient.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Consent Type</Label>
                        <Select name="consent_type" required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_access">Full Access - All Records</SelectItem>
                            <SelectItem value="limited">Limited - Selected Information Only</SelectItem>
                            <SelectItem value="emergency_only">Emergency Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Information Types to Share:</Label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_demographics" defaultChecked />
                            <span className="text-sm">Demographics</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_medications" defaultChecked />
                            <span className="text-sm">Medications</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_diagnoses" defaultChecked />
                            <span className="text-sm">Diagnoses</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_lab_results" defaultChecked />
                            <span className="text-sm">Lab Results</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_treatment_plans" defaultChecked />
                            <span className="text-sm">Treatment Plans</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_clinical_notes" />
                            <span className="text-sm">Clinical Notes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_mental_health_records" />
                            <span className="text-sm font-medium text-orange-600">
                              Mental Health Records (Requires Specific Consent)
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" name="share_substance_use_records" />
                            <span className="text-sm font-medium text-red-600">
                              Substance Use Records (42 CFR Part 2 - Requires Specific Consent)
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label>Authorized Clinics (Optional - Leave blank for all network clinics)</Label>
                        <Select name="authorized_clinics">
                          <SelectTrigger>
                            <SelectValue placeholder="All network clinics" />
                          </SelectTrigger>
                          <SelectContent>
                            {clinics.map((clinic: any) => (
                              <SelectItem key={clinic.id} value={clinic.id}>
                                {clinic.clinic_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Effective Date</Label>
                          <Input type="date" name="effective_date" required />
                        </div>
                        <div>
                          <Label>Expiration Date (Optional)</Label>
                          <Input type="date" name="expiration_date" />
                        </div>
                      </div>

                      <div>
                        <Label>Witness Name</Label>
                        <Input name="witness_name" required placeholder="Staff member name" />
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-primary mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium mb-1">42 CFR Part 2 Notice</p>
                            <p className="text-muted-foreground">
                              This consent is being requested to share substance use disorder treatment records. This
                              information has been disclosed to you from records protected by federal confidentiality
                              rules (42 CFR Part 2). The federal rules prohibit you from making any further disclosure
                              of this information unless further disclosure is expressly permitted by the written
                              consent of the person to whom it pertains or as otherwise permitted by 42 CFR Part 2.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Create Consent Authorization
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {consents.map((consent: any) => (
                  <Card key={consent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {consent.patient?.first_name} {consent.patient?.last_name}
                          </CardTitle>
                          <CardDescription>
                            Consent Type: {consent.consent_type.replace("_", " ").toUpperCase()}
                          </CardDescription>
                        </div>
                        <Badge variant={consent.consent_status === "active" ? "default" : "secondary"}>
                          {consent.consent_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Effective Date</p>
                          <p className="font-medium">{consent.effective_date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expiration</p>
                          <p className="font-medium">{consent.expiration_date || "No expiration"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Authorized Data Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {consent.share_demographics && <Badge variant="outline">Demographics</Badge>}
                          {consent.share_medications && <Badge variant="outline">Medications</Badge>}
                          {consent.share_diagnoses && <Badge variant="outline">Diagnoses</Badge>}
                          {consent.share_lab_results && <Badge variant="outline">Labs</Badge>}
                          {consent.share_treatment_plans && <Badge variant="outline">Treatment Plans</Badge>}
                          {consent.share_clinical_notes && <Badge variant="outline">Clinical Notes</Badge>}
                          {consent.share_mental_health_records && (
                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                              Mental Health
                            </Badge>
                          )}
                          {consent.share_substance_use_records && (
                            <Badge variant="outline" className="border-red-600 text-red-600">
                              Substance Use (42 CFR)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Data Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {requests.length} total request{requests.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {requests.map((request: any) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.patient?.first_name} {request.patient?.last_name}
                          </CardTitle>
                          <CardDescription>Request #{request.request_number}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            request.request_status === "completed"
                              ? "default"
                              : request.request_status === "pending"
                                ? "secondary"
                                : request.request_status === "denied"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {request.request_status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {request.request_status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {request.request_status === "denied" && <XCircle className="h-3 w-3 mr-1" />}
                          {request.request_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">From</p>
                          <p className="font-medium">{request.requesting_clinic?.clinic_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">To</p>
                          <p className="font-medium">{request.source_clinic?.clinic_name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="text-sm">{request.request_reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Data Requested:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.data_types_requested?.map((type: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {request.consent_verified ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Patient consent verified
                          </span>
                        ) : (
                          <span className="text-orange-600">Patient consent required</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-4">
              <div className="mb-4">
                <Tabs defaultValue="outgoing">
                  <TabsList>
                    <TabsTrigger value="outgoing">Outgoing ({referrals.length})</TabsTrigger>
                    <TabsTrigger value="incoming">Incoming ({incoming.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="outgoing" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      {referrals.map((referral: any) => (
                        <Card key={referral.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {referral.patient?.first_name} {referral.patient?.last_name}
                                </CardTitle>
                                <CardDescription>Referral #{referral.referral_number}</CardDescription>
                              </div>
                              <Badge
                                variant={
                                  referral.referral_status === "completed"
                                    ? "default"
                                    : referral.referral_status === "scheduled"
                                      ? "secondary"
                                      : referral.referral_status === "pending"
                                        ? "outline"
                                        : "destructive"
                                }
                              >
                                {referral.referral_status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">To Clinic</p>
                                <p className="font-medium">{referral.receiving_clinic?.clinic_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {referral.receiving_clinic?.city}, {referral.receiving_clinic?.state}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Specialty</p>
                                <p className="font-medium">
                                  {referral.receiving_provider_specialty || "Not specified"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Reason</p>
                              <p className="text-sm">{referral.referral_reason}</p>
                            </div>
                            {referral.urgency && (
                              <Badge variant={referral.urgency === "emergency" ? "destructive" : "outline"}>
                                {referral.urgency}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="incoming" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      {incoming.map((referral: any) => (
                        <Card key={referral.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {referral.patient?.first_name} {referral.patient?.last_name}
                                </CardTitle>
                                <CardDescription>From {referral.referring_clinic?.clinic_name}</CardDescription>
                              </div>
                              <Badge variant="secondary">New Referral</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Referring Provider</p>
                              <p className="font-medium">{referral.referring_provider_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Reason</p>
                              <p className="text-sm">{referral.referral_reason}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm">Accept Referral</Button>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
