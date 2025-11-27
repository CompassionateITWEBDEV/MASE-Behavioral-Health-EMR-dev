import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    const supabase = await createClient()

    // Update prescription status to cancelled
    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        status: "cancelled",
        cancellation_reason: reason || "Cancelled by provider",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error cancelling prescription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error cancelling prescription:", error)
    return NextResponse.json({ error: "Failed to cancel prescription" }, { status: 500 })
  }
}
