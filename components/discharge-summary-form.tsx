"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Send, ArrowLeft, Plus, X } from "lucide-react"
import { createClient } from "@/utils/supabase-client"
import { toast } from "react-toastify"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Medication {
  name: string
  dosage: string
  frequency: string
  instructions: string
}

interface FollowUpAppointment {
  provider: string
  date: string
  type: string
}

interface DischargeSummaryFormProps {
  existingSummary?: any
  isEditing?: boolean
}

export function DischargeSummaryForm({ existingSummary, isEditing = false }: DischargeSummaryFormProps) {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [providerId, setProviderId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [medications, setMedications] = useState<Medication[]>(existingSummary?.medications_at_discharge || [])
  const [followUps, setFollowUps] = useState<FollowUpAppointment[]>(existingSummary?.follow_up_appointments || [])

  const [formData, setFormData] = useState({
    patient_id: existingSummary?.patient_id || "",
    provider_id: existingSummary?.provider_id || "",
    admission_date: existingSummary?.admission_date || "",
    discharge_date: existingSummary?.discharge_date || "",
    admission_diagnosis: existingSummary?.admission_diagnosis || "",
    discharge_diagnosis: existingSummary?.discharge_diagnosis || "",
    reason_for_admission: existingSummary?.reason_for_admission || "",
    clinical_course: existingSummary?.clinical_course || "",
    treatment_summary: existingSummary?.treatment_summary || "",
    response_to_treatment: existingSummary?.response_to_treatment || "",
    complications: existingSummary?.complications || "",
    discharge_condition: existingSummary?.discharge_condition || "",
    discharge_disposition: existingSummary?.discharge_disposition || "",
    functional_status: existingSummary?.functional_status || "",
    aftercare_plan: existingSummary?.aftercare_plan || "",
    discharge_instructions: existingSummary?.discharge_instructions || "",
    medication_instructions: existingSummary?.medication_instructions || "",
    activity_restrictions: existingSummary?.activity_restrictions || "",
    diet_recommendations: existingSummary?.diet_recommendations || "",
    warning_signs: existingSummary?.warning_signs || "",
    follow_up_date: existingSummary?.follow_up_date || "",
    follow_up_provider: existingSummary?.follow_up_provider || "",
    special_considerations: existingSummary?.special_considerations || "",
    barriers_to_discharge: existingSummary?.barriers_to_discharge || "",
    family_involvement: existingSummary?.family_involvement || "",
    support_system_notes: existingSummary?.support_system_notes || "",
    patient_education_provided: existingSummary?.patient_education_provided || "",
    emergency_contact_info: existingSummary?.emergency_contact_info || "",
    status: existingSummary?.status || "draft",
  })

  useEffect(() => {
    // Fetch patients data if needed
  }, [])

  const handleSubmit = async (isDraft: boolean) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const submitData = {
        ...formData,
        status: isDraft ? "draft" : "finalized",
        finalized_at: isDraft ? null : new Date().toISOString(),
        finalized_by: isDraft ? null : providerId,
      }

      if (isEditing && existingSummary) {
        const { error } = await supabase.from("discharge_summaries").update(submitData).eq("id", existingSummary.id)

        if (error) throw error
        toast.success("Discharge summary updated successfully")
        router.push(`/discharge-summary/${existingSummary.id}`)
      } else {
        const { data, error } = await supabase.from("discharge_summaries").insert([submitData]).select().single()

        if (error) throw error
        toast.success("Discharge summary created successfully")
        router.push(`/discharge-summary/${data.id}`)
      }
    } catch (error) {
      console.error("Error saving discharge summary:", error)
      toast.error("Failed to save discharge summary")
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", instructions: "" }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const addFollowUp = () => {
    setFollowUps([...followUps, { provider: "", date: "", type: "" }])
  }

  const removeFollowUp = (index: number) => {
    setFollowUps(followUps.filter((_, i) => i !== index))
  }

  const updateFollowUp = (index: number, field: keyof FollowUpAppointment, value: string) => {
    const updated = [...followUps]
    updated[index][field] = value
    setFollowUps(updated)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/discharge-summary">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
              {isEditing ? "Edit Discharge Summary" : "New Discharge Summary"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing
                ? "Update discharge documentation and transition of care plan"
                : "Create comprehensive discharge documentation and transition of care plan"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Finalize & Submit
          </Button>
        </div>
      </div>

      {/* Patient & Admission Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-work-sans)]">Patient & Admission Information</CardTitle>
          <CardDescription>Basic patient and admission details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient ID</Label>
              <Input
                id="patient_id"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                placeholder="Select or enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discharge_disposition">Discharge Disposition</Label>
              <Select
                value={formData.discharge_disposition}
                onValueChange={(value) => setFormData({ ...formData, discharge_disposition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="home_health">Home with Health Services</SelectItem>
                  <SelectItem value="residential">Residential Treatment</SelectItem>
                  <SelectItem value="inpatient">Inpatient Facility</SelectItem>
                  <SelectItem value="ama">Against Medical Advice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admission_date">Admission Date</Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discharge_date">Discharge Date</Label>
              <Input
                id="discharge_date"
                type="date"
                value={formData.discharge_date}
                onChange={(e) => setFormData({ ...formData, discharge_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-work-sans)]">Clinical Information</CardTitle>
          <CardDescription>Diagnosis, treatment, and clinical course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admission_diagnosis">Admission Diagnosis</Label>
            <Textarea
              id="admission_diagnosis"
              value={formData.admission_diagnosis}
              onChange={(e) => setFormData({ ...formData, admission_diagnosis: e.target.value })}
              placeholder="Primary diagnosis at admission..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discharge_diagnosis">Discharge Diagnosis</Label>
            <Textarea
              id="discharge_diagnosis"
              value={formData.discharge_diagnosis}
              onChange={(e) => setFormData({ ...formData, discharge_diagnosis: e.target.value })}
              placeholder="Final diagnosis at discharge..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_for_admission">Reason for Admission</Label>
            <Textarea
              id="reason_for_admission"
              value={formData.reason_for_admission}
              onChange={(e) => setFormData({ ...formData, reason_for_admission: e.target.value })}
              placeholder="Describe the reason for admission..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinical_course">Clinical Course</Label>
            <Textarea
              id="clinical_course"
              value={formData.clinical_course}
              onChange={(e) => setFormData({ ...formData, clinical_course: e.target.value })}
              placeholder="Describe the patient's clinical course during treatment..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="treatment_summary">Treatment Summary</Label>
            <Textarea
              id="treatment_summary"
              value={formData.treatment_summary}
              onChange={(e) => setFormData({ ...formData, treatment_summary: e.target.value })}
              placeholder="Summarize treatments provided..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="response_to_treatment">Response to Treatment</Label>
              <Textarea
                id="response_to_treatment"
                value={formData.response_to_treatment}
                onChange={(e) => setFormData({ ...formData, response_to_treatment: e.target.value })}
                placeholder="Patient's response to treatment..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complications">Complications</Label>
              <Textarea
                id="complications"
                value={formData.complications}
                onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                placeholder="Any complications during treatment..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discharge Medications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Discharge Medications</CardTitle>
              <CardDescription>Medications prescribed at discharge</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addMedication}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No medications added yet</p>
              <Button variant="outline" size="sm" onClick={addMedication} className="mt-2 bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add First Medication
              </Button>
            </div>
          ) : (
            medications.map((med, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Medication {index + 1}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Medication Name</Label>
                    <Input
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      placeholder="e.g., Buprenorphine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      placeholder="e.g., 8mg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Input
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      placeholder="Special instructions..."
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Discharge Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-work-sans)]">Discharge Instructions</CardTitle>
          <CardDescription>Patient care instructions and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discharge_condition">Discharge Condition</Label>
            <Select
              value={formData.discharge_condition}
              onValueChange={(value) => setFormData({ ...formData, discharge_condition: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="unchanged">Unchanged</SelectItem>
                <SelectItem value="guarded">Guarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discharge_instructions">General Discharge Instructions</Label>
            <Textarea
              id="discharge_instructions"
              value={formData.discharge_instructions}
              onChange={(e) => setFormData({ ...formData, discharge_instructions: e.target.value })}
              placeholder="General instructions for patient care after discharge..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity_restrictions">Activity Restrictions</Label>
            <Textarea
              id="activity_restrictions"
              value={formData.activity_restrictions}
              onChange={(e) => setFormData({ ...formData, activity_restrictions: e.target.value })}
              placeholder="Any activity limitations or restrictions..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diet_recommendations">Diet Recommendations</Label>
            <Textarea
              id="diet_recommendations"
              value={formData.diet_recommendations}
              onChange={(e) => setFormData({ ...formData, diet_recommendations: e.target.value })}
              placeholder="Dietary recommendations and restrictions..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warning_signs">Warning Signs</Label>
            <Textarea
              id="warning_signs"
              value={formData.warning_signs}
              onChange={(e) => setFormData({ ...formData, warning_signs: e.target.value })}
              placeholder="Warning signs that require immediate medical attention..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-Up Care */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">Follow-Up Care</CardTitle>
              <CardDescription>Aftercare plan and follow-up appointments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addFollowUp}>
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aftercare_plan">Aftercare Plan</Label>
            <Textarea
              id="aftercare_plan"
              value={formData.aftercare_plan}
              onChange={(e) => setFormData({ ...formData, aftercare_plan: e.target.value })}
              placeholder="Comprehensive aftercare plan..."
              rows={4}
            />
          </div>

          {followUps.length > 0 && (
            <div className="space-y-3">
              <Label>Follow-Up Appointments</Label>
              {followUps.map((followUp, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Appointment {index + 1}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => removeFollowUp(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Input
                        value={followUp.provider}
                        onChange={(e) => updateFollowUp(index, "provider", e.target.value)}
                        placeholder="Provider name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={followUp.date}
                        onChange={(e) => updateFollowUp(index, "date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input
                        value={followUp.type}
                        onChange={(e) => updateFollowUp(index, "type", e.target.value)}
                        placeholder="e.g., Therapy"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="functional_status">Functional Status</Label>
              <Textarea
                id="functional_status"
                value={formData.functional_status}
                onChange={(e) => setFormData({ ...formData, functional_status: e.target.value })}
                placeholder="Patient's functional abilities at discharge..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_system_notes">Support System</Label>
              <Textarea
                id="support_system_notes"
                value={formData.support_system_notes}
                onChange={(e) => setFormData({ ...formData, support_system_notes: e.target.value })}
                placeholder="Available support systems and resources..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-work-sans)]">Additional Information</CardTitle>
          <CardDescription>Special considerations and patient education</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="special_considerations">Special Considerations</Label>
            <Textarea
              id="special_considerations"
              value={formData.special_considerations}
              onChange={(e) => setFormData({ ...formData, special_considerations: e.target.value })}
              placeholder="Any special considerations for this patient..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barriers_to_discharge">Barriers to Discharge</Label>
            <Textarea
              id="barriers_to_discharge"
              value={formData.barriers_to_discharge}
              onChange={(e) => setFormData({ ...formData, barriers_to_discharge: e.target.value })}
              placeholder="Any barriers that were addressed or remain..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="family_involvement">Family Involvement</Label>
            <Textarea
              id="family_involvement"
              value={formData.family_involvement}
              onChange={(e) => setFormData({ ...formData, family_involvement: e.target.value })}
              placeholder="Family involvement in care and discharge planning..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient_education_provided">Patient Education Provided</Label>
            <Textarea
              id="patient_education_provided"
              value={formData.patient_education_provided}
              onChange={(e) => setFormData({ ...formData, patient_education_provided: e.target.value })}
              placeholder="Education topics covered with patient..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_info">Emergency Contact Information</Label>
            <Textarea
              id="emergency_contact_info"
              value={formData.emergency_contact_info}
              onChange={(e) => setFormData({ ...formData, emergency_contact_info: e.target.value })}
              placeholder="Emergency contact details..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pb-8">
        <Link href="/discharge-summary">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Finalize & Submit
        </Button>
      </div>
    </div>
  )
}
