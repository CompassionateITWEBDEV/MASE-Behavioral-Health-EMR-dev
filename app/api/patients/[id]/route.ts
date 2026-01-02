import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    // Fetch patient data - use select("*") to get all available columns
    // program_type will be included if it exists in the database
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()

    if (patientError) {
      console.error("[v0] Error fetching patient:", patientError)
      return NextResponse.json({ error: patientError.message }, { status: 500 })
    }

    if (!patientData) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Log patient data to debug patient number issue
    console.log("[v0] Patient data fetched:", {
      id: patientData.id,
      name: `${patientData.first_name} ${patientData.last_name}`,
      client_number: patientData.client_number,
      patient_number: patientData.patient_number,
      program_type: patientData.program_type,
      allKeys: Object.keys(patientData),
    })

    // Fetch all related data in parallel
    // Wrap potentially missing tables in try-catch to handle gracefully
    const [
      vitalsResult,
      medsResult,
      assessmentsResult,
      encountersResult,
      dosingResult,
      consentsResult,
      udsResult,
      progressNotesResult,
      documentsResult,
    ] = await Promise.all([
      supabase
        .from("vital_signs")
        .select("*")
        .eq("patient_id", id)
        .order("measurement_date", { ascending: false })
        .limit(30),
      supabase
        .from("medications")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("assessments")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false })
        .limit(50), // Increased limit to get nursing assessments
      supabase
        .from("encounters")
        .select("*")
        .eq("patient_id", id)
        .order("encounter_date", { ascending: false })
        .limit(10),
      supabase
        .from("dosing_log")
        .select("*")
        .eq("patient_id", id)
        .order("dose_date", { ascending: false })
        .limit(30),
      supabase
        .from("hie_patient_consents")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("urine_drug_screens")
        .select("*")
        .eq("patient_id", id)
        .order("collection_date", { ascending: false })
        .limit(50),
      supabase
        .from("progress_notes")
        .select("*")
        .eq("patient_id", id)
        .order("note_date", { ascending: false })
        .limit(50),
      supabase
        .from("documents")
        .select("*")
        .eq("patient_id", id)
        .eq("document_type", "court_order")
        .order("document_date", { ascending: false })
        .limit(50),
    ])

    // Handle errors gracefully - return empty arrays if tables don't exist
    return NextResponse.json({
      patient: patientData,
      vitalSigns: vitalsResult.data || [],
      medications: medsResult.data || [],
      assessments: assessmentsResult.data || [],
      encounters: encountersResult.data || [],
      dosingLog: dosingResult.data || [],
      consents: consentsResult.data || [],
      udsResults: udsResult.error ? [] : (udsResult.data || []),
      progressNotes: progressNotesResult.error ? [] : (progressNotesResult.data || []),
      courtOrders: documentsResult.error ? [] : (documentsResult.data || []),
    })
  } catch (error) {
    console.error("[v0] Error fetching patient chart data:", error)
    return NextResponse.json({ error: "Failed to fetch patient chart data" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient()
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    const firstName = body.first_name || body.firstName
    const lastName = body.last_name || body.lastName
    const dateOfBirth = body.date_of_birth || body.dateOfBirth
    const phone = body.phone

    if (!firstName || !lastName || !dateOfBirth || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: first_name, last_name, date_of_birth, and phone are required" },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      phone: phone,
      email: body.email || null,
      gender: body.gender || null,
      address: body.address || null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      insurance_provider: body.insurance_provider || null,
      insurance_id: body.insurance_id || null,
      updated_at: new Date().toISOString(),
    }

    // Handle program_type - normalize if provided
    // Note: We'll try to include it, but if the column doesn't exist, we'll retry without it
    let hasProgramTypeField = false
    if (body.program_type !== undefined) {
      hasProgramTypeField = true
      if (body.program_type && body.program_type.trim()) {
        const normalized = body.program_type.toLowerCase().trim()
        if (normalized === "otp" || normalized.includes("opioid treatment")) {
          updateData.program_type = "otp"
        } else if (normalized === "mat" || normalized.includes("medication-assisted")) {
          updateData.program_type = "mat"
        } else if (normalized === "primary_care" || normalized === "primary care" || normalized.includes("primary")) {
          updateData.program_type = "primary_care"
        } else {
          updateData.program_type = normalized
        }
      } else {
        updateData.program_type = null
      }
    }

    console.log("[v0] Updating patient:", { id, updateData })

    let { data, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    // If error is due to program_type column not existing, retry without it
    if (error && hasProgramTypeField && (
      error.message?.includes("program_type") || 
      error.message?.includes("schema cache") ||
      error.message?.includes("Could not find") ||
      (error.message?.toLowerCase().includes("column") && error.message?.toLowerCase().includes("program_type"))
    )) {
      console.warn("[v0] program_type column may not exist, retrying without it. Error:", error.message)
      const updateDataWithoutProgramType = { ...updateData }
      delete updateDataWithoutProgramType.program_type
      const retryResult = await supabase
        .from("patients")
        .update(updateDataWithoutProgramType)
        .eq("id", id)
        .select()
        .single()
      
      if (retryResult.error) {
        console.error("[v0] Error updating patient (retry):", retryResult.error)
        return NextResponse.json(
          { error: retryResult.error.message || "Failed to update patient" },
          { status: 500 }
        )
      }
      
      data = retryResult.data
      error = null
      console.log("[v0] Patient updated successfully (program_type column not available)")
    }

    if (error) {
      console.error("[v0] Error updating patient:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update patient" },
        { status: 500 }
      )
    }

    console.log("[v0] Patient updated successfully:", data)
    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("[v0] Update patient error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update patient"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    console.log("[v0] Deleting patient:", id)

    // First, verify patient exists
    const { data: patientData, error: fetchError } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("id", id)
      .single()

    if (fetchError || !patientData) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Delete the patient record
    // Note: Related records (appointments, assessments, etc.) will be handled by database CASCADE constraints
    const { error: deleteError } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("[v0] Error deleting patient:", deleteError)
      
      // Check if error is due to foreign key constraints
      if (deleteError.message?.includes("foreign key") || deleteError.message?.includes("violates foreign key")) {
        return NextResponse.json(
          { 
            error: "Cannot delete patient. Patient has related records (appointments, assessments, etc.) that must be removed first." 
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete patient" },
        { status: 500 }
      )
    }

    console.log("[v0] Patient deleted successfully:", {
      id,
      name: `${patientData.first_name} ${patientData.last_name}`
    })

    return NextResponse.json({ 
      success: true,
      message: "Patient deleted successfully"
    })
  } catch (error) {
    console.error("[v0] Delete patient error:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete patient"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

