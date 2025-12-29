import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
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
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

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
    const body = await request.json()

    // Validate required fields
    if (!body.first_name && !body.firstName) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }
    if (!body.last_name && !body.lastName) {
      return NextResponse.json({ error: "Last name is required" }, { status: 400 })
    }
    if (!body.date_of_birth && !body.dateOfBirth) {
      return NextResponse.json({ error: "Date of birth is required" }, { status: 400 })
    }
    if (!body.phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Validate date of birth (should be in the past)
    const dob = body.date_of_birth || body.dateOfBirth
    if (!dob) {
      return NextResponse.json({ error: "Date of birth is required" }, { status: 400 })
    }
    
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: "Invalid date of birth format" }, { status: 400 })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    birthDate.setHours(0, 0, 0, 0)
    if (birthDate >= today) {
      return NextResponse.json({ error: "Date of birth must be in the past" }, { status: 400 })
    }

    // Validate email format if provided
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Get created_by from body if provided and valid, otherwise use null
    let createdBy = null
    if (body.created_by || body.createdBy) {
      const providerId = body.created_by || body.createdBy
      // Only set created_by if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(providerId)) {
        // Check if provider exists in database before setting created_by
        const { data: provider, error: providerError } = await supabase
          .from("providers")
          .select("id")
          .eq("id", providerId)
          .single()

        if (!providerError && provider) {
          createdBy = providerId
        } else {
          console.warn(`[v0] Provider ${providerId} not found, setting created_by to null`)
        }
      }
    }

    const insertData: any = {
      first_name: body.first_name || body.firstName,
      last_name: body.last_name || body.lastName,
      date_of_birth: dob,
      phone: body.phone,
      email: body.email || null,
      gender: body.gender || null,
      address: body.address || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      insurance_provider: body.insurance_provider || null,
      insurance_id: body.insurance_id || null,
    }

    // Only add created_by if provider exists, otherwise leave it null (database default)
    if (createdBy) {
      insertData.created_by = createdBy
    }
    // If createdBy is null, we don't include it in insertData, allowing database to use default (null)

    const { data, error } = await supabase
      .from("patients")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating patient:", error)
      console.error("[v0] Error details:", JSON.stringify(error, null, 2))
      console.error("[v0] Insert data:", JSON.stringify(insertData, null, 2))
      return NextResponse.json({ error: error.message || "Failed to create patient" }, { status: 500 })
    }

    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("[v0] Create patient error:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
