import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

interface PrescriptionPayload {
  patient_id: string
  prescribed_by: string
  medication_name: string
  generic_name?: string
  dosage: string
  quantity: number
  refills?: number
  directions: string
  pharmacy_name?: string
  pharmacy_address?: string
  pharmacy_phone?: string
  pharmacy_npi?: string
  notes?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const patientId = searchParams.get("patient_id")

    let query = supabase
      .from("prescriptions")
      .select("*")
      .order("prescribed_date", { ascending: false })
      .limit(100)

    if (status) {
      query = query.eq("status", status)
    }

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data: prescriptions, error } = await query

    if (error) {
      console.error("[prescriptions] fetch failed", error)
      return NextResponse.json({ error: "Failed to load prescriptions" }, { status: 500 })
    }

    const patientIds = Array.from(new Set((prescriptions ?? []).map((rx: any) => rx.patient_id).filter(Boolean)))
    const prescriberIds = Array.from(new Set((prescriptions ?? []).map((rx: any) => rx.prescribed_by).filter(Boolean)))

    const patientNames = await loadPatientNames(supabase, patientIds)
    const prescriberNames = await loadStaffNames(supabase, prescriberIds)

    const response = (prescriptions ?? []).map((rx: any) => ({
      ...rx,
      patient_name: patientNames.get(rx.patient_id) ?? "Unknown patient",
      prescriber_name: prescriberNames.get(rx.prescribed_by) ?? "Unknown prescriber",
    }))

    return NextResponse.json({ prescriptions: response })
  } catch (error) {
    console.error("[prescriptions] list error", error)
    return NextResponse.json({ error: "Failed to load prescriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PrescriptionPayload
    const validationError = validatePayload(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const prescriptionNumber = generatePrescriptionNumber()
    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert({
        ...body,
        refills: body.refills ?? 0,
        prescription_number: prescriptionNumber,
        status: "pending",
      })
      .select("*")
      .single()

    if (error || !prescription) {
      console.error("[prescriptions] insert failed", error)
      return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 })
    }

    await logStaffActivity(supabase, {
      staff_id: body.prescribed_by,
      action: "prescription_created",
      resource_id: prescription.id,
      details: {
        medication_name: body.medication_name,
        patient_id: body.patient_id,
      },
    })

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error("[prescriptions] create error", error)
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 })
  }
}

function validatePayload(body: PrescriptionPayload) {
  if (!body.patient_id) return "Patient is required"
  if (!body.prescribed_by) return "Prescriber is required"
  if (!body.medication_name) return "Medication name is required"
  if (!body.dosage) return "Dosage is required"
  if (!Number.isFinite(Number(body.quantity)) || Number(body.quantity) <= 0) return "Quantity must be a positive number"
  if (!body.directions) return "Directions are required"
  return null
}

function generatePrescriptionNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0")
  return `RX-${timestamp}-${random}`
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

async function logStaffActivity(
  supabase: any,
  entry: { staff_id: string; action: string; resource_id: string; details?: Record<string, any> },
) {
  await supabase.from("staff_activity_log").insert({
    staff_id: entry.staff_id,
    action: entry.action,
    resource_type: "prescription",
    resource_id: entry.resource_id,
    details: entry.details ?? {},
  })
}
