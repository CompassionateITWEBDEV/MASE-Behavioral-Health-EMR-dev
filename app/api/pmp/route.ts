import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get audit logs for PMP checks today
    const { data: todayChecks, error: checksError } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("table_name", "pmp_check")
      .gte("timestamp", today.toISOString())
      .lt("timestamp", tomorrow.toISOString())

    // Get yesterday's checks for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const { data: yesterdayChecks } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("table_name", "pmp_check")
      .gte("timestamp", yesterday.toISOString())
      .lt("timestamp", today.toISOString())

    // Get high-risk alerts from encounter_alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("encounter_alerts")
      .select(`
        *,
        patient_dispensing:patient_id (name, dob, mrn)
      `)
      .in("alert_type", ["pmp_high_risk", "pmp_critical", "multiple_prescribers", "early_refill"])
      .eq("is_acknowledged", false)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get patients with controlled substance prescriptions for monitoring
    const { data: controlledRx } = await supabase
      .from("patient_medications")
      .select(`
        *,
        patients:patient_id (first_name, last_name, date_of_birth)
      `)
      .or("medication_type.eq.controlled,medication_type.eq.opioid,medication_type.eq.benzodiazepine")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)

    const todayCount = todayChecks?.length || 0
    const yesterdayCount = yesterdayChecks?.length || 0
    const highRiskCount =
      alerts?.filter((a) => a.severity === "critical" || a.alert_type === "pmp_critical").length || 0

    const recentAlerts = (alerts || []).map((alert) => ({
      id: alert.id,
      patientName: alert.patient_dispensing?.name || "Unknown Patient",
      dob: alert.patient_dispensing?.dob || "",
      alertType: alert.alert_type,
      severity: alert.severity || "medium",
      message: alert.alert_message,
      createdAt: alert.created_at,
    }))

    return NextResponse.json({
      systemStatus: "online",
      todayChecks: todayCount,
      yesterdayChecks: yesterdayCount,
      highRiskAlerts: highRiskCount,
      recentAlerts,
      controlledSubstancePatients: controlledRx?.length || 0,
    })
  } catch (error) {
    console.error("Error in PMP API:", error)
    return NextResponse.json({
      systemStatus: "online",
      todayChecks: 0,
      yesterdayChecks: 0,
      highRiskAlerts: 0,
      recentAlerts: [],
      controlledSubstancePatients: 0,
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Log the PMP check in audit trail
    await supabase.from("audit_trail").insert({
      table_name: "pmp_check",
      action: "pmp_lookup",
      new_values: {
        firstName: body.firstName,
        lastName: body.lastName,
        dob: body.dob,
        searchedAt: new Date().toISOString(),
      },
    })

    // In a real implementation, this would call the Michigan MAPS API
    // For now, return a simulated response
    return NextResponse.json({
      success: true,
      message: "PMP check logged. In production, this would query michigan.pmpaware.net",
      searchParams: {
        firstName: body.firstName,
        lastName: body.lastName,
        dob: body.dob,
      },
    })
  } catch (error) {
    console.error("Error in PMP POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
