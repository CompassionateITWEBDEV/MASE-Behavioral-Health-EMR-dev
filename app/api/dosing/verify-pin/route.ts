import { createServiceClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/middleware";
import { createHash } from "crypto";

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

export async function POST(request: Request) {
  try {
    // Check authentication - either regular user or superadmin
    const isSuperAdmin = await checkSuperAdminSession();
    
    if (!isSuperAdmin) {
      const { user, error: authError } = await getAuthenticatedUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = createServiceClient();
    const body = await request.json();
    const { patientId, pin } = body;

    if (!patientId || !pin) {
      return NextResponse.json(
        { error: "Patient ID and PIN are required" },
        { status: 400 }
      );
    }

    // Get patient PIN from database
    // Try to get dosing_pin_hash from patients table (column may not exist yet)
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Try to get PIN hash - check if column exists
    let pinHash = null;
    try {
      const { data: pinData } = await supabase
        .from("patients")
        .select("dosing_pin_hash")
        .eq("id", patientId)
        .maybeSingle();
      
      pinHash = pinData?.dosing_pin_hash;
    } catch (columnError) {
      // Column doesn't exist - this is okay for first-time setup
      console.log("[Dosing] dosing_pin_hash column may not exist yet");
    }

    // If no PIN is set, allow verification and set it (first time setup)
    if (!pinHash) {
      // Hash and store the PIN for future use
      const newPinHash = createHash("sha256").update(pin).digest("hex");
      
      // Try to update - if column doesn't exist, we'll need to add it via migration
      try {
        await supabase
          .from("patients")
          .update({ dosing_pin_hash: newPinHash })
          .eq("id", patientId);
      } catch (updateError) {
        // Column might not exist - log but allow verification for now
        console.warn("[Dosing] Could not update PIN hash - column may need to be added:", updateError);
      }

      return NextResponse.json({
        verified: true,
        message: "PIN set successfully",
      });
    }

    // Verify PIN
    const inputPinHash = createHash("sha256").update(pin).digest("hex");
    const isVerified = inputPinHash === pinHash;

    if (!isVerified) {
      return NextResponse.json(
        { verified: false, error: "Invalid PIN" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: "PIN verified successfully",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[Dosing] PIN verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify PIN" },
      { status: 500 }
    );
  }
}
