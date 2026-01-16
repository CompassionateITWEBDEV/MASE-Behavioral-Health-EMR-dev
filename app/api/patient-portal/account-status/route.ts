import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if portal account exists
    const { data: portalAccount, error } = await supabase
      .from("patient_portal_accounts")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error) {
      console.error("[Patient Portal] Error checking account status:", error);
      
      // If table doesn't exist, return gracefully
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.warn("[Patient Portal] patient_portal_accounts table does not exist. Please run the migration script.");
        return NextResponse.json({
          exists: false,
          account: null,
          error: "Table not found - migration required",
        });
      }
      
      return NextResponse.json(
        { error: "Failed to check account status" },
        { status: 500 }
      );
    }

    if (!portalAccount) {
      return NextResponse.json({
        exists: false,
        account: null,
      });
    }

    // Return account info (without sensitive data)
    return NextResponse.json({
      exists: true,
      account: {
        id: portalAccount.id,
        email: portalAccount.email,
        email_verified: portalAccount.email_verified,
        phone_verified: portalAccount.phone_verified,
        mfa_enabled: portalAccount.mfa_enabled,
        last_login_at: portalAccount.last_login_at,
        created_at: portalAccount.created_at,
        locked_until: portalAccount.locked_until,
        login_attempts: portalAccount.login_attempts,
      },
    });
  } catch (error) {
    console.error("[Patient Portal] Account status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
