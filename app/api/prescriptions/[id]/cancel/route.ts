import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason } = await request.json()
    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ error: "Cancellation reason must be at least 5 characters" }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const prescriptionId = params.id

    const { data: existing, error: fetchError } = await supabase
      .from("prescriptions")
      .select("id, prescribed_by, notes")
      .eq("id", prescriptionId)
      .single()

    if (fetchError || !existing) {
      console.error("[prescriptions] load for cancel failed", fetchError)
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    }

    const updatedNotes = [existing.notes?.trim(), `Cancelled: ${reason.trim()}`]
      .filter(Boolean)
      .join("\n")

    const { error: updateError } = await supabase
      .from("prescriptions")
      .update({
        status: "cancelled",
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prescriptionId)

    if (updateError) {
      console.error("[prescriptions] cancel update failed", updateError)
      return NextResponse.json({ error: "Failed to cancel prescription" }, { status: 500 })
    }

    await supabase.from("staff_activity_log").insert({
      staff_id: existing.prescribed_by,
      action: "prescription_cancelled",
      resource_type: "prescription",
      resource_id: existing.id,
      details: { reason },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[prescriptions] cancel error", error)
    return NextResponse.json({ error: "Failed to cancel prescription" }, { status: 500 })
  }
}
