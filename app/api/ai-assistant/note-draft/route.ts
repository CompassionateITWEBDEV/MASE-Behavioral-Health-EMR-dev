/**
 * Clinical Note Draft Generation API
 * Generates draft SOAP notes from AI analysis
 */

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { generateNoteDraft } from "@/lib/services/note-draft-generator";
import {
  aggregatePatientContext,
} from "@/lib/services/patient-data-aggregator";

export async function POST(request: Request) {
  try {
    // Check authentication
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId, specialtyId, encounterType, chiefComplaint } = body;

    if (!patientId || !specialtyId || !encounterType) {
      return NextResponse.json(
        { error: "Patient ID, Specialty ID, and Encounter Type are required" },
        { status: 400 }
      );
    }

    // Get patient data
    const patientContext = await aggregatePatientContext(patientId, true, 3);

    // For note drafts, we can use a simplified AI recommendation
    // In production, you might want to call the full AI assistant first
    const aiRecommendations = {
      summary: `Draft note for ${patientContext.structured.demographics.first_name} ${patientContext.structured.demographics.last_name}`,
      riskAlerts: [],
      recommendations: [],
      drugInteractions: { status: "no_major" as const, message: "No major interactions" },
      labOrders: [],
      differentialDiagnosis: [],
      preventiveGaps: [],
      educationTopics: [],
    };

    // Generate note draft
    const noteDraft = await generateNoteDraft(
      patientId,
      specialtyId,
      encounterType,
      chiefComplaint,
      aiRecommendations,
      patientContext.structured
    );

    return NextResponse.json({
      success: true,
      noteDraft,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API] Note draft generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate note draft" },
      { status: 500 }
    );
  }
}
