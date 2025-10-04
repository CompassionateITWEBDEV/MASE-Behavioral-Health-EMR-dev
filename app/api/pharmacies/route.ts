import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

interface PharmacyPayload {
  name: string
  address: string
  phone: string
  npi: string
  fax?: string
  email?: string
  is_preferred?: boolean
}

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    const { data: pharmacies, error } = await supabase
      .from("pharmacies")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("[pharmacies] fetch failed", error)
      return NextResponse.json({ error: "Failed to load pharmacies" }, { status: 500 })
    }

    return NextResponse.json({ pharmacies: pharmacies ?? [] })
  } catch (error) {
    console.error("[pharmacies] list error", error)
    return NextResponse.json({ error: "Failed to load pharmacies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PharmacyPayload
    const validationError = validate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const { data: pharmacy, error } = await supabase
      .from("pharmacies")
      .insert({
        ...body,
        is_preferred: body.is_preferred ?? false,
      })
      .select("*")
      .single()

    if (error || !pharmacy) {
      console.error("[pharmacies] insert failed", error)
      return NextResponse.json({ error: "Failed to create pharmacy" }, { status: 500 })
    }

    return NextResponse.json({ pharmacy })
  } catch (error) {
    console.error("[pharmacies] create error", error)
    return NextResponse.json({ error: "Failed to create pharmacy" }, { status: 500 })
  }
}

function validate(body: PharmacyPayload) {
  if (!body.name) return "Pharmacy name is required"
  if (!body.address) return "Address is required"
  if (!body.phone) return "Phone number is required"
  if (!body.npi) return "NPI is required"
  return null
}
