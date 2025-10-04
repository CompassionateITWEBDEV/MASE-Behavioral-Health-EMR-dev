import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase.from("report_schedules").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[regulatory] schedule fetch failed", error)
      return NextResponse.json({ error: "Failed to load report schedules" }, { status: 500 })
    }

    return NextResponse.json({ schedules: data ?? [] })
  } catch (error) {
    console.error("[regulatory] schedule list error", error)
    return NextResponse.json({ error: "Failed to load report schedules" }, { status: 500 })
  }
}
