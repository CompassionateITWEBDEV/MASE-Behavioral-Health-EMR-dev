import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { acknowledged_by, acknowledged_at, notes } = body

    // Try to update in dosing_holds first
    // First fetch the hold to get existing notes
    const { data: existingHold } = await supabase
      .from("dosing_holds")
      .select("notes")
      .eq("id", id)
      .single()

    const { data: hold, error: holdError } = await supabase
      .from("dosing_holds")
      .update({
        acknowledged_by: acknowledged_by || null,
        acknowledged_at: acknowledged_at || new Date().toISOString(),
        notes: notes ? `${existingHold?.notes || ""}\nAcknowledged: ${notes}`.trim() : existingHold?.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (!holdError && hold) {
      return NextResponse.json({ success: true, alert: hold })
    }

    // Try patient_precautions
    const { data: precaution, error: precautionError } = await supabase
      .from("patient_precautions")
      .update({
        acknowledged_by: acknowledged_by || null,
        acknowledged_at: acknowledged_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (!precautionError && precaution) {
      return NextResponse.json({ success: true, alert: precaution })
    }

    // Try facility_alerts
    const { data: facilityAlert, error: facilityError } = await supabase
      .from("facility_alerts")
      .update({
        acknowledged_by: acknowledged_by || null,
        acknowledged_at: acknowledged_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (!facilityError && facilityAlert) {
      return NextResponse.json({ success: true, alert: facilityAlert })
    }

    return NextResponse.json({ error: "Clinical alert not found" }, { status: 404 })
  } catch (error: any) {
    console.error("[v0] Error acknowledging clinical alert:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

