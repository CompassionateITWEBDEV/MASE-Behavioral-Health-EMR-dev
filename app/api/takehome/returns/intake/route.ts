import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bottle_uid, seal_intact, residue_ml_est, notes, outcome } = body

    const dose = await findDoseByBottleUid(bottle_uid)
    if (!dose) {
      return NextResponse.json({ error: "Bottle not found" }, { status: 404 })
    }

    // Create return inspection record
    const inspection = {
      id: Math.floor(Math.random() * 1000),
      bottle_uid,
      returned_time: new Date().toISOString(),
      inspector_id: "current_user", // Replace with actual user
      seal_intact,
      residue_ml_est,
      notes,
      outcome,
      created_at: new Date().toISOString(),
    }

    // Update dose status
    await updateDoseStatus(dose.id, "returned")

    // Check if compliance action needed
    if (outcome === "concern" || outcome === "diversion_suspected") {
      await createComplianceHold(dose.patient_id, {
        reason_code: outcome === "diversion_suspected" ? "suspected_diversion" : "return_concern",
        requires_counselor: true,
        notes: `Return inspection: ${notes}`,
      })
    }

    // Check residue threshold
    const residueThreshold = await getRuleValue("residue_threshold_ml")
    if (residue_ml_est > Number.parseFloat(residueThreshold)) {
      await createComplianceHold(dose.patient_id, {
        reason_code: "excessive_residue",
        requires_counselor: true,
        notes: `Residue ${residue_ml_est}ml exceeds threshold ${residueThreshold}ml`,
      })
    }

    // Log inventory transaction for return
    await logInventoryTransaction({
      bottle_id: dose.bottle_id,
      type: "return",
      qty_ml: -residue_ml_est, // Negative for return
      reason: "takehome_return",
      by_user: "current_user",
      links: { dose_event_id: dose.id },
    })

    // Log audit entry
    await logAuditEntry({
      action: "takehome_return_processed",
      patient_id: dose.patient_id,
      details: { bottle_uid, inspection_id: inspection.id, outcome },
      user_id: "current_user",
    })

    return NextResponse.json({
      inspection,
      compliance_action: outcome !== "ok" ? "hold_created" : "none",
    })
  } catch (error) {
    console.error("Return intake failed:", error)
    return NextResponse.json({ error: "Failed to process return" }, { status: 500 })
  }
}

async function findDoseByBottleUid(bottleUid: string) {
  // Mock implementation - replace with actual database query
  return {
    id: 1,
    patient_id: 101,
    bottle_id: 1,
    dose_mg: 80,
    status: "sealed",
  }
}

async function updateDoseStatus(doseId: number, status: string) {
  // Mock implementation - replace with actual database update
  console.log(`Updated dose ${doseId} status to ${status}`)
}

async function createComplianceHold(patientId: number, holdData: any) {
  // Mock implementation - replace with actual database insert
  console.log(`Created compliance hold for patient ${patientId}:`, holdData)
}

async function getRuleValue(ruleName: string) {
  // Mock implementation - replace with actual database query
  const rules: Record<string, string> = {
    residue_threshold_ml: "1.0",
  }
  return rules[ruleName] || "1.0"
}

async function logInventoryTransaction(transaction: any) {
  // Mock implementation - replace with actual database insert
  console.log("Inventory transaction:", transaction)
}

async function logAuditEntry(entry: any) {
  // Mock implementation - replace with actual audit logging
  console.log("Audit entry:", entry)
}
