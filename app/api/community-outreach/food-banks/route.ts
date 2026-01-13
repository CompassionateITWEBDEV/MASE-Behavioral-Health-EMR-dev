import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "all"

    // Build query
    let query = supabase
      .from("food_banks")
      .select("*")
      .eq("is_active", true)

    // Filter by type
    if (type !== "all") {
      query = query.eq("food_bank_type", type)
    }

    const { data: foodBanks, error } = await query

    if (error) throw error

    // Filter by search term if provided
    let filteredFoodBanks = foodBanks || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredFoodBanks = filteredFoodBanks.filter(
        (fb: any) =>
          fb.organization_name?.toLowerCase().includes(searchLower) ||
          fb.address?.toLowerCase().includes(searchLower) ||
          (Array.isArray(fb.services) && fb.services.some((s: string) => s.toLowerCase().includes(searchLower)))
      )
    }

    return NextResponse.json({ foodBanks: filteredFoodBanks })
  } catch (error: any) {
    console.error("[Community Outreach] Error fetching food banks:", error)
    return NextResponse.json({ error: "Failed to fetch food banks" }, { status: 500 })
  }
}
