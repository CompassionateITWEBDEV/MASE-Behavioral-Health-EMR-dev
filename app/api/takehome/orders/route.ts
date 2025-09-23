import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patient_id, days, risk_level, start_date } = body

    const rulesValidation = await validateTakehomeRules(patient_id, days, risk_level)

    if (!rulesValidation.eligible) {
      return NextResponse.json(
        { error: "Patient not eligible for take-home", reasons: rulesValidation.reasons },
        { status: 400 },
      )
    }

    // Calculate end date
    const startDate = new Date(start_date)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + days - 1)

    // Create take-home order (mock implementation)
    const order = {
      id: Math.floor(Math.random() * 1000),
      patient_id,
      days,
      start_date,
      end_date: endDate.toISOString().split("T")[0],
      risk_level,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Log audit entry
    await logAuditEntry({
      action: "takehome_order_created",
      patient_id,
      details: { order_id: order.id, days, risk_level },
      user_id: "current_user", // Replace with actual user
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Take-home order creation failed:", error)
    return NextResponse.json({ error: "Failed to create take-home order" }, { status: 500 })
  }
}

async function validateTakehomeRules(patientId: number, days: number, riskLevel: string) {
  const rules = {
    max_consecutive_days: riskLevel === "high" ? 3 : riskLevel === "low" ? 14 : 7,
    missed_returns_allowed: 0,
    positive_uds_auto_hold: true,
  }

  const reasons = []

  if (days > rules.max_consecutive_days) {
    reasons.push(`Exceeds maximum ${rules.max_consecutive_days} days for ${riskLevel} risk level`)
  }

  // Check for existing holds
  const hasActiveHold = await checkActiveHolds(patientId)
  if (hasActiveHold) {
    reasons.push("Patient has active compliance hold")
  }

  // Check recent UDS results
  const hasRecentPositiveUDS = await checkRecentUDS(patientId)
  if (hasRecentPositiveUDS && rules.positive_uds_auto_hold) {
    reasons.push("Recent positive UDS result")
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  }
}

async function checkActiveHolds(patientId: number) {
  // Mock implementation - replace with actual database query
  return false
}

async function checkRecentUDS(patientId: number) {
  // Mock implementation - replace with actual database query
  return false
}

async function logAuditEntry(entry: any) {
  // Mock implementation - replace with actual audit logging
  console.log("Audit entry:", entry)
}
