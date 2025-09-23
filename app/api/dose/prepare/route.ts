import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { patient_id, requested_mg } = await request.json()

    // Validate patient has active order
    const activeOrder = await validatePatientOrder(patient_id)
    if (!activeOrder) {
      return NextResponse.json({ error: "No active order found" }, { status: 400 })
    }

    // Check if requested dose is within order limits
    if (requested_mg > activeOrder.daily_dose_mg) {
      return NextResponse.json({ error: "Requested dose exceeds daily limit" }, { status: 400 })
    }

    // Get active bottle and check sufficiency
    const activeBottle = await getActiveBottle()
    if (!activeBottle) {
      return NextResponse.json({ error: "No active bottle available" }, { status: 400 })
    }

    // Calculate required volume based on medication concentration
    const medication = await getMedication(activeBottle.lot_batch.medication_id)
    const computed_ml = requested_mg / medication.conc_mg_per_ml

    // Check bottle sufficiency
    if (activeBottle.current_volume_ml < computed_ml) {
      return NextResponse.json(
        {
          error: "Insufficient volume in bottle",
          available_ml: activeBottle.current_volume_ml,
          required_ml: computed_ml,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      computed_ml,
      bottle_id: activeBottle.id,
      available_ml: activeBottle.current_volume_ml,
      medication_name: medication.name,
      concentration: medication.conc_mg_per_ml,
    })
  } catch (error) {
    console.error("[v0] Dose preparation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function validatePatientOrder(patient_id: string) {
  // Mock implementation - replace with actual database query
  return {
    id: "1",
    patient_id,
    daily_dose_mg: 100,
    max_takehome: 0,
    prescriber_id: "dr_smith",
  }
}

async function getActiveBottle() {
  // Mock implementation - replace with actual database query
  return {
    id: "bottle_001",
    current_volume_ml: 500,
    status: "active",
    lot_batch: {
      medication_id: "med_001",
    },
  }
}

async function getMedication(medication_id: string) {
  // Mock implementation - replace with actual database query
  return {
    id: medication_id,
    name: "Methadone HCl",
    conc_mg_per_ml: 10,
    ndc: "12345-678-90",
  }
}
