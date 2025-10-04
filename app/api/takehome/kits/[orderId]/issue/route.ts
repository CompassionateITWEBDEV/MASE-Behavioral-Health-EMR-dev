import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = Number.parseInt(params.orderId, 10)
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: "Invalid take-home order id" }, { status: 400 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const supabase = await createServiceRoleClient()

    const { data: order, error: orderError } = await supabase
      .from("takehome_orders")
      .select("id, patient_id, days, start_date, risk_level, status")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Take-home order not found" }, { status: 404 })
    }

    if (order.status === "closed") {
      return NextResponse.json({ error: "Cannot issue kit for closed order" }, { status: 409 })
    }

    const issueTime = new Date()
    const issuedBy = body.issued_by ?? "takehome_automation"
    const sealBatch = body.seal_batch ?? `AUTO-${issueTime.toISOString().slice(0, 10).replace(/-/g, "")}`

    const { data: kit, error: kitError } = await supabase
      .from("takehome_kits")
      .insert({
        takehome_order_id: order.id,
        issue_time: issueTime.toISOString(),
        issued_by: issuedBy,
        seal_batch: sealBatch,
        status: "issued",
      })
      .select("id, issue_time, issued_by, seal_batch, status")
      .single()

    if (kitError || !kit) {
      console.error("[takehome] kit insert failed", kitError)
      return NextResponse.json({ error: "Failed to create take-home kit" }, { status: 500 })
    }

    const medicationOrder = await getActiveMedicationOrder(supabase, order.patient_id)
    const doseMg = Number(medicationOrder?.daily_dose_mg ?? 0)
    const concentration = 10
    const doseMl = concentration > 0 ? Number((doseMg / concentration).toFixed(2)) : 0

    const startDate = order.start_date ? new Date(order.start_date) : new Date()

    const dosesPayload = Array.from({ length: Number(order.days ?? 0) }, (_, index) => {
      const dayDate = new Date(startDate)
      dayDate.setDate(dayDate.getDate() + index)

      const serialSuffix = String(index + 1).padStart(2, "0")
      return {
        kit_id: kit.id,
        day_date: dayDate.toISOString().split("T")[0],
        dose_mg: doseMg,
        dose_ml: doseMl,
        bottle_uid: `TH-${order.id}-${kit.id}-${serialSuffix}`,
        seal_uid: `SEAL-${kit.id}-${serialSuffix}`,
        status: "sealed",
      }
    })

    let insertedDoses: any[] = []
    if (dosesPayload.length > 0) {
      const { data: doses, error: dosesError } = await supabase
        .from("takehome_doses")
        .insert(dosesPayload)
        .select("id, kit_id, day_date, dose_mg, dose_ml, bottle_uid, seal_uid, status")

      if (dosesError) {
        console.error("[takehome] dose insert failed", dosesError)
        return NextResponse.json({ error: "Failed to generate take-home doses" }, { status: 500 })
      }

      insertedDoses = doses ?? []
    }

    const { error: orderUpdateError } = await supabase
      .from("takehome_orders")
      .update({ status: "active" })
      .eq("id", order.id)

    if (orderUpdateError) {
      console.warn("[takehome] order status update failed", orderUpdateError)
    }

    await logAuditEntry(supabase, {
      action: "takehome_kit_issued",
      patient_id: order.patient_id,
      details: {
        order_id: order.id,
        kit_id: kit.id,
        dose_count: insertedDoses.length,
      },
    })

    return NextResponse.json({
      kit: {
        ...kit,
        takehome_order_id: order.id,
        doses: insertedDoses,
      },
    })
  } catch (error) {
    console.error("[takehome] kit issuance error", error)
    return NextResponse.json({ error: "Failed to issue take-home kit" }, { status: 500 })
  }
}

async function getActiveMedicationOrder(supabase: any, patientId: number) {
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("medication_order")
    .select("daily_dose_mg")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .lte("start_date", today)
    .or(`stop_date.is.null,stop_date.gte.${today}`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn("[takehome] medication order lookup failed", error)
  }

  return data
}

async function logAuditEntry(
  supabase: any,
  entry: { action: string; patient_id: number; details: Record<string, any> },
) {
  await supabase.from("audit_trail").insert({
    user_id: null,
    patient_id: entry.patient_id,
    action: entry.action,
    table_name: "takehome_kits",
    record_id: entry.details.kit_id,
    new_values: entry.details,
  })
}
