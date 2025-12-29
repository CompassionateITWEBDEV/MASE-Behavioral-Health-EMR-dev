/**
 * Clinical Alerts API Route
 * Handles fetching and creating clinical alerts
 *
 * Uses the `clinical_alerts` table from MASTER_COMPLETE_SETUP.sql schema
 * Falls back to empty array if table doesn't exist
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ClinicalAlert } from "@/types/clinical";
import type { AlertVariant, PriorityLevel } from "@/types/common";

/**
 * GET /api/clinical-alerts
 * Fetch clinical alerts with optional filtering
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const patientId = searchParams.get("patientId");
    const priority = searchParams.get("priority");
    const acknowledged = searchParams.get("acknowledged");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Try clinical_alerts table
    let query = supabase
      .from("clinical_alerts")
      .select(
        `
        id,
        patient_id,
        alert_type,
        severity,
        alert_message,
        triggered_by,
        status,
        acknowledged_by,
        acknowledged_at,
        created_at,
        patients (
          first_name,
          last_name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply patient filter
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    // Apply priority/severity filter
    if (priority && priority !== "all") {
      query = query.eq("severity", priority);
    }

    // Apply acknowledged filter
    if (acknowledged === "false") {
      query = query.eq("status", "active");
    } else if (acknowledged === "true") {
      query = query.in("status", ["acknowledged", "resolved", "dismissed"]);
    }

    const { data: alerts, error, count } = await query;

    if (error) {
      // If table doesn't exist, return empty structure
      if (error.code === "42P01") {
        console.warn("[API] clinical_alerts table not found");
        return NextResponse.json({
          alerts: [],
          count: { total: 0, unacknowledged: 0 },
        });
      }
      console.error("[API] Error fetching clinical alerts:", error);
      return NextResponse.json(
        { alerts: [], error: error.message },
        { status: 500 }
      );
    }

    // Transform to match ClinicalAlert type
    const transformedAlerts: ClinicalAlert[] = (alerts || []).map((alert) => {
      // Handle joined patient data (could be object or array)
      const patientsData = alert.patients as unknown;
      let patientName = "Unknown Patient";
      if (patientsData && typeof patientsData === "object") {
        const patientObj = Array.isArray(patientsData)
          ? patientsData[0]
          : patientsData;
        if (patientObj?.first_name && patientObj?.last_name) {
          patientName = `${patientObj.first_name} ${patientObj.last_name}`;
        }
      }

      return {
        patient: patientName,
        patientId: alert.patient_id,
        message: alert.alert_message,
        priority: mapSeverityToPriority(alert.severity),
        time: formatTimeAgo(alert.created_at),
        type: mapSeverityToVariant(alert.severity),
        isAcknowledged: alert.status !== "active",
      };
    });

    // Calculate unacknowledged count
    const unacknowledgedCount = transformedAlerts.filter(
      (a) => !a.isAcknowledged
    ).length;

    return NextResponse.json({
      alerts: transformedAlerts,
      count: { total: count || 0, unacknowledged: unacknowledgedCount },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API] Clinical alerts API error:", err);
    return NextResponse.json(
      { alerts: [], error: err.message || "Failed to fetch clinical alerts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clinical-alerts
 * Create a new clinical alert
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.patient_id && !body.patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }
    if (!body.alert_message && !body.message) {
      return NextResponse.json(
        { error: "Alert message is required" },
        { status: 400 }
      );
    }

    const insertData = {
      patient_id: body.patient_id || body.patientId,
      alert_type: body.alert_type || body.type || "general",
      severity: body.severity || body.priority || "medium",
      alert_message: body.alert_message || body.message,
      triggered_by: body.triggered_by || body.source || "manual",
      status: "active",
    };

    const { data, error } = await supabase
      .from("clinical_alerts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[API] Error creating clinical alert:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[API] Create clinical alert error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create clinical alert" },
      { status: 500 }
    );
  }
}

// Helper functions
function mapSeverityToPriority(severity: string | null): PriorityLevel {
  const priorityMap: Record<string, PriorityLevel> = {
    critical: "high",
    high: "high",
    medium: "medium",
    low: "low",
  };
  return priorityMap[severity || ""] || "medium";
}

function mapSeverityToVariant(severity: string | null): AlertVariant {
  const variantMap: Record<string, AlertVariant> = {
    critical: "destructive",
    high: "destructive",
    medium: "warning",
    low: "info",
  };
  return variantMap[severity || ""] || "default";
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}
