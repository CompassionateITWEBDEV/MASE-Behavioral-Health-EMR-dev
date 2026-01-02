import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient()
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
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_id,
        created_at
      `)
      .order("last_name", { ascending: true })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    } else {
      query = query.limit(200)
    }

    const { data: patients, error } = await query

    if (error) {
      console.error("[v0] Error fetching patients:", error.message)
      return NextResponse.json({ patients: [], error: error.message }, { status: 500 })
    }

    console.log(`[v0] Fetched ${patients?.length || 0} patients`)
    return NextResponse.json({ patients: patients || [] })
  } catch (error) {
    console.error("[v0] Patients API error:", error)
    return NextResponse.json({ patients: [], error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate required fields
    const firstName = body.first_name || body.firstName
    const lastName = body.last_name || body.lastName
    const dateOfBirth = body.date_of_birth || body.dateOfBirth
    const phone = body.phone

    if (!firstName || !lastName || !dateOfBirth || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: first_name, last_name, date_of_birth, and phone are required" },
        { status: 400 }
      )
    }

    // Normalize program_type to lowercase if provided
    let programType = null
    if (body.program_type) {
      const normalized = body.program_type.toLowerCase().trim()
      // Map display values to database values
      if (normalized === "otp" || normalized.includes("opioid treatment")) {
        programType = "otp"
      } else if (normalized === "mat" || normalized.includes("medication-assisted")) {
        programType = "mat"
      } else if (normalized === "primary_care" || normalized === "primary care" || normalized.includes("primary")) {
        programType = "primary_care"
      } else {
        programType = normalized
      }
    }

    const insertData: any = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      phone: phone,
      email: body.email || null,
      gender: body.gender || null,
      address: body.address || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      insurance_provider: body.insurance_provider || null,
      insurance_id: body.insurance_id || null,
    }

    // Only include program_type if it's provided (column might not exist in all databases)
    if (programType) {
      insertData.program_type = programType
    }

    let { data, error } = await supabase
      .from("patients")
      .insert(insertData)
      .select()
      .single()

    // If error is due to program_type column not existing, retry without it
    if (error && programType && error.message?.includes("program_type")) {
      console.warn("[v0] program_type column may not exist, retrying without it")
      delete insertData.program_type
      const retryResult = await supabase
        .from("patients")
        .insert(insertData)
        .select()
        .single()
      
      if (retryResult.error) {
        console.error("[v0] Error creating patient (retry):", retryResult.error)
        return NextResponse.json(
          { error: retryResult.error.message || "Failed to create patient" },
          { status: 500 }
        )
      }
      
      data = retryResult.data
      error = null
    }

    if (error) {
      console.error("[v0] Error creating patient:", error)
      console.error("[v0] Error details:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: error.message || "Failed to create patient" },
        { status: 500 }
      )
    }

    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("[v0] Create patient error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create patient"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
