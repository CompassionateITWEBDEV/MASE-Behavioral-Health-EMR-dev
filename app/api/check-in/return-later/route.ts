import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { queueId, returnTime, sendSMS } = body

    const { data, error } = await supabase
      .from("patient_check_ins")
      .update({
        status: "return-later",
        return_time: returnTime,
      })
      .eq("id", queueId)
      .select()
      .single()

    if (error) throw error

    // TODO: Send SMS notification with return time if sendSMS is true

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error marking return later:", error)
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 })
  }
}
