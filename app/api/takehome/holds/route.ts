import { createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: holds, error } = await supabase
      .from("takehome_holds")
      .select(`
        *,
        patient:patients(first_name, last_name),
        placed_by:providers(first_name, last_name)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === "42P01") {
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(holds || [])
  } catch (error) {
    console.error("Error fetching takehome holds:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("takehome_holds")
      .insert({
        ...body,
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating hold:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating hold:", error)
    return NextResponse.json({ error: "Failed to create hold" }, { status: 500 })
  }
}
