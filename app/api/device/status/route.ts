import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Query device via serial communication
    const deviceStatus = await queryDeviceStatus()

    return NextResponse.json(deviceStatus)
  } catch (error) {
    console.error("[v0] Device status error:", error)
    return NextResponse.json(
      {
        error: "Device communication failed",
        status: "offline",
      },
      { status: 500 },
    )
  }
}

async function queryDeviceStatus() {
  // Mock serial communication - replace with actual IVEK MethaSpense integration
  try {
    // Send status query via RS-232
    const command = "STATUS"

    // Mock response - replace with actual serial communication
    return {
      device_id: "methaSpense_001",
      status: "ready",
      bottle_id: "bottle_001",
      est_remaining_ml: 450,
      last_alarm: null,
      firmware_version: "2.1.3",
      serial_port: "COM3",
      last_communication: new Date().toISOString(),
      pump_cycles: 1247,
      total_dispensed_today: 2350.5,
    }
  } catch (error) {
    return {
      device_id: "methaSpense_001",
      status: "offline",
      error: error.message,
      last_communication: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    }
  }
}
