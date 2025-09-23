import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { patient_id, ml, witness_signature } = await request.json()

    // Validate device is ready and safe to dispense
    const deviceStatus = await checkDeviceStatus()
    if (!deviceStatus.ready) {
      return NextResponse.json(
        {
          error: "Device not ready",
          device_status: deviceStatus,
        },
        { status: 400 },
      )
    }

    // Create dose event record
    const doseEvent = await createDoseEvent({
      patient_id,
      requested_ml: ml,
      bottle_id: deviceStatus.active_bottle_id,
      device_id: deviceStatus.device_id,
      witness_signature,
    })

    // Execute dose via serial communication
    const dispenseResult = await executeDispenseCommand(ml, doseEvent.id)

    // Update dose event with results
    await updateDoseEvent(doseEvent.id, {
      dispensed_ml: dispenseResult.actual_ml,
      outcome: dispenseResult.outcome,
      device_events: dispenseResult.device_events,
      signature_hash: generateSignatureHash(witness_signature),
    })

    // Update bottle inventory
    await updateBottleInventory(deviceStatus.active_bottle_id, dispenseResult.actual_ml)

    return NextResponse.json({
      dose_event_id: doseEvent.id,
      actual_ml: dispenseResult.actual_ml,
      device_events: dispenseResult.device_events,
      outcome: dispenseResult.outcome,
    })
  } catch (error) {
    console.error("[v0] Dose execution error:", error)
    return NextResponse.json({ error: "Dose execution failed" }, { status: 500 })
  }
}

async function checkDeviceStatus() {
  // Mock implementation - replace with actual serial communication
  return {
    ready: true,
    active_bottle_id: "bottle_001",
    device_id: "methaSpense_001",
    est_remaining_ml: 450,
    last_alarm: null,
  }
}

async function executeDispenseCommand(ml: number, dose_event_id: string) {
  // Mock serial communication - replace with actual IVEK MethaSpense integration
  console.log("[v0] Executing dispense command:", { ml, dose_event_id })

  // Simulate serial communication with proper error handling
  try {
    // Send dispense command via RS-232
    const command = `DISPENSE:${ml}:${dose_event_id}`

    // Mock response - replace with actual serial communication
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate dispense time

    return {
      actual_ml: ml * 0.98, // Slight variance for realism
      outcome: "success",
      device_events: [
        {
          event_type: "dispense_start",
          payload: { requested_ml: ml },
          timestamp: new Date().toISOString(),
        },
        {
          event_type: "dispense_complete",
          payload: { actual_ml: ml * 0.98 },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  } catch (error) {
    return {
      actual_ml: 0,
      outcome: "aborted",
      device_events: [
        {
          event_type: "dispense_error",
          payload: { error: error.message },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }
}

async function createDoseEvent(data: any) {
  // Mock implementation - replace with actual database insert
  return {
    id: `dose_${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  }
}

async function updateDoseEvent(id: string, updates: any) {
  // Mock implementation - replace with actual database update
  console.log("[v0] Updating dose event:", { id, updates })
}

async function updateBottleInventory(bottle_id: string, dispensed_ml: number) {
  // Mock implementation - replace with actual inventory transaction
  console.log("[v0] Updating bottle inventory:", { bottle_id, dispensed_ml })
}

function generateSignatureHash(signature: string) {
  // Mock implementation - replace with actual cryptographic hash
  return `hash_${signature.length}_${Date.now()}`
}
