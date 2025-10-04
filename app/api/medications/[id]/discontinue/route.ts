import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason, discontinued_by } = await request.json()

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ error: "Discontinue reason must be at least 5 characters" }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const medicationId = params.id

    const { data: existing, error: fetchError } = await supabase
      .from("patient_medications")
      .select("id, patient_id, notes")
      .eq("id", medicationId)
      .single()

    if (fetchError || !existing) {
      console.error("[medications] discontinue load failed", fetchError)
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const updatedNotes = [existing.notes?.trim(), `Discontinued ${now}: ${reason.trim()}`]
      .filter(Boolean)
      .join("\n")

    const { error: updateError } = await supabase
      .from("patient_medications")
      .update({
        status: "discontinued",
        end_date: now.split("T")[0],
        notes: updatedNotes,
        updated_at: now,
      })
      .eq("id", medicationId)

    if (updateError) {
      console.error("[medications] discontinue update failed", updateError)
      return NextResponse.json({ error: "Failed to discontinue medication" }, { status: 500 })
    }

    if (discontinued_by) {
      await supabase.from("staff_activity_log").insert({
        staff_id: discontinued_by,
        action: "medication_discontinued",
        resource_type: "patient_medication",
        resource_id: medicationId,
        details: { reason, patient_id: existing.patient_id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[medications] discontinue error", error)
    return NextResponse.json({ error: "Failed to discontinue medication" }, { status: 500 })
  }
}
