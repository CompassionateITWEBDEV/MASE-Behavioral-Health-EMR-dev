import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Update prescription status to sent
    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error sending prescription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create e-prescribing transmission record
    await supabase.from("eprescribing_transmissions").insert({
      prescription_id: id,
      transmission_type: "new_prescription",
      status: "pending",
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending prescription:", error)
    return NextResponse.json({ error: "Failed to send prescription" }, { status: 500 })
  }
}
