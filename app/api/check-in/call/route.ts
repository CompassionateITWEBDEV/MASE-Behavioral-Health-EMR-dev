import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendSMS } from "@/lib/sms/twilio-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { queueId, staffMember, sendSMS: shouldSendSMS } = body

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

    // Calculate new notification count
    const newNotificationCount = (checkIn.notifications_sent || 0) + 1

    // Update check-in status
    const { data, error } = await supabase
      .from("patient_check_ins")
      .update({
        status: "called",
        assigned_to: staffMember,
        called_time: new Date().toISOString(),
        notifications_sent: newNotificationCount,
        last_notification: new Date().toISOString(),
      })
      .eq("id", queueId)
      .select()
      .single()

    if (error) throw error

    let smsResult = null
    if (shouldSendSMS && checkIn.patients?.phone) {
      const message = `${checkIn.patients.first_name}, you are being called! Please proceed to the front desk. - BehavioralHealth Clinic`
      smsResult = await sendSMS(checkIn.patients.phone, message)
    }

    return NextResponse.json({
      success: true,
      data,
      smsResult,
      notificationCount: newNotificationCount,
    })
  } catch (error) {
    console.error("Error calling patient:", error)
    return NextResponse.json({ message: "Failed to call patient" }, { status: 500 })
  }
}
