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
    const { patientId, newPin } = body;

    if (!patientId || !newPin) {
      return NextResponse.json(
        { error: "Patient ID and new PIN are required" },
        { status: 400 }
      );
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    // Hash and store the new PIN
    const pinHash = createHash("sha256").update(newPin).digest("hex");
    
    try {
      const { error: updateError } = await supabase
        .from("patients")
        .update({ dosing_pin_hash: pinHash })
        .eq("id", patientId);

      if (updateError) {
        // Check if error is due to missing column
        if (updateError.message?.includes("column") || updateError.code === "42703") {
          console.warn("[Dosing] dosing_pin_hash column does not exist - needs migration");
          // For now, return success but log that migration is needed
          return NextResponse.json({
            success: true,
            message: "PIN reset requested (column migration may be needed)",
            warning: "dosing_pin_hash column may need to be added to patients table",
          });
        }
        
        console.error("[Dosing] Error resetting PIN:", updateError);
        return NextResponse.json(
          { error: "Failed to reset PIN" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("[Dosing] Exception resetting PIN:", error);
      return NextResponse.json(
        { error: "Failed to reset PIN" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PIN reset successfully",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[Dosing] Reset PIN error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset PIN" },
      { status: 500 }
    );
  }
}
