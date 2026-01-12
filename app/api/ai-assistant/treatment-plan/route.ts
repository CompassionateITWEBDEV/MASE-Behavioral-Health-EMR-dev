/**
 * Treatment Plan Generation API
 * Generates treatment plan drafts from AI analysis
 */

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { generateTreatmentPlanDraft } from "@/lib/services/treatment-plan-generator";
import {
  aggregatePatientContext,
} from "@/lib/services/patient-data-aggregator";
import { processClinicalNotes } from "@/lib/services/note-processor";
import type { AIRecommendation } from "@/types/ai-assistant";

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
    const { patientId, specialtyId } = body;

    if (!patientId || !specialtyId) {
      return NextResponse.json(
        { error: "Patient ID and Specialty ID are required" },
        { status: 400 }
      );
    }

    // Get patient data and generate AI recommendations
    const patientContext = await aggregatePatientContext(patientId, true, 5);
    
    let noteSummary;
    if (patientContext.unstructured.recentNotes.length > 0) {
      try {
        const processed = await processClinicalNotes(
          patientContext.unstructured.recentNotes,
          specialtyId
        );
        noteSummary = processed.summary;
      } catch (error) {
        console.error("Error processing notes:", error);
      }
    }

    // Call the main AI assistant endpoint to get full recommendations
    // In production, you might want to reuse the analysis or call it directly
    let aiRecommendations: AIRecommendation;
    try {
      const aiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai-assistant?patientId=${patientId}&specialtyId=${specialtyId}`,
        {
          headers: {
            Cookie: request.headers.get("Cookie") || "",
          },
        }
      );
      
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        aiRecommendations = aiData.recommendations;
      } else {
        // Fallback to basic structure
        aiRecommendations = {
          summary: `Treatment plan for ${patientContext.structured.demographics.first_name} ${patientContext.structured.demographics.last_name}`,
          riskAlerts: [],
          recommendations: [],
          drugInteractions: { status: "no_major", message: "No major interactions" },
          labOrders: [],
          differentialDiagnosis: [],
          preventiveGaps: [],
          educationTopics: [],
        };
      }
    } catch (error) {
      // Fallback to basic structure
      aiRecommendations = {
        summary: `Treatment plan for ${patientContext.structured.demographics.first_name} ${patientContext.structured.demographics.last_name}`,
        riskAlerts: [],
        recommendations: [],
        drugInteractions: { status: "no_major", message: "No major interactions" },
        labOrders: [],
        differentialDiagnosis: [],
        preventiveGaps: [],
        educationTopics: [],
      };
    }

    // Generate treatment plan draft
    const treatmentPlan = await generateTreatmentPlanDraft(
      patientId,
      specialtyId,
      aiRecommendations,
      patientContext.structured,
      noteSummary
    );

    return NextResponse.json({
      success: true,
      treatmentPlan,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API] Treatment plan generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate treatment plan" },
      { status: 500 }
    );
  }
}
