import { createServiceClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/middleware";

// Helper function to get or create intake progress requirement
async function getOrCreateIntakeProgressRequirement(supabase: any, organizationId?: string | null) {
  const REQUIREMENT_NAME = "Patient Intake Progress";

  // Build query to check if requirement exists
  let query = supabase
    .from("chart_requirements")
    .select("id")
    .eq("requirement_name", REQUIREMENT_NAME);

  // If organization_id is provided, filter by it; otherwise check for null
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.is("organization_id", null);
  }

  const { data: existingRequirement } = await query.maybeSingle();

  if (existingRequirement) {
    return existingRequirement.id;
  }

  // Create the requirement if it doesn't exist
  const requirementData: any = {
    requirement_name: REQUIREMENT_NAME,
    requirement_type: "admission",
    description: "Tracks patient intake and orientation progress",
    applies_to_programs: ["OTP"],
    is_mandatory: false,
  };

  // Add organization_id if provided
  if (organizationId) {
    requirementData.organization_id = organizationId;
  }

  const { data: newRequirement, error } = await supabase
    .from("chart_requirements")
    .insert(requirementData)
    .select("id")
    .single();

  if (error) {
    console.error("[v0] Error creating intake progress requirement:", error);
    throw error;
  }

  return newRequirement.id;
}

/**
 * Check if superadmin session is valid
 */
async function checkSuperAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("super_admin_session")?.value;
    
    if (!sessionToken) {
      return false;
    }

    const supabase = createServiceClient();
    const { data: session, error } = await supabase
      .from("super_admin_sessions")
      .select("super_admin_id, expires_at")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    return !error && !!session;
  } catch {
    return false;
  }
}

const STAGE_ORDER = [
  "data-entry",
  "eligibility",
  "tech-onboarding",
  "consent-forms",
  "collector-queue",
  "nurse-queue",
  "counselor-queue",
  "doctor-queue",
  "dosing",
];

