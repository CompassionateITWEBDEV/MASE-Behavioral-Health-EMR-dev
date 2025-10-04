import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServiceRoleClient()
    const prescriptionId = params.id

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .update({
        status: "sent",
        sent_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", prescriptionId)
      .select("id, prescribed_by")
      .single()

    if (error || !prescription) {
      console.error("[prescriptions] send failed", error)
      return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
    }

    await supabase.from("staff_activity_log").insert({
      staff_id: prescription.prescribed_by,
      action: "prescription_sent",
      resource_type: "prescription",
      resource_id: prescription.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[prescriptions] send error", error)
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
  }
}
