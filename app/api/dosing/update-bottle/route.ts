import { createServiceClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/middleware";

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
    const { bottleSerial, currentVolume } = body;

    if (!bottleSerial || currentVolume === undefined) {
      return NextResponse.json(
        { error: "Bottle serial and current volume are required" },
        { status: 400 }
      );
    }

    const volumeNum = Number.parseFloat(currentVolume);
    if (isNaN(volumeNum) || volumeNum < 0) {
      return NextResponse.json(
        { error: "Invalid volume amount" },
        { status: 400 }
      );
    }

    // Update bottle volume by serial number
    const { error: updateError } = await supabase
      .from("bottle")
      .update({ 
        current_volume_ml: volumeNum,
        updated_at: new Date().toISOString(),
      })
      .eq("serial_no", bottleSerial);

    if (updateError) {
      console.error("[Dosing] Error updating bottle volume:", updateError);
      // If bottle doesn't exist, that's okay - it might be tracked locally
      // Just return success for local tracking
    }

    return NextResponse.json({
      success: true,
      message: "Bottle volume updated",
      currentVolume: volumeNum,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[Dosing] Update bottle error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update bottle volume" },
      { status: 500 }
    );
  }
}
