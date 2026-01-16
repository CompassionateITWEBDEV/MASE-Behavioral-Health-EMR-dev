import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper function to get or create intake progress requirement
async function getOrCreateIntakeProgressRequirement(supabase: any, organizationId?: string | null) {
  const REQUIREMENT_NAME = "Patient Intake Progress";

  let query = supabase
    .from("chart_requirements")
    .select("id")
    .eq("requirement_name", REQUIREMENT_NAME);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.is("organization_id", null);
  }

  const { data: existingRequirement } = await query.maybeSingle();

  if (existingRequirement) {
    return existingRequirement.id;
  }

  const requirementData: any = {
    requirement_name: REQUIREMENT_NAME,
    requirement_type: "admission",
    description: "Tracks patient intake and orientation progress",
    applies_to_programs: ["OTP"],
    is_mandatory: false,
  };

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

// Valid intake queue stages in order
const INTAKE_STAGES = [
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { stage, action } = body; // action: 'next' | 'specific'

    if (!stage && action !== "next") {
      return NextResponse.json(
        { error: "Stage or action is required" },
        { status: 400 }
      );
    }

    // AWAIT params - Next.js 15 requires this!
    const { patientId } = await params;

    // Get patient's organization_id if available
    const { data: patientData } = await supabase
      .from("patients")
      .select("organization_id")
      .eq("id", patientId)
      .single();

    if (!patientData) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get current progress data
    const REQUIREMENT_NAME = "Patient Intake Progress";
    let requirementQuery = supabase
      .from("chart_requirements")
      .select("id")
      .eq("requirement_name", REQUIREMENT_NAME);

    if (patientData.organization_id) {
      requirementQuery = requirementQuery.eq("organization_id", patientData.organization_id);
    } else {
      requirementQuery = requirementQuery.is("organization_id", null);
    }

    const { data: requirement } = await requirementQuery.maybeSingle();

    // Get or create requirement
    const requirementId = requirement 
      ? requirement.id 
      : await getOrCreateIntakeProgressRequirement(
          supabase,
          patientData.organization_id || null
        );

    // Get existing progress
    const { data: progressItems } = await supabase
      .from("patient_chart_items")
      .select("*")
      .eq("patient_id", patientId)
      .eq("requirement_id", requirementId)
      .order("updated_at", { ascending: false })
      .limit(1);

    let currentProgressData: any = {
      type: "intake_progress",
      orientation_progress: 0,
      completed_items: [],
      documentation_status: {},
      assessment_data: {},
    };

    if (progressItems && progressItems.length > 0) {
      try {
        const notes = progressItems[0].notes;
        if (notes) {
          const parsed = typeof notes === "string" ? JSON.parse(notes) : notes;
          if (parsed.type === "intake_progress") {
            currentProgressData = parsed;
          }
        }
      } catch (e) {
        console.warn("[v0] Could not parse existing progress data:", e);
      }
    }

    // Determine target stage
    let targetStage: string;
    if (action === "next") {
      // Get current stage from progress data or determine it
      const currentStage = currentProgressData.manual_stage || 
        currentProgressData.current_stage || 
        "data-entry";
      
      const currentIndex = INTAKE_STAGES.indexOf(currentStage);
      if (currentIndex === -1 || currentIndex === INTAKE_STAGES.length - 1) {
        return NextResponse.json(
          { error: "Cannot move to next stage - already at final stage or invalid stage" },
          { status: 400 }
        );
      }
      targetStage = INTAKE_STAGES[currentIndex + 1];
    } else {
      // Validate stage
      if (!INTAKE_STAGES.includes(stage)) {
        return NextResponse.json(
          { error: `Invalid stage. Must be one of: ${INTAKE_STAGES.join(", ")}` },
          { status: 400 }
        );
      }
      targetStage = stage;
    }

    // Update progress data with manual stage
    const updatedProgressData = {
      ...currentProgressData,
      manual_stage: targetStage,
      current_stage: targetStage,
      stage_updated_at: new Date().toISOString(),
      stage_updated_by: "system", // Could be enhanced to track user
    };

    // Update or create progress record
    const progressRecord: any = {
      patient_id: patientId,
      requirement_id: requirementId,
      due_date: new Date().toISOString().split("T")[0],
      status: targetStage === "dosing" ? "completed" : "pending",
      notes: JSON.stringify(updatedProgressData),
      updated_at: new Date().toISOString(),
    };

    if (progressItems && progressItems.length > 0) {
      // Update existing
      const { error: updateError } = await supabase
        .from("patient_chart_items")
        .update(progressRecord)
        .eq("id", progressItems[0].id);

      if (updateError) {
        console.error("[v0] Error updating progress:", updateError);
        throw updateError;
      }
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from("patient_chart_items")
        .insert(progressRecord);

      if (insertError) {
        console.error("[v0] Error creating progress:", insertError);
        throw insertError;
      }
    }

    return NextResponse.json({
      success: true,
      stage: targetStage,
      message: `Patient moved to ${targetStage}`,
    });
  } catch (error: any) {
    console.error("[v0] Error updating patient stage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update patient stage" },
      { status: 500 }
    );
  }
}

