import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all clinical alerts (holds, precautions, facility alerts)
    const [holdsRes, precautionsRes, facilityRes] = await Promise.all([
      supabase
        .from("dosing_holds")
        .select(`
          *,
          patients (id, first_name, last_name, mrn)
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("patient_precautions")
        .select(`
          *,
          patients (id, first_name, last_name, mrn)
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("facility_alerts")
        .select("*")
        .order("created_at", { ascending: false }),
    ])

    const holds = holdsRes.data || []
    const precautions = precautionsRes.data || []
    const facilityAlerts = facilityRes.data || []

    return NextResponse.json({
      holds,
      precautions,
      facilityAlerts,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching clinical alerts:", error)
    return NextResponse.json(
      {
        holds: [],
        precautions: [],
        facilityAlerts: [],
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { type, ...data } = body

    if (type === "hold") {
      const { data: hold, error } = await supabase
        .from("dosing_holds")
        .insert({
          patient_id: data.patient_id,
          hold_type: data.hold_type,
          reason: data.reason,
          created_by: data.created_by || "System",
          created_by_role: data.created_by_role || "Provider",
          requires_clearance_from: data.requires_clearance_from || [],
          cleared_by: [],
          status: "active",
          notes: data.notes,
          severity: data.severity || "medium",
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ hold })
    }

    if (type === "precaution") {
      const { data: precaution, error } = await supabase
        .from("patient_precautions")
        .insert({
          patient_id: data.patient_id,
          precaution_type: data.precaution_type,
          custom_text: data.custom_text,
          show_on_chart: data.show_on_chart !== false,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ precaution })
    }

    if (type === "facility") {
      const { data: alert, error } = await supabase
        .from("facility_alerts")
        .insert({
          alert_type: data.alert_type,
          message: data.message,
          priority: data.priority || "medium",
          affected_areas: data.affected_areas || [],
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ alert })
    }

    return NextResponse.json({ error: "Invalid alert type" }, { status: 400 })
  } catch (error: any) {
    console.error("[v0] Error creating clinical alert:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



