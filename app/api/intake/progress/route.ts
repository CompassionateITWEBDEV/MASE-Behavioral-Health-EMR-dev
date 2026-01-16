import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper function to get or create intake progress requirement
async function getOrCreateIntakeProgressRequirement(supabase: any, organizationId?: string | null) {
  const REQUIREMENT_NAME = "Patient Intake Progress"

  // Build query to check if requirement exists
  let query = supabase
    .from("chart_requirements")
    .select("id")
    .eq("requirement_name", REQUIREMENT_NAME)

  // If organization_id is provided, filter by it; otherwise check for null
  if (organizationId) {
    query = query.eq("organization_id", organizationId)
  } else {
    query = query.is("organization_id", null)
  }

  const { data: existingRequirement } = await query.maybeSingle()

  if (existingRequirement) {
    return existingRequirement.id
  }

  // Create the requirement if it doesn't exist
  const requirementData: any = {
    requirement_name: REQUIREMENT_NAME,
    requirement_type: "admission",
    description: "Tracks patient intake and orientation progress",
    applies_to_programs: ["OTP"],
    is_mandatory: false,
  }

  // Add organization_id if provided
  if (organizationId) {
    requirementData.organization_id = organizationId
  }

  const { data: newRequirement, error } = await supabase
    .from("chart_requirements")
    .insert(requirementData)
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error creating intake progress requirement:", error)
    throw error
  }

  return newRequirement.id
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      patient_id,
      admission_date,
      status,
      program_type,
      primary_substance,
      medication,
      orientation_progress,
      completed_items,
      documentation_status,
      assessment_data,
      consent_forms_data,
    } = body

    if (!patient_id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Check if admission record exists
    const { data: existingAdmission } = await supabase
      .from("otp_admissions")
      .select("id")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Prepare admission data
    const admissionData: any = {
      patient_id,
      admission_date: admission_date || new Date().toISOString().split("T")[0],
      status: status || (orientation_progress === 100 ? "active" : "pending_orientation"),
      program_type: program_type || "OTP",
      primary_substance: primary_substance || null,
      medication: medication || "pending",
      updated_at: new Date().toISOString(),
    }

    let admission
    let admissionError

    if (existingAdmission) {
      // Update existing record
      const { data, error } = await supabase
        .from("otp_admissions")
        .update(admissionData)
        .eq("id", existingAdmission.id)
        .select()
        .single()
      admission = data
      admissionError = error
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("otp_admissions")
        .insert(admissionData)
        .select()
        .single()
      admission = data
      admissionError = error
    }

    if (admissionError) {
      console.error("[v0] Error saving admission:", admissionError)
      throw admissionError
    }

    // Store progress data
    const progressData = {
      orientation_progress,
      completed_items,
      documentation_status,
      assessment_data,
      consent_forms_data: consent_forms_data || null, // Include consent data in progress for fallback
      saved_at: new Date().toISOString(),
    }

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patient_id)
      .single()

    // Get or create the intake progress requirement
    const requirementId = await getOrCreateIntakeProgressRequirement(
      supabase,
      patientData?.organization_id || null
    )

    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from("patient_chart_items")
      .select("id")
      .eq("patient_id", patient_id)
      .eq("requirement_id", requirementId)
      .maybeSingle()

    const progressRecord: any = {
      patient_id,
      requirement_id: requirementId,
      due_date: new Date().toISOString().split("T")[0],
      completed_date: orientation_progress === 100 ? new Date().toISOString().split("T")[0] : null,
      status: orientation_progress === 100 ? "completed" : "pending",
      notes: JSON.stringify({
        type: "intake_progress",
        ...progressData,
      }),
      updated_at: new Date().toISOString(),
    }

    let progressError = null
    if (existingProgress) {
      // Update existing record
      const { error } = await supabase
        .from("patient_chart_items")
        .update(progressRecord)
        .eq("id", existingProgress.id)
      progressError = error
    } else {
      // Insert new record
      const { error } = await supabase.from("patient_chart_items").insert(progressRecord)
      progressError = error
    }

    if (progressError) {
      console.error("[v0] Error saving progress tracking:", progressError)
      // Throw error to ensure user knows progress wasn't saved
      throw new Error(`Failed to save progress: ${progressError.message}`)
    }

    // If consent_forms_data exists, also save it as a separate consent_forms record
    console.log("[v0] Checking consent_forms_data:", {
      hasData: !!consent_forms_data,
      hasConsentForms: !!(consent_forms_data?.consentForms),
      keys: consent_forms_data ? Object.keys(consent_forms_data) : [],
      structure: consent_forms_data ? JSON.stringify(consent_forms_data).substring(0, 500) : null
    });
    
    // Check if consent_forms_data has any actual form data
    const hasConsentData = consent_forms_data && (
      consent_forms_data.consentForms || 
      (typeof consent_forms_data === 'object' && Object.keys(consent_forms_data).length > 0 && 
       !consent_forms_data.completionStats) // If it's the direct consentForms object
    );
    
    if (hasConsentData) {
      try {
        // Get patient's organization_id if available
        const { data: patientDataForConsent } = await supabase
          .from("patients")
          .select("organization_id")
          .eq("id", patient_id)
          .single()

        // Get or create the consent forms requirement
        // We'll use a simple inline function since we can't easily import from another route
        const REQUIREMENT_NAME = "Patient Consent Forms"
        let requirementQuery = supabase
          .from("chart_requirements")
          .select("id")
          .eq("requirement_name", REQUIREMENT_NAME)

        if (patientDataForConsent?.organization_id) {
          requirementQuery = requirementQuery.eq("organization_id", patientDataForConsent.organization_id)
        } else {
          requirementQuery = requirementQuery.is("organization_id", null)
        }

        const { data: existingRequirement } = await requirementQuery.maybeSingle()

        let consentRequirementId
        if (existingRequirement) {
          consentRequirementId = existingRequirement.id
        } else {
          const newRequirementData: any = {
            requirement_name: REQUIREMENT_NAME,
            requirement_type: "admission",
            is_mandatory: true,
            description: "Comprehensive patient consent forms",
            applies_to_programs: ["OTP", "Outpatient"],
          }

          if (patientDataForConsent?.organization_id) {
            newRequirementData.organization_id = patientDataForConsent.organization_id
          }

          const { data: newRequirement, error: reqError } = await supabase
            .from("chart_requirements")
            .insert(newRequirementData)
            .select()
            .single()

          if (reqError) {
            console.error("[v0] Error creating consent forms requirement:", reqError)
            throw reqError
          }

          consentRequirementId = newRequirement.id
        }

        // Prepare consent data structure
        // Handle both structures: 
        // 1. { consentForms: {...}, completionStats: {...}, ... } (from onComplete)
        // 2. Direct consentForms object (from state)
        let consentForms = {};
        let completionStats = {};
        let savedSignature = "";
        let signaturePin = "";
        
        if (consent_forms_data.consentForms) {
          // Structure 1: Nested structure
          consentForms = consent_forms_data.consentForms || {};
          completionStats = consent_forms_data.completionStats || {};
          savedSignature = consent_forms_data.savedSignature || "";
          signaturePin = consent_forms_data.signaturePin || "";
        } else if (typeof consent_forms_data === 'object' && Object.keys(consent_forms_data).length > 0) {
          // Structure 2: Direct consentForms object (form IDs as keys)
          // Calculate completion stats from the forms
          const allForms = Object.values(consent_forms_data);
          const completedForms = allForms.filter((f: any) => f?.completed);
          const requiredForms = allForms.filter((f: any) => f?.required !== false); // Assume all are required if not specified
          const completedRequired = requiredForms.filter((f: any) => f?.completed);
          
          consentForms = consent_forms_data;
          completionStats = {
            requiredCompleted: completedRequired.length,
            totalRequired: requiredForms.length,
            totalCompleted: completedForms.length,
            totalForms: allForms.length,
          };
          savedSignature = "";
          signaturePin = "";
        }
        
        const consentData = {
          consentForms: consentForms,
          completionStats: completionStats,
          savedSignature: savedSignature,
          signaturePin: signaturePin,
          completedAt: completionStats?.requiredCompleted === completionStats?.totalRequired 
            ? new Date().toISOString() 
            : null,
        }
        
        console.log("[v0] Saving consent forms data:", {
          formsCount: Object.keys(consentForms).length,
          completionStats: completionStats,
          hasSignature: !!savedSignature
        });

        // Check if consent chart item exists
        const { data: existingConsentItem } = await supabase
          .from("patient_chart_items")
          .select("id, notes")
          .eq("patient_id", patient_id)
          .eq("requirement_id", consentRequirementId)
          .maybeSingle()

        // Prepare notes data - merge with existing if present
        let consentNotesData: any = {
          type: "consent_forms",
          consentData: consentData,
          saved_at: new Date().toISOString(),
        }

        // If existing chart item has other data, preserve it
        if (existingConsentItem?.notes) {
          try {
            const existingNotes = typeof existingConsentItem.notes === 'string' 
              ? JSON.parse(existingConsentItem.notes) 
              : existingConsentItem.notes
            
            if (existingNotes.type === "consent_forms") {
              // Merge with existing consent data
              consentNotesData = {
                ...existingNotes,
                consentData: {
                  ...existingNotes.consentData,
                  ...consentData,
                },
                saved_at: new Date().toISOString(),
              }
            }
          } catch (parseError) {
            console.error("[v0] Error parsing existing consent notes:", parseError)
            // Continue with new notes data
          }
        }

        const consentChartItemRecord: any = {
          patient_id,
          requirement_id: consentRequirementId,
          due_date: new Date().toISOString().split("T")[0],
          completed_date: consent_forms_data.completionStats?.requiredCompleted === consent_forms_data.completionStats?.totalRequired 
            ? new Date().toISOString().split("T")[0] 
            : null,
          status: consent_forms_data.completionStats?.requiredCompleted === consent_forms_data.completionStats?.totalRequired ? "completed" : "pending",
          notes: JSON.stringify(consentNotesData),
          updated_at: new Date().toISOString(),
        }

        if (existingConsentItem) {
          // Update existing record
          const { error: consentError } = await supabase
            .from("patient_chart_items")
            .update(consentChartItemRecord)
            .eq("id", existingConsentItem.id)
          
          if (consentError) {
            console.error("[v0] Error saving consent forms:", consentError)
            // Don't throw - progress was saved successfully, consent is secondary
          } else {
            console.log("[v0] Successfully updated consent forms record:", {
              patient_id,
              requirement_id: consentRequirementId,
              formsCount: Object.keys(consentForms).length
            });
          }
        } else {
          // Insert new record
          const { error: consentError } = await supabase
            .from("patient_chart_items")
            .insert(consentChartItemRecord)
          
          if (consentError) {
            console.error("[v0] Error saving consent forms:", consentError)
            // Don't throw - progress was saved successfully, consent is secondary
          } else {
            console.log("[v0] Successfully created consent forms record:", {
              patient_id,
              requirement_id: consentRequirementId,
              formsCount: Object.keys(consentForms).length
            });
          }
        }
      } catch (consentSaveError) {
        console.error("[v0] Error processing consent forms during progress save:", consentSaveError)
        // Don't throw - progress was saved successfully, consent is secondary
      }
    }

    return NextResponse.json({
      success: true,
      admission,
      progress: progressData,
    })
  } catch (error: any) {
    console.error("[v0] Error saving intake progress:", error)
    return NextResponse.json({ error: error.message || "Failed to save intake progress" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const patient_id = searchParams.get("patient_id")

    if (!patient_id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Get admission data
    const { data: admission, error: admissionError } = await supabase
      .from("otp_admissions")
      .select("*")
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (admissionError && admissionError.code !== "PGRST116") {
      // PGRST116 is "not found" - that's okay
      console.error("[v0] Error fetching admission:", admissionError)
    }

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patient_id)
      .single()

    // Get progress data from patient_chart_items
    // First, find the intake progress requirement
    const REQUIREMENT_NAME = "Patient Intake Progress"
    let requirementQuery = supabase
      .from("chart_requirements")
      .select("id")
      .eq("requirement_name", REQUIREMENT_NAME)

    // Filter by organization_id if available
    if (patientData?.organization_id) {
      requirementQuery = requirementQuery.eq("organization_id", patientData.organization_id)
    } else {
      requirementQuery = requirementQuery.is("organization_id", null)
    }

    const { data: requirement } = await requirementQuery.maybeSingle()

    let progressData = null
    if (requirement) {
      const { data: progressItems, error: progressError } = await supabase
        .from("patient_chart_items")
        .select("*")
        .eq("patient_id", patient_id)
        .eq("requirement_id", requirement.id)
        .order("updated_at", { ascending: false })
        .limit(1)

      if (progressError && progressError.code !== "PGRST116") {
        console.warn("[v0] Error fetching progress:", progressError)
      }

      if (progressItems && progressItems.length > 0) {
        try {
          const notes = progressItems[0].notes
          if (notes) {
            const parsed = typeof notes === "string" ? JSON.parse(notes) : notes
            if (parsed.type === "intake_progress") {
              progressData = parsed
            }
          }
        } catch (e) {
          console.warn("[v0] Could not parse progress data:", e)
        }
      }
    }


    return NextResponse.json({
      admission: admission || null,
      progress: progressData,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching intake progress:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch intake progress" }, { status: 500 })
  }
}

