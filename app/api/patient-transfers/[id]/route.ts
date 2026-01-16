import { createServiceClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params
    const body = await request.json()

    const { data: transfer, error } = await supabase
      .from("patient_transfers")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating transfer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, transfer })
  } catch (error) {
    console.error("Error in transfer PUT:", error)
    return NextResponse.json(
      { error: "Failed to update transfer" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    const { data: transfer, error } = await supabase
      .from("patient_transfers")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email
        ),
        initiated_by_staff:staff!patient_transfers_initiated_by_fkey (
          id,
          first_name,
          last_name,
          title
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching transfer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transfer })
  } catch (error) {
    console.error("Error in transfer GET:", error)
    return NextResponse.json(
      { error: "Failed to fetch transfer" },
      { status: 500 }
    )
  }
}

