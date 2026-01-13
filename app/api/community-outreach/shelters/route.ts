import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""
    const type = searchParams.get("type") || "all"

    // Build query
    let query = supabase
      .from("community_shelters")
      .select(`
        *,
        community_shelter_services(*)
      `)
      .eq("is_active", true)
      .eq("is_accepting_residents", true)

    // Filter by type
    if (type !== "all") {
      query = query.eq("shelter_type", type)
    }

    const { data: shelters, error } = await query

    if (error) throw error

    // Filter by search term if provided
    let filteredShelters = shelters || []
    if (search) {
      filteredShelters = filteredShelters.filter(
        (s: any) =>
          s.shelter_name?.toLowerCase().includes(search) ||
          s.address?.toLowerCase().includes(search) ||
          (Array.isArray(s.amenities) && s.amenities.some((a: string) => a.toLowerCase().includes(search)))
      )
    }

    // Transform data to match expected format
    const formattedShelters = (filteredShelters || []).map((shelter: any) => ({
      id: shelter.id,
      name: shelter.shelter_name,
      address: shelter.address,
      city: shelter.city,
      state: shelter.state,
      zip_code: shelter.zip_code,
      phone: shelter.phone,
      email: shelter.email,
      website: shelter.website,
      type: shelter.shelter_type,
      capacity: shelter.total_beds,
      available_beds: shelter.beds_available,
      hours: shelter.hours_of_operation,
      services: Array.isArray(shelter.community_shelter_services)
        ? shelter.community_shelter_services.map((svc: any) => svc.service_type)
        : [],
      accepts: [
        shelter.accepts_men ? "Men" : null,
        shelter.accepts_women ? "Women" : null,
        shelter.accepts_families ? "Families" : null,
        shelter.accepts_youth ? "Youth" : null,
        shelter.accepts_veterans ? "Veterans" : null,
      ].filter(Boolean) as string[],
      amenities: Array.isArray(shelter.amenities) ? shelter.amenities : [],
    }))

    return NextResponse.json({ shelters: formattedShelters })
  } catch (error: any) {
    console.error("[Community Outreach] Error fetching shelters:", error)
    return NextResponse.json({ error: "Failed to fetch shelters" }, { status: 500 })
  }
}
