import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const providerId = searchParams.get("provider_id")
    const patientId = searchParams.get("patient_id")
    const date = searchParams.get("date")

    let query = supabase
      .from("appointments")
      .select(`
        *,
        patients (id, first_name, last_name, date_of_birth, phone, email),
        providers (id, first_name, last_name, specialization)
      `)
      .order("appointment_date", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (providerId) {
      query = query.eq("provider_id", providerId)
    }
    if (patientId) {
      query = query.eq("patient_id", patientId)
    }
    if (date) {
      query = query.gte("appointment_date", `${date}T00:00:00`).lte("appointment_date", `${date}T23:59:59`)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      console.error("[v0] Error fetching appointments:", error)
      return NextResponse.json({ appointments: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointments: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in appointments GET:", error)
    return NextResponse.json({ appointments: [], error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      patient_id,
      provider_id,
      appointment_date,
      appointment_time,
      duration_minutes,
      appointment_type,
      mode,
      status,
      notes,
    } = body

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id,
        provider_id,
        appointment_date,
        appointment_time,
        duration_minutes: duration_minutes || 30,
        appointment_type: appointment_type || "General",
        mode: mode || "in_person",
        status: status || "scheduled",
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ appointment: data })
  } catch (error: any) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



