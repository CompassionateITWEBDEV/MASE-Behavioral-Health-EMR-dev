import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Update kit status to issued
    const { data, error } = await supabase
      .from("takehome_kits")
      .update({
        status: "issued",
        issued_at: new Date().toISOString(),
        issued_by: body.issued_by || "system",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error issuing kit:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error issuing kit:", error)
    return NextResponse.json({ error: "Failed to issue kit" }, { status: 500 })
  }
}
