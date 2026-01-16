import { createServiceClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const documentTypes = searchParams.get("documents")?.split(",") || []

    // Get transfer record
    const { data: transfer, error: transferError } = await supabase
      .from("patient_transfers")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email,
          gender,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          insurance_provider,
          insurance_id,
          mrn,
          client_number
        )
      `)
      .eq("id", id)
      .single()

    if (transferError || !transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
    }

    const patient = transfer.patients
    const patientId = patient.id
    const documents: Record<string, any> = {}

    // Fetch documents based on selected types
    for (const docType of documentTypes) {
      switch (docType.trim()) {
        case "Demographics & Insurance":
          documents.demographics = {
            patient_name: `${patient.first_name} ${patient.last_name}`,
            date_of_birth: patient.date_of_birth,
            phone: patient.phone,
            email: patient.email,
            gender: patient.gender,
            address: patient.address,
            mrn: patient.mrn,
            client_number: patient.client_number,
            emergency_contact: {
              name: patient.emergency_contact_name,
              phone: patient.emergency_contact_phone,
            },
            insurance: {
              provider: patient.insurance_provider,
              id: patient.insurance_id,
            },
          }
          break

        case "Medication List":
          // Get active medications
          const { data: medications } = await supabase
            .from("patient_medications")
            .select("*")
            .eq("patient_id", patientId)
            .eq("status", "active")
            .order("start_date", { ascending: false })

          // Get recent prescriptions
          const { data: prescriptions } = await supabase
            .from("prescriptions")
            .select("*")
            .eq("patient_id", patientId)
            .in("status", ["pending", "sent", "filled"])
            .order("prescribed_date", { ascending: false })
            .limit(50)

          documents.medications = {
            active_medications: medications || [],
            recent_prescriptions: prescriptions || [],
          }
          break

        case "Allergy List":
          try {
            const { data: allergies } = await supabase
              .from("patient_allergies")
              .select("*")
              .eq("patient_id", patientId)
              .order("created_at", { ascending: false })

            documents.allergies = allergies || []
          } catch (e) {
            // Table might not exist, return empty array
            documents.allergies = []
          }
          break

        case "Lab Results (30 days)":
          try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: labResults } = await supabase
              .from("lab_results")
              .select("*")
              .eq("patient_id", patientId)
              .gte("test_date", thirtyDaysAgo.toISOString())
              .order("test_date", { ascending: false })

            documents.lab_results = labResults || []
          } catch (e) {
            documents.lab_results = []
          }
          break

        case "Vital Signs":
          try {
            const { data: vitalSigns } = await supabase
              .from("vital_signs")
              .select("*")
              .eq("patient_id", patientId)
              .order("recorded_at", { ascending: false })
              .limit(20)

            documents.vital_signs = vitalSigns || []
          } catch (e) {
            documents.vital_signs = []
          }
          break

        case "Progress Notes":
          try {
            const { data: progressNotes } = await supabase
              .from("progress_notes")
              .select("*")
              .eq("patient_id", patientId)
              .order("note_date", { ascending: false })
              .limit(50)

            documents.progress_notes = progressNotes || []
          } catch (e) {
            documents.progress_notes = []
          }
          break

        case "Treatment Plans":
          try {
            const { data: treatmentPlans } = await supabase
              .from("treatment_plans")
              .select("*")
              .eq("patient_id", patientId)
              .order("created_at", { ascending: false })

            documents.treatment_plans = treatmentPlans || []
          } catch (e) {
            documents.treatment_plans = []
          }
          break

        case "Assessments":
          try {
            const { data: assessments } = await supabase
              .from("assessments")
              .select("*")
              .eq("patient_id", patientId)
              .order("assessment_date", { ascending: false })
              .limit(20)

            documents.assessments = assessments || []
          } catch (e) {
            documents.assessments = []
          }
          break

        case "Medical History":
          try {
            // Get encounters for medical history
            const { data: encounters } = await supabase
              .from("encounters")
              .select("*")
              .eq("patient_id", patientId)
              .order("encounter_date", { ascending: false })
              .limit(50)

            // Get diagnoses
            const { data: diagnoses } = await supabase
              .from("patient_diagnoses")
              .select("*")
              .eq("patient_id", patientId)
              .order("diagnosis_date", { ascending: false })

            documents.medical_history = {
              encounters: encounters || [],
              diagnoses: diagnoses || [],
            }
          } catch (e) {
            documents.medical_history = { encounters: [], diagnoses: [] }
          }
          break

        case "Consents & Authorizations":
          try {
            const { data: consents } = await supabase
              .from("consents")
              .select("*")
              .eq("patient_id", patientId)
              .order("signed_date", { ascending: false })

            documents.consents = consents || []
          } catch (e) {
            documents.consents = []
          }
          break

        case "42 CFR Part 2 Consent":
          try {
            const { data: cfrConsent } = await supabase
              .from("consents")
              .select("*")
              .eq("patient_id", patientId)
              .eq("consent_type", "42_cfr_part_2")
              .order("signed_date", { ascending: false })
              .limit(1)

            documents.cfr_consent = cfrConsent?.[0] || null
          } catch (e) {
            documents.cfr_consent = null
          }
          break

        case "Discharge Summary":
          try {
            const { data: dischargeSummary } = await supabase
              .from("discharge_summaries")
              .select("*")
              .eq("patient_id", patientId)
              .order("discharge_date", { ascending: false })
              .limit(1)

            documents.discharge_summary = dischargeSummary?.[0] || null
          } catch (e) {
            documents.discharge_summary = null
          }
          break

        case "Immunization Records":
          try {
            const { data: immunizations } = await supabase
              .from("immunizations")
              .select("*")
              .eq("patient_id", patientId)
              .order("vaccination_date", { ascending: false })

            documents.immunizations = immunizations || []
          } catch (e) {
            documents.immunizations = []
          }
          break
      }
    }

    return NextResponse.json({
      success: true,
      transfer: transfer,
      documents: documents,
    })
  } catch (error) {
    console.error("Error fetching transfer documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch transfer documents" },
      { status: 500 }
    )
  }
}
