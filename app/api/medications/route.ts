import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

interface MedicationPayload {
  patient_id: string
  medication_name: string
  generic_name?: string
  dosage: string
  frequency: string
  route: string
  start_date: string
  end_date?: string
  prescribed_by?: string
  medication_type?: string
  ndc_number?: string
  pharmacy_name?: string
  pharmacy_phone?: string
  refills_remaining?: number
  notes?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const patientId = searchParams.get("patient_id")

    let query = supabase
      .from("patient_medications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (status) {
      query = query.eq("status", status)
    }

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data: medications, error } = await query

    if (error) {
      console.error("[medications] fetch failed", error)
      return NextResponse.json({ error: "Failed to load medications" }, { status: 500 })
    }

    const patientIds = Array.from(new Set((medications ?? []).map((med: any) => med.patient_id).filter(Boolean)))
    const prescriberIds = Array.from(new Set((medications ?? []).map((med: any) => med.prescribed_by).filter(Boolean)))

    const patientNames = await loadPatientNames(supabase, patientIds)
    const prescriberNames = await loadStaffNames(supabase, prescriberIds)

    const response = (medications ?? []).map((med: any) => ({
      ...med,
      patient_name: patientNames.get(med.patient_id) ?? "Unknown patient",
      prescriber_name: med.prescribed_by ? prescriberNames.get(med.prescribed_by) ?? "Unknown prescriber" : null,
    }))

    return NextResponse.json({ medications: response })
  } catch (error) {
    console.error("[medications] list error", error)
    return NextResponse.json({ error: "Failed to load medications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MedicationPayload
    const validationError = validate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const payload = {
      ...body,
      medication_type: body.medication_type ?? "regular",
      refills_remaining: body.refills_remaining ?? 0,
      status: "active",
    }

    const { data: medication, error } = await supabase
      .from("patient_medications")
      .insert(payload)
      .select("*")
      .single()

    if (error || !medication) {
      console.error("[medications] insert failed", error)
      return NextResponse.json({ error: "Failed to add medication" }, { status: 500 })
    }

    if (body.prescribed_by) {
      await supabase.from("staff_activity_log").insert({
        staff_id: body.prescribed_by,
        action: "medication_added",
        resource_type: "patient_medication",
        resource_id: medication.id,
        details: { patient_id: body.patient_id, medication_name: body.medication_name },
      })
    }

    return NextResponse.json({ medication })
  } catch (error) {
    console.error("[medications] create error", error)
    return NextResponse.json({ error: "Failed to add medication" }, { status: 500 })
  }
}

function validate(body: MedicationPayload) {
  if (!body.patient_id) return "Patient is required"
  if (!body.medication_name) return "Medication name is required"
  if (!body.dosage) return "Dosage is required"
  if (!body.frequency) return "Frequency is required"
  if (!body.route) return "Route is required"
  if (!body.start_date) return "Start date is required"
  return null
}

async function loadPatientNames(supabase: any, patientIds: any[]) {
  const names = new Map<any, string>()
  if (patientIds.length === 0) {
    return names
  }

  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .in("id", patientIds)

  for (const patient of patients ?? []) {
    names.set(patient.id, `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim())
  }

  return names
}

async function loadStaffNames(supabase: any, staffIds: any[]) {
  const names = new Map<any, string>()
  if (staffIds.length === 0) {
    return names
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("id, first_name, last_name, employee_id")
    .in("id", staffIds)

  for (const member of staff ?? []) {
    const label = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || member.employee_id
    if (label) {
      names.set(member.id, label)
    }
  }

  return names
}
