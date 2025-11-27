import { createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: kits, error } = await supabase
      .from("takehome_kits")
      .select(`
        *,
        patient:patients(first_name, last_name),
        medication:medications(name, strength)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return mock data
      if (error.code === "42P01") {
        return NextResponse.json([
          {
            id: "kit-1",
            patient_name: "John Smith",
            medication: "Methadone 10mg",
            doses: 7,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "prepared",
          },
        ])
      }
      throw error
    }

    return NextResponse.json(kits || [])
  } catch (error) {
    console.error("Error fetching takehome kits:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    const { data, error } = await supabase.from("takehome_kits").insert(body).select().single()

    if (error) {
      console.error("Error creating takehome kit:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating takehome kit:", error)
    return NextResponse.json({ error: "Failed to create kit" }, { status: 500 })
  }
}
