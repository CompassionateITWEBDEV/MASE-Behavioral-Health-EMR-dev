import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") ?? "open"

    let query = supabase
      .from("compliance_holds")
      .select("id, patient_id, reason_code, opened_by, opened_time, requires_counselor, status")
      .order("opened_time", { ascending: false })
      .limit(50)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: holds, error } = await query

    if (error) {
      console.error("[takehome] holds fetch failed", error)
      return NextResponse.json({ error: "Failed to load compliance holds" }, { status: 500 })
    }

    const patientIds = Array.from(new Set((holds ?? []).map((hold: any) => hold.patient_id).filter(Boolean)))
    const patientNames = await loadPatientNames(supabase, patientIds)
    const staffIds = Array.from(new Set((holds ?? []).map((hold: any) => hold.opened_by).filter(Boolean)))
    const staffNames = await loadStaffNames(supabase, staffIds)

    const response = (holds ?? []).map((hold: any) => ({
      ...hold,
      patient_name: patientNames.get(hold.patient_id) ?? "Unknown patient",
      opened_by_name: staffNames.get(hold.opened_by) ?? hold.opened_by ?? "System",
    }))

    return NextResponse.json({ holds: response })
  } catch (error) {
    console.error("[takehome] holds list error", error)
    return NextResponse.json({ error: "Failed to load compliance holds" }, { status: 500 })
  }
}

async function loadPatientNames(supabase: any, patientIds: any[]) {
  const names = new Map<any, string>()
  if (patientIds.length === 0) {
    return names
  }

  const { data: dispensingPatients } = await supabase
    .from("patient_dispensing")
    .select("id, name")
    .in("id", patientIds)

  for (const patient of dispensingPatients ?? []) {
    names.set(patient.id, patient.name)
  }

  const missing = patientIds.filter((id) => !names.has(id))
  if (missing.length > 0) {
    const { data: corePatients } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .in("id", missing)

    for (const patient of corePatients ?? []) {
      names.set(patient.id, `${patient.first_name} ${patient.last_name}`.trim())
    }
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
