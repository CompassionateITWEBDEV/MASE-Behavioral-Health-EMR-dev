import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find portal account by email
    const { data: portalAccount, error: accountError } = await supabase
      .from("patient_portal_accounts")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          client_number,
          date_of_birth,
          phone,
          email
        )
      `)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (accountError) {
      console.error("[Patient Portal Login] Error fetching account:", accountError);
      return NextResponse.json(
        { error: "Login failed. Please try again." },
        { status: 500 }
      );
    }

    if (!portalAccount) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (portalAccount.locked_until) {
      const lockedUntil = new Date(portalAccount.locked_until);
      if (lockedUntil > new Date()) {
        return NextResponse.json(
          { 
            error: `Account is locked until ${lockedUntil.toLocaleString()}` 
          },
          { status: 423 }
        );
      }
      // Lock expired, reset it
      await supabase
        .from("patient_portal_accounts")
        .update({ 
          locked_until: null,
          login_attempts: 0 
        })
        .eq("id", portalAccount.id);
    }

    // Verify password
    if (!portalAccount.password_hash) {
      return NextResponse.json(
        { error: "Account setup incomplete. Please contact support." },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, portalAccount.password_hash);

    if (!passwordValid) {
      // Increment login attempts
      const newAttempts = (portalAccount.login_attempts || 0) + 1;
      const maxAttempts = 5;
      
      let updateData: any = {
        login_attempts: newAttempts,
      };

      // Lock account after max attempts
      if (newAttempts >= maxAttempts) {
        const lockUntil = new Date();
        lockUntil.setHours(lockUntil.getHours() + 1); // Lock for 1 hour
        updateData.locked_until = lockUntil.toISOString();
      }

      await supabase
        .from("patient_portal_accounts")
        .update(updateData)
        .eq("id", portalAccount.id);

      const remainingAttempts = maxAttempts - newAttempts;
      return NextResponse.json(
        { 
          error: `Invalid password. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Account locked for 1 hour.'}` 
        },
        { status: 401 }
      );
    }

    // Successful login - reset login attempts and update last login
    await supabase
      .from("patient_portal_accounts")
      .update({
        last_login_at: new Date().toISOString(),
        login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", portalAccount.id);

    // Return patient info (without sensitive data)
    return NextResponse.json({
      success: true,
      patient: {
        id: portalAccount.patient_id,
        portal_account_id: portalAccount.id,
        first_name: portalAccount.patients?.first_name,
        last_name: portalAccount.patients?.last_name,
        client_number: portalAccount.patients?.client_number,
        email: portalAccount.email,
        email_verified: portalAccount.email_verified,
        mfa_enabled: portalAccount.mfa_enabled,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("[Patient Portal Login] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
