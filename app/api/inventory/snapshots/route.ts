import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { snapshot_type, opened_or_closed_of_business, taken_by, verified_by, note, inventory_lines } = body

    // Validate required fields
    if (!snapshot_type || !taken_by || !inventory_lines) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For Schedule II substances, require exact counts
    const scheduleIILines = inventory_lines.filter(
      (line: any) => line.schedule_class === "II" && line.counting_method !== "exact",
    )

    if (scheduleIILines.length > 0) {
      return NextResponse.json({ error: "Schedule II substances require exact counting method" }, { status: 400 })
    }

    // Create inventory snapshot
    const snapshot = {
      id: `INV-SNAP-${Date.now()}`,
      snapshot_type,
      taken_at: new Date().toISOString(),
      opened_or_closed_of_business,
      taken_by,
      verified_by,
      note,
      locked: true,
      registered_location: "123 Treatment Center Way, City, ST 12345",
      inventory_lines,
    }

    // In production, save to database
    console.log("[v0] Creating inventory snapshot:", snapshot)

    return NextResponse.json({
      success: true,
      snapshot_id: snapshot.id,
      message: "Inventory snapshot created and locked",
    })
  } catch (error) {
    console.error("[v0] Error creating inventory snapshot:", error)
    return NextResponse.json({ error: "Failed to create inventory snapshot" }, { status: 500 })
  }
}

export async function GET() {
  // Return existing snapshots
  const snapshots = [
    {
      id: "INV-SNAP-001",
      snapshot_type: "initial",
      taken_at: "2024-01-15T08:00:00Z",
      opened_or_closed_of_business: "opening",
      taken_by: "RN-JJ",
      verified_by: "PharmD-MS",
      locked: true,
      registered_location: "123 Treatment Center Way, City, ST 12345",
    },
  ]

  return NextResponse.json({ snapshots })
}