export async function POST(request: Request) {
  try {
    // Check superadmin session first (silently)
    const isSuperAdmin = await checkSuperAdminSession();
    
    // Only check regular auth if not superadmin
    if (!isSuperAdmin) {
      const { user, error: authError } = await getAuthenticatedUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = createServiceClient();
    const body = await request.json();
    const { patientId, currentStage } = body;

    if (!patientId || !currentStage) {
      return NextResponse.json(
        { error: "Patient ID and current stage are required" },
        { status: 400 }
      );
    }

    // Find current stage index
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Invalid current stage" },
        { status: 400 }
      );
    }

    // Check if already at last stage
    if (currentIndex >= STAGE_ORDER.length - 1) {
      return NextResponse.json(
        { error: "Patient is already at the final stage" },
        { status: 400 }
      );
    }

    const nextStage = STAGE_ORDER[currentIndex + 1];

    // Get patient's admission record
    const { data: admission, error: admissionError } = await supabase
      .from("otp_admissions")
      .select("id, patient_id, status")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (admissionError && admissionError.code !== "PGRST116") {
      // PGRST116 is "no rows returned", which is OK for new patients
      console.error("[v0] Error fetching admission:", admissionError);
    }

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patientId)
      .maybeSingle();

    // Get or create the intake progress requirement
    const requirementId = await getOrCreateIntakeProgressRequirement(
      supabase,
      patientData?.organization_id || null
    );

    let progressData: any = null;
    const { data: progressItem } = await supabase
      .from("patient_chart_items")
      .select("*")
      .eq("patient_id", patientId)
      .eq("requirement_id", requirementId)
      .maybeSingle();

    if (progressItem?.notes) {
      try {
        const parsed = JSON.parse(progressItem.notes);
        // Extract the actual progress data (it's wrapped in a type field)
        if (parsed.type === "intake_progress") {
          progressData = parsed;
        } else {
          progressData = parsed;
        }
      } catch {
        progressData = {};
      }
    }

    // Update progress based on next stage
    // Preserve existing progress data but remove the type field for merging
    const existingData = progressData && progressData.type === "intake_progress" 
      ? { ...progressData } 
      : (progressData || {});
    
    // Remove type field from existing data for clean merge
    delete existingData.type;
    delete existingData.saved_at;
    delete existingData.status;
    delete existingData.completed_date;

    const updates: any = {
      ...existingData,
    };

    switch (nextStage) {
      case "eligibility":
        updates.eligibility_verified = true;
        break;
      case "tech-onboarding":
        updates.tech_onboarding_complete = true;
        if (!updates.orientation_progress || updates.orientation_progress < 25) {
          updates.orientation_progress = 25;
        }
        break;
      case "consent-forms":
        // Mark all consent forms as completed
        if (!updates.documentation_status) {
          updates.documentation_status = {};
        }
        updates.documentation_status = {
          ...updates.documentation_status,
          consent_form: "completed",
          privacy_notice: "completed",
          treatment_agreement: "completed",
          financial_responsibility: "completed",
        };
        if (!updates.orientation_progress || updates.orientation_progress < 50) {
          updates.orientation_progress = 50;
        }
        break;
      case "collector-queue":
        // UDS collection stage - no specific update needed
        // But ensure orientation progress is at least 50% if consents are done
        if (updates.documentation_status) {
          const docStatus = updates.documentation_status || {};
          const allConsentsComplete = Object.values(docStatus).every(
            (status: any) => status === "completed"
          );
          if (allConsentsComplete && (!updates.orientation_progress || updates.orientation_progress < 75)) {
            updates.orientation_progress = 75;
          }
        }
        break;
      case "nurse-queue":
        updates.nurse_assessment_complete = true;
        // Ensure previous stages are marked
        if (!updates.eligibility_verified) updates.eligibility_verified = true;
        if (!updates.tech_onboarding_complete) updates.tech_onboarding_complete = true;
        break;
      case "counselor-queue":
        updates.counselor_assessment_complete = true;
        // Ensure nurse assessment is marked
        if (!updates.nurse_assessment_complete) updates.nurse_assessment_complete = true;
        break;
      case "doctor-queue":
        updates.doctor_assessment_complete = true;
        // Ensure previous assessments are marked
        if (!updates.nurse_assessment_complete) updates.nurse_assessment_complete = true;
        if (!updates.counselor_assessment_complete) updates.counselor_assessment_complete = true;
        break;
      case "dosing":
        // Final stage - ensure all assessments are complete
        updates.nurse_assessment_complete = true;
        updates.counselor_assessment_complete = true;
        updates.doctor_assessment_complete = true;
        if (!updates.orientation_progress || updates.orientation_progress < 100) {
          updates.orientation_progress = 100;
        }
        // Ensure admission is active
        if (admission) {
          await supabase
            .from("otp_admissions")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("id", admission.id);
        }
        break;
    }

    // Update or create progress record in patient_chart_items
    const progressItemData: any = {
      patient_id: patientId,
      requirement_id: requirementId,
      status: nextStage === "dosing" ? "completed" : "in_progress",
      notes: JSON.stringify({
        type: "intake_progress",
        ...updates,
        saved_at: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    };

    if (nextStage === "dosing") {
      progressItemData.completed_date = new Date().toISOString().split("T")[0];
    }

    const { data: existingItem, error: existingItemError } = await supabase
      .from("patient_chart_items")
      .select("id")
      .eq("patient_id", patientId)
      .eq("requirement_id", requirementId)
      .maybeSingle();

    if (existingItemError && existingItemError.code !== "PGRST116") {
      console.error("[Intake Stage] Error checking for existing progress item:", existingItemError);
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("patient_chart_items")
        .update(progressItemData)
        .eq("id", existingItem.id);
      
      if (updateError) {
        console.error("[Intake Stage] Error updating progress item:", updateError);
        throw new Error(`Failed to update progress: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase.from("patient_chart_items").insert({
        ...progressItemData,
        due_date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      });
      
      if (insertError) {
        console.error("[Intake Stage] Error creating progress item:", insertError);
        throw new Error(`Failed to create progress: ${insertError.message}`);
      }
    }

    // Create admission if moving beyond data-entry and no admission exists
    if (!admission && nextStage !== "data-entry") {
      const admissionStatus = nextStage === "dosing" ? "active" : "pending_orientation";
      const { error: insertError } = await supabase
        .from("otp_admissions")
        .insert({
          patient_id: patientId,
          admission_date: new Date().toISOString().split("T")[0],
          status: admissionStatus,
          program_type: "OTP",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (insertError) {
        console.error("[Intake Stage] Error creating admission:", insertError);
        // Don't fail the request, but log the error
      }
    } else if (admission) {
      // Update admission status based on stage progression
      let admissionStatus = admission.status;
      
      // If moving to dosing, ensure status is active
      if (nextStage === "dosing") {
        admissionStatus = "active";
      } else if (nextStage === "doctor-queue" && admission.status === "pending_orientation") {
        // Keep as pending_orientation until dosing
        admissionStatus = "pending_orientation";
      }
      
      // Only update if status changed
      if (admissionStatus !== admission.status) {
        const { error: updateError } = await supabase
          .from("otp_admissions")
          .update({ status: admissionStatus, updated_at: new Date().toISOString() })
          .eq("id", admission.id);
        
        if (updateError) {
          console.error("[Intake Stage] Error updating admission:", updateError);
          // Don't fail the request, but log the error
        }
      }
    }

    console.log("[Intake Stage] Successfully moved patient:", {
      patientId,
      from: currentStage,
      to: nextStage,
    });

    return NextResponse.json({
      success: true,
      nextStage,
      message: `Patient moved to ${nextStage}`,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[v0] Move to next stage error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to move patient to next stage" },
      { status: 500 }
    );
  }
}
