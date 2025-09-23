import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { old_bottle_id, new_bottle_id, witness1_signature, witness2_signature, final_volume_ml } =
      await request.json()

    // Validate two-person witness requirement
    if (!witness1_signature || !witness2_signature) {
      return NextResponse.json(
        {
          error: "Two-person witness required for bottle changeover",
        },
        { status: 400 },
      )
    }

    // Validate new bottle exists and is ready
    const newBottle = await validateNewBottle(new_bottle_id)
    if (!newBottle) {
      return NextResponse.json({ error: "Invalid new bottle" }, { status: 400 })
    }

    // Execute changeover procedure
    const changeoverResult = await executeBottleChangeover({
      old_bottle_id,
      new_bottle_id,
      final_volume_ml,
      witness1_signature,
      witness2_signature,
    })

    return NextResponse.json({
      changeover_id: changeoverResult.id,
      old_bottle_final_ml: changeoverResult.old_bottle_final_ml,
      new_bottle_active: changeoverResult.new_bottle_active,
      variance_ml: changeoverResult.variance_ml,
      witnesses: changeoverResult.witnesses,
    })
  } catch (error) {
    console.error("[v0] Bottle changeover error:", error)
    return NextResponse.json({ error: "Changeover failed" }, { status: 500 })
  }
}

async function validateNewBottle(bottle_id: string) {
  // Mock implementation - replace with actual database query
  return {
    id: bottle_id,
    status: "reserved",
    start_volume_ml: 1000,
    current_volume_ml: 1000,
  }
}

async function executeBottleChangeover(data: any) {
  // Mock implementation - replace with actual changeover procedure
  console.log("[v0] Executing bottle changeover:", data)

  // Calculate variance between expected and actual final volume
  const expected_final_ml = 500 // From inventory tracking
  const variance_ml = Math.abs(expected_final_ml - data.final_volume_ml)

  return {
    id: `changeover_${Date.now()}`,
    old_bottle_final_ml: data.final_volume_ml,
    new_bottle_active: true,
    variance_ml,
    witnesses: [
      { signature: data.witness1_signature, role: "nurse" },
      { signature: data.witness2_signature, role: "supervisor" },
    ],
    timestamp: new Date().toISOString(),
  }
}
