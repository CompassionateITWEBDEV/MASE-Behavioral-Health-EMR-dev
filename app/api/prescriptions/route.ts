import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)

  const patientId = searchParams.get("patient_id")
  const status = searchParams.get("status")
  const prescribedBy = searchParams.get("prescribed_by")

  let query = supabase
    .from("prescriptions")
    .select(`
      *,
      patient:patients(id, first_name, last_name),
      prescriber:staff!prescribed_by(id, first_name, last_name),
      pharmacy:pharmacies(id, name, phone, address)
    `)
    .order("created_at", { ascending: false })

  if (patientId) {
    query = query.eq("patient_id", patientId)
  }

  if (status) {
    query = query.eq("status", status)
  }

  if (prescribedBy) {
    query = query.eq("prescribed_by", prescribedBy)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching prescriptions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform data to match frontend interface
  const prescriptions = data?.map((rx: any) => ({
    id: rx.id,
    patientName: rx.patient ? `${rx.patient.first_name} ${rx.patient.last_name}` : "Unknown",
    medicationName: rx.medication_name,
    strength: rx.strength,
    quantity: rx.quantity,
    daysSupply: rx.days_supply,
    refills: rx.refills,
    status: rx.status,
    prescribedDate: rx.created_at,
    pharmacyName: rx.pharmacy?.name,
    directions: rx.directions,
    transmissionStatus: rx.transmission_status,
    transmissionDate: rx.transmission_date,
  }))

  return NextResponse.json({ prescriptions })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const body = await request.json()

  const { data, error } = await supabase.from("prescriptions").insert([body]).select().single()

  if (error) {
    console.error("[v0] Error creating prescription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prescription: data })
}
