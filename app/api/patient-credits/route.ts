import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const patient_id = searchParams.get("patient_id")

    if (!patient_id) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 })
    }

    // Get total available credits using the database function
    const { data: creditsResult, error: creditsError } = await supabase.rpc("get_patient_available_credits", {
      p_patient_id: patient_id,
    })

    if (creditsError) throw creditsError

    // Get credit history
    const { data: credits, error: creditsHistoryError } = await supabase
      .from("patient_credits")
      .select("*")
      .eq("patient_id", patient_id)
      .order("applied_at", { ascending: false })

    if (creditsHistoryError) throw creditsHistoryError

    return NextResponse.json({
      total_credits: creditsResult || 0,
      credits: credits || [],
    })
  } catch (error: any) {
    console.error("[Patient Credits] Error fetching patient credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    const { patient_id, credit_amount, credit_type, credit_reason, applied_by, notes, expires_at } = body

    if (!patient_id || !credit_amount || !credit_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new credit
    const { data: credit, error } = await supabase
      .from("patient_credits")
      .insert({
        patient_id,
        credit_amount,
        credit_type,
        credit_reason,
        applied_by,
        remaining_amount: credit_amount,
        expires_at,
        notes,
        status: "active",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, credit })
  } catch (error: any) {
    console.error("[Patient Credits] Error applying credit:", error)
    return NextResponse.json({ error: "Failed to apply credit" }, { status: 500 })
  }
}
