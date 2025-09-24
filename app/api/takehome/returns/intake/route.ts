import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bottle_uid, seal_intact, residue_ml_est, notes, outcome } = body

    if (!bottle_uid) {
      return NextResponse.json({ error: "Bottle UID is required" }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const dose = await findDoseByBottleUid(supabase, bottle_uid)
    if (!dose) {
      return NextResponse.json({ error: "Bottle not found" }, { status: 404 })
    }

    const inspection = await createReturnInspection(supabase, {
      bottle_uid,
      seal_intact,
      residue_ml_est,
      notes,
      outcome,
    })

    await updateDoseStatus(supabase, dose.id)

    if (outcome === "concern" || outcome === "diversion_suspected") {
      await createComplianceHold(supabase, dose.patient_id, {
        reason_code: outcome === "diversion_suspected" ? "suspected_diversion" : "return_concern",
        requires_counselor: true,
        notes: `Return inspection: ${notes ?? ""}`,
      })
    }

    const residueThreshold = await getRuleValue(supabase, "residue_threshold_ml")
    if (residueThreshold !== null && residue_ml_est > residueThreshold) {
      await createComplianceHold(supabase, dose.patient_id, {
        reason_code: "excessive_residue",
        requires_counselor: true,
        notes: `Residue ${residue_ml_est}ml exceeds threshold ${residueThreshold}ml`,
      })
    }

    await logInventoryTransaction(supabase, {
      bottle_uid,
      residue_ml_est,
      dose_id: dose.id,
    })

    await logAuditEntry(supabase, {
      action: "takehome_return_processed",
      patient_id: dose.patient_id,
      details: { bottle_uid, inspection_id: inspection?.id ?? null, outcome },
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

async function findDoseByBottleUid(supabase: any, bottleUid: string) {
  const { data: dose, error: doseError } = await supabase
    .from("takehome_doses")
    .select("id, kit_id, status")
    .eq("bottle_uid", bottleUid)
    .single()

  if (doseError || !dose) {
    console.error("[takehome] dose lookup failed", doseError)
    return null
  }

  const { data: kit, error: kitError } = await supabase
    .from("takehome_kits")
    .select("takehome_order_id")
    .eq("id", dose.kit_id)
    .single()

  if (kitError || !kit) {
    console.error("[takehome] kit lookup failed", kitError)
    return null
  }

  const { data: order, error: orderError } = await supabase
    .from("takehome_orders")
    .select("patient_id")
    .eq("id", kit.takehome_order_id)
    .single()

  if (orderError || !order) {
    console.error("[takehome] order lookup failed", orderError)
    return null
  }

  return {
    id: dose.id,
    patient_id: order.patient_id,
    kit_id: dose.kit_id,
    status: dose.status,
  }
}

async function createReturnInspection(
  supabase: any,
  inspection: { bottle_uid: string; seal_intact: boolean; residue_ml_est: number; notes?: string; outcome: string },
) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("return_inspections")
    .insert({
      bottle_uid: inspection.bottle_uid,
      returned_time: now,
      inspector_id: 1,
      seal_intact: inspection.seal_intact,
      residue_ml_est: inspection.residue_ml_est,
      notes: inspection.notes ?? null,
      outcome: inspection.outcome,
    })
    .select("*")
    .single()

  if (error) {
    console.error("[takehome] inspection insert failed", error)
    return null
  }

  return data
}

async function updateDoseStatus(supabase: any, doseId: number) {
  const { error } = await supabase
    .from("takehome_doses")
    .update({ status: "returned" })
    .eq("id", doseId)

  if (error) {
    console.error("[takehome] dose status update failed", error)
  }
}

async function createComplianceHold(
  supabase: any,
  patientId: number,
  holdData: { reason_code: string; requires_counselor: boolean; notes?: string },
) {
  const { error } = await supabase.from("compliance_holds").insert({
    patient_id: patientId,
    reason_code: holdData.reason_code,
    opened_by: 1,
    requires_counselor: holdData.requires_counselor,
    status: "open",
    opened_time: new Date().toISOString(),
    notes: holdData.notes ?? null,
  })

  if (error) {
    console.error("[takehome] compliance hold insert failed", error)
  }
}

async function getRuleValue(supabase: any, ruleName: string) {
  const { data, error } = await supabase
    .from("takehome_rules")
    .select("rule_value")
    .eq("rule_name", ruleName)
    .eq("risk_level", "all")
    .maybeSingle()

  if (error) {
    console.error("[takehome] rule lookup failed", error)
    return null
  }

  const value = data?.rule_value ? Number.parseFloat(data.rule_value) : null
  return Number.isFinite(value) ? value : null
}

async function logInventoryTransaction(
  supabase: any,
  transaction: { bottle_uid: string; residue_ml_est: number; dose_id: number },
) {
  const { data: bottle } = await supabase
    .from("bottle")
    .select("id")
    .eq("serial_no", transaction.bottle_uid)
    .maybeSingle()

  if (!bottle) {
    return
  }

  await supabase.from("inventory_txn").insert({
    bottle_id: bottle.id,
    type: "return",
    qty_ml: -transaction.residue_ml_est,
    reason: "takehome_return",
    by_user: "dispensing_api",
    dose_event_id: transaction.dose_id,
  })
}

async function logAuditEntry(
  supabase: any,
  entry: { action: string; patient_id: number; details: { bottle_uid: string; inspection_id: number | null; outcome: string } },
) {
  await supabase.from("audit_trail").insert({
    user_id: null,
    patient_id: entry.patient_id,
    action: entry.action,
    table_name: "return_inspections",
    record_id: entry.details.inspection_id,
    new_values: entry.details,
  })
}
