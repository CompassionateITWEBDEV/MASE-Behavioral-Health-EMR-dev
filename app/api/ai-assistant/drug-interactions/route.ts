/**
 * Drug Interactions API Route
 * Checks for potential drug-drug interactions.
 *
 * This route first attempts to use an external drug interaction service if
 * configured via the DRUG_INTERACTION_API_URL environment variable. The
 * external service should accept a comma-separated list of medication
 * names via a `medications` query parameter and return a JSON object
 * matching the DrugInteractionResult interface. If the external service
 * is not configured or the call fails, the route falls back to a local
 * mock implementation based on simple heuristics. Integrate with a
 * database like DrugBank or RxNorm in production for comprehensive
 * results.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type {
  DrugInteractionResult,
  DrugInteraction,
} from "@/types/ai-assistant";

/**
 * GET /api/ai-assistant/drug-interactions
 * Check drug interactions for a patient's medications or a list of medication
 * IDs. Accepts either a `patientId` or `medicationIds` query parameter.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const patientId = searchParams.get("patientId");
    const medicationIds = searchParams.get("medicationIds")?.split(",");

    if (!patientId && !medicationIds) {
      return NextResponse.json(
        { error: "Either patientId or medicationIds is required" },
        { status: 400 }
      );
    }

    let medications: Array<{ id: string; medication_name: string }> = [];

    if (patientId) {
      // Fetch active medications for the given patient
      const { data, error } = await supabase
        .from("medications")
        .select("id, medication_name")
        .eq("patient_id", patientId)
        .eq("status", "active");
      if (error) {
        console.error("[API] Error fetching medications:", error);
        return NextResponse.json(
          { error: "Failed to fetch medications" },
          { status: 500 }
        );
      }
      medications = data || [];
    } else if (medicationIds) {
      // Fetch specific medications by ID
      const { data, error } = await supabase
        .from("medications")
        .select("id, medication_name")
        .in("id", medicationIds);
      if (error) {
        console.error("[API] Error fetching medications:", error);
        return NextResponse.json(
          { error: "Failed to fetch medications" },
          { status: 500 }
        );
      }
      medications = data || [];
    }

    // Attempt to call an external drug interaction API if configured.
    const externalUrl = process.env.DRUG_INTERACTION_API_URL;
    if (externalUrl && medications.length > 0) {
      try {
        // Build query string using medication names. We use lowercase names
        // to avoid case-sensitivity issues. Spaces are replaced with
        // underscores to improve URL encoding readability.
        const medicationNames = medications
          .map((m) => m.medication_name.toLowerCase().replace(/\s+/g, "_"))
          .join(",");
        const url = `${externalUrl}?medications=${encodeURIComponent(medicationNames)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = (await response.json()) as DrugInteractionResult;
          return NextResponse.json(data);
        } else {
          console.warn(
            `[API] External drug interaction service returned ${response.status}: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error(
          "[API] Error calling external drug interaction service:",
          error
        );
        // Continue to fallback implementation below
      }
    }

    // Fallback to mock interaction detection
    const result = checkDrugInteractions(medications);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API] Drug interaction check error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to check drug interactions" },
      { status: 500 }
    );
  }
}

/**
 * Mock drug interaction checker
 * In production, integrate this with a comprehensive drug database.
 */
function checkDrugInteractions(
  medications: Array<{ id: string; medication_name: string }>
): DrugInteractionResult {
  if (medications.length < 2) {
    return {
      status: "no_major",
      message: "No drug interactions to check (less than 2 medications)",
    };
  }

  const interactions: DrugInteraction[] = [];
  const drugNames = medications.map((m) => m.medication_name.toLowerCase());

  // Example mock interactions. Extend this as needed.
  if (drugNames.some((d) => d.includes("warfarin"))) {
    if (drugNames.some((d) => d.includes("aspirin"))) {
      interactions.push({
        drug1: "Warfarin",
        drug2: "Aspirin",
        severity: "major",
        description: "Increased risk of bleeding when used together",
        action:
          "Monitor INR closely, consider alternative antiplatelet if possible",
      });
    }
    if (
      drugNames.some((d) => d.includes("ibuprofen") || d.includes("nsaid"))
    ) {
      interactions.push({
        drug1: "Warfarin",
        drug2: "NSAID",
        severity: "major",
        description:
          "NSAIDs increase anticoagulant effect and bleeding risk",
        action: "Avoid combination if possible, monitor closely",
      });
    }
  }

  if (drugNames.some((d) => d.includes("metformin"))) {
    if (drugNames.some((d) => d.includes("contrast"))) {
      interactions.push({
        drug1: "Metformin",
        drug2: "IV Contrast",
        severity: "major",
        description: "Risk of lactic acidosis with contrast media",
        action: "Hold metformin 48 hours before and after contrast",
      });
    }
  }

  // Determine overall status
  let status: DrugInteractionResult["status"] = "no_major";
  let message = "No significant drug interactions detected";
  if (interactions.some((i) => i.severity === "contraindicated")) {
    status = "critical";
    message =
      "Critical drug interaction detected - contraindicated combination";
  } else if (interactions.some((i) => i.severity === "major")) {
    status = "major";
    message = `${interactions.length} major drug interaction(s) detected`;
  } else if (interactions.some((i) => i.severity === "moderate")) {
    status = "minor";
    message = `${interactions.length} moderate drug interaction(s) detected`;
  }

  return {
    status,
    message,
    interactions: interactions.length > 0 ? interactions : undefined,
  };
}