import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function getOrCreateConsentFormsRequirement(supabase: any, organizationId?: string | null) {
  const REQUIREMENT_NAME = "Patient Consent Forms"
  
  let requirementQuery = supabase
    .from("chart_requirements")
    .select("id")
    .eq("requirement_name", REQUIREMENT_NAME)

  if (organizationId) {
    requirementQuery = requirementQuery.eq("organization_id", organizationId)
  } else {
    requirementQuery = requirementQuery.is("organization_id", null)
  }

  const { data: existingRequirement } = await requirementQuery.maybeSingle()

  if (existingRequirement) {
    return existingRequirement.id
  }

  // Create new requirement
  const newRequirementData: any = {
    requirement_name: REQUIREMENT_NAME,
    requirement_type: "admission",
    is_mandatory: true,
    description: "Comprehensive patient consent forms",
    applies_to_programs: ["OTP", "Outpatient"],
  }

  if (organizationId) {
    newRequirementData.organization_id = organizationId
  }

  const { data: newRequirement, error } = await supabase
    .from("chart_requirements")
    .insert(newRequirementData)
    .select()
    .single()

  if (error) {
    console.error("Error creating consent forms requirement:", error)
    throw error
  }

  return newRequirement.id
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patient_id = searchParams.get("patient_id")

    if (!patient_id) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patient_id)
      .single()

    // Get or create the consent forms requirement
    const requirementId = await getOrCreateConsentFormsRequirement(
      supabase,
      patientData?.organization_id || null
    )

    // Load from patient_chart_items table
    const { data: chartItem, error: chartError } = await supabase
      .from("patient_chart_items")
      .select("notes")
      .eq("patient_id", patient_id)
      .eq("requirement_id", requirementId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!chartError && chartItem?.notes) {
      try {
        const notesData = typeof chartItem.notes === 'string' 
          ? JSON.parse(chartItem.notes) 
          : chartItem.notes

        if (notesData.type === "consent_forms" && notesData.consentData) {
          return NextResponse.json({
            success: true,
            data: {
              consentForms: notesData.consentData.consentForms || {},
              completionStats: notesData.consentData.completionStats || {},
              savedSignature: notesData.consentData.savedSignature || "",
            }
          })
        }
      } catch (parseError) {
        console.error("Error parsing notes data:", parseError)
      }
    }

    // Return empty data if nothing found
    return NextResponse.json({
      success: true,
      data: {
        consentForms: {},
        completionStats: {},
        savedSignature: "",
      }
    })
  } catch (error: any) {
    console.error("Error loading consent forms:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patient_id, consentForms, completionStats, savedSignature, signaturePin } = body

    if (!patient_id) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Prepare consent data structure
    const consentData = {
      consentForms: consentForms || {},
      completionStats: completionStats || {},
      savedSignature: savedSignature || "",
      signaturePin: signaturePin || "",
      completedAt: completionStats?.requiredCompleted === completionStats?.totalRequired 
        ? new Date().toISOString() 
        : null,
    }

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patient_id)
      .single()

    // Get or create the consent forms requirement
    const requirementId = await getOrCreateConsentFormsRequirement(
      supabase,
      patientData?.organization_id || null
    )

    // Check if chart item exists
    const { data: existingChartItem } = await supabase
      .from("patient_chart_items")
      .select("id, notes")
      .eq("patient_id", patient_id)
      .eq("requirement_id", requirementId)
      .maybeSingle()

    // Prepare notes data - merge with existing if present
    let notesData: any = {
      type: "consent_forms",
      consentData: consentData,
      saved_at: new Date().toISOString(),
    }

    // If existing chart item has other data, preserve it
    if (existingChartItem?.notes) {
      try {
        const existingNotes = typeof existingChartItem.notes === 'string' 
          ? JSON.parse(existingChartItem.notes) 
          : existingChartItem.notes
        
        if (existingNotes.type === "consent_forms") {
          // Merge with existing consent data
          notesData = {
            ...existingNotes,
            consentData: {
              ...existingNotes.consentData,
              ...consentData,
            },
            saved_at: new Date().toISOString(),
          }
        }
      } catch (parseError) {
        console.error("Error parsing existing notes:", parseError)
        // Continue with new notes data
      }
    }

    const chartItemRecord: any = {
      patient_id,
      requirement_id: requirementId,
      due_date: new Date().toISOString().split("T")[0],
      completed_date: completionStats?.requiredCompleted === completionStats?.totalRequired 
        ? new Date().toISOString().split("T")[0] 
        : null,
      status: completionStats?.requiredCompleted === completionStats?.totalRequired ? "completed" : "pending",
      notes: JSON.stringify(notesData),
      updated_at: new Date().toISOString(),
    }

    let saveError = null
    if (existingChartItem) {
      // Update existing record
      const { error } = await supabase
        .from("patient_chart_items")
        .update(chartItemRecord)
        .eq("id", existingChartItem.id)
      saveError = error
    } else {
      // Insert new record
      const { error } = await supabase
        .from("patient_chart_items")
        .insert(chartItemRecord)
      saveError = error
    }

    if (saveError) {
      console.error("Error saving consent forms to patient_chart_items:", saveError)
      return NextResponse.json(
        { success: false, error: "Failed to save consent forms data", details: saveError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Consent forms saved successfully",
      data: { patient_id, ...consentData }
    })
  } catch (error: any) {
    console.error("Error in consent forms API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
