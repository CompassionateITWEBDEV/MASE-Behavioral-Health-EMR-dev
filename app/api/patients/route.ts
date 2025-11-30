import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    let query = supabase
      .from("patients")
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        phone,
        email,
        gender,
        address,
        status,
        created_at
      `)
      .order("last_name", { ascending: true })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: patients, error } = await query

    if (error) {
      console.error("[v0] Error fetching patients:", error.message)
      return NextResponse.json({ patients: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ patients: patients || [] })
  } catch (error) {
    console.error("[v0] Patients API error:", error)
    return NextResponse.json({ patients: [], error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("patients")
      .insert({
        first_name: body.first_name || body.firstName,
        last_name: body.last_name || body.lastName,
        date_of_birth: body.date_of_birth || body.dateOfBirth,
        phone: body.phone,
        email: body.email,
        gender: body.gender,
        address: body.address,
        status: body.status || "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating patient:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("[v0] Create patient error:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
