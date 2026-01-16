import { createServiceClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()

    // Validate required fields
    if (!body.patient_id || !body.transfer_to || !body.transfer_reason) {
      return NextResponse.json(
        { error: "Missing required fields: patient_id, transfer_to, and transfer_reason are required" },
        { status: 400 }
      )
    }

    // Get current user (initiated_by)
    const authHeader = request.headers.get("authorization")
    let initiatedBy = body.initiated_by

    // If no initiated_by in body, try to get from auth
    if (!initiatedBy && authHeader) {
      // Extract user ID from auth token if needed
      // For now, we'll require it in the body
    }

    if (!initiatedBy) {
      return NextResponse.json(
        { error: "initiated_by (user ID) is required" },
        { status: 400 }
      )
    }

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, first_name, last_name, status, is_active")
      .eq("id", body.patient_id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Check if patient is already transferred
    if (patient.is_transferred) {
      return NextResponse.json(
        { error: "Patient has already been transferred" },
        { status: 400 }
      )
    }

    // Get facility name from organization settings
    const { data: organization } = await supabase
      .from("organizations")
      .select("name, address, phone, fax")
      .limit(1)
      .single()
    
    const transferFrom = organization?.name || body.transfer_from || "Current Facility"

    // Create transfer record
    const transferData = {
      patient_id: body.patient_id,
      transfer_type: body.transfer_type || "external",
      transfer_from_facility: transferFrom,
      transfer_to_facility: body.transfer_to,
      contact_person: body.contact_person || null,
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email || null,
      transfer_reason: body.transfer_reason,
      documents_included: body.documents_included || [],
      transfer_status: "initiated",
      initiated_by: initiatedBy,
      notes: body.notes || null,
    }

    const { data: transfer, error: transferError } = await supabase
      .from("patient_transfers")
      .insert(transferData)
      .select()
      .single()

    if (transferError) {
      console.error("Error creating transfer:", transferError)
      return NextResponse.json(
        { error: transferError.message || "Failed to create transfer record" },
        { status: 500 }
      )
    }

    // Handle prescription cancellation (only for external transfers)
    let cancelledPrescriptions: any[] = []
    if (body.transfer_type === "external") {
      // Find all pending or sent prescriptions
      const { data: prescriptions, error: rxError } = await supabase
        .from("prescriptions")
        .select("id, status, medication_name")
        .eq("patient_id", body.patient_id)
        .in("status", ["pending", "sent"])

      if (!rxError && prescriptions && prescriptions.length > 0) {
        // Cancel all pending/sent prescriptions
        const prescriptionIds = prescriptions.map((p) => p.id)
        const cancellationReason = `Patient transferred to external facility: ${body.transfer_to}`

        const { error: cancelError } = await supabase
          .from("prescriptions")
          .update({
            status: "cancelled",
            cancelled_reason: cancellationReason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: initiatedBy,
            updated_at: new Date().toISOString(),
          })
          .in("id", prescriptionIds)

        if (!cancelError) {
          // Record cancelled prescriptions in transfer_prescriptions table
          const transferPrescriptions = prescriptions.map((rx) => ({
            transfer_id: transfer.id,
            prescription_id: rx.id,
            prescription_status_before: rx.status,
            cancellation_reason: cancellationReason,
          }))

          await supabase
            .from("patient_transfer_prescriptions")
            .insert(transferPrescriptions)

          cancelledPrescriptions = prescriptions
        }
      }
    }

    // Update patient status
    const patientUpdate: Record<string, unknown> = {
      is_transferred: true,
      transferred_at: new Date().toISOString(),
      transferred_to: body.transfer_to,
      updated_at: new Date().toISOString(),
    }

    // For external transfers, set status to 'transferred' and is_active to false
    if (body.transfer_type === "external") {
      patientUpdate.status = "transferred"
      patientUpdate.is_active = false
    }
    // For internal transfers, keep patient active but update status
    else {
      patientUpdate.status = "active" // or "transferred_internal"
    }

    const { error: patientUpdateError } = await supabase
      .from("patients")
      .update(patientUpdate)
      .eq("id", body.patient_id)

    if (patientUpdateError) {
      console.error("Error updating patient status:", patientUpdateError)
      // Don't fail the transfer if patient update fails, but log it
    }

    return NextResponse.json({
      success: true,
      transfer: transfer,
      cancelled_prescriptions: cancelledPrescriptions.length,
      message: `Transfer initiated successfully. ${cancelledPrescriptions.length > 0 ? `${cancelledPrescriptions.length} prescription(s) cancelled.` : ""}`,
    })
  } catch (error) {
    console.error("Error in patient transfer POST:", error)
    return NextResponse.json(
      { error: "Failed to process patient transfer" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patient_id")
    const status = searchParams.get("status")

    let query = supabase
      .from("patient_transfers")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name
        ),
        initiated_by_staff:staff!patient_transfers_initiated_by_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .order("initiated_at", { ascending: false })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    if (status) {
      query = query.eq("transfer_status", status)
    }

    const { data: transfers, error } = await query

    if (error) {
      console.error("Error fetching transfers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transfers: transfers || [] })
  } catch (error) {
    console.error("Error in patient transfer GET:", error)
    return NextResponse.json(
      { error: "Failed to fetch patient transfers" },
      { status: 500 }
    )
  }
}

