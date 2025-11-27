import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendSMS } from "@/lib/sms/twilio-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { queueId, returnTime, sendSMS: shouldSendSMS } = body

    // Get current check-in data with patient info
    const { data: checkIn, error: fetchError } = await supabase
      .from("patient_check_ins")
      .select(`
        *,
        patients(first_name, last_name, phone)
      `)
      .eq("id", queueId)
      .single()

    if (fetchError) throw fetchError

    // Update check-in status
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

    let smsResult = null
    if (shouldSendSMS && checkIn.patients?.phone) {
      const returnDate = new Date(returnTime)
      const formattedTime = returnDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      const message = `${checkIn.patients.first_name}, please return at ${formattedTime}. Your place in line has been saved. - BehavioralHealth Clinic`
      smsResult = await sendSMS(checkIn.patients.phone, message)
    }

    return NextResponse.json({
      success: true,
      data,
      smsResult,
    })
  } catch (error) {
    console.error("Error marking return later:", error)
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 })
  }
}
