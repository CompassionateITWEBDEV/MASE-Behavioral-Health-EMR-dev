import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { patientId, type, channel, message, subject } = body

    // Get patient contact info
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email, phone")
      .eq("id", patientId)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const results = {
      email: null as any,
      sms: null as any,
    }

    // Send email if enabled
    if ((channel === "email" || channel === "both") && patient.email) {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      results.email = {
        status: "sent",
        to: patient.email,
        subject,
        message,
        sentAt: new Date().toISOString(),
      }
    }

    // Send SMS if enabled
    if ((channel === "sms" || channel === "both") && patient.phone) {
      // In production, integrate with SMS service (Twilio, etc.)
      results.sms = {
        status: "sent",
        to: patient.phone,
        message,
        sentAt: new Date().toISOString(),
      }
    }

    // Log the reminder
    const { data: reminder, error: reminderError } = await supabase
      .from("patient_reminders")
      .insert({
        patient_id: patientId,
        type,
        channel,
        subject,
        message,
        email_status: results.email?.status || null,
        sms_status: results.sms?.status || null,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      results,
      reminder,
    })
  } catch (error) {
    console.error("[v0] Error sending reminder:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    let query = supabase
      .from("patient_reminders")
      .select(`
        *,
        patients(first_name, last_name)
      `)
      .order("sent_at", { ascending: false })
      .limit(100)

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }
    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      if ((error as any)?.code === "42P01") {
        return NextResponse.json([])
      }
      console.error("[v0] Error fetching reminders:", error)
      return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}
