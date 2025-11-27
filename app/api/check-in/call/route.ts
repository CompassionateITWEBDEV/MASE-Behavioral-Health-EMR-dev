import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { queueId, staffMember, sendSMS } = body

    const { data, error } = await supabase
      .from("patient_check_ins")
      .update({
        status: "called",
        assigned_to: staffMember,
        called_time: new Date().toISOString(),
        notifications_sent: 1,
        last_notification: new Date().toISOString(),
      })
      .eq("id", queueId)
      .select()
      .single()

    if (error) throw error

    // TODO: Send SMS notification if sendSMS is true and mobile_phone exists

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error calling patient:", error)
    return NextResponse.json({ message: "Failed to call patient" }, { status: 500 })
  }
}
