import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { patient_id, email, send_invitation = true } = body;

    if (!patient_id || !email) {
      return NextResponse.json(
        { error: "Patient ID and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email")
      .eq("id", patient_id)
      .single();

    if (patientError || !patient) {
      console.error("[Patient Portal] Patient not found:", patientError);
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Check if portal account already exists
    const { data: existingAccount } = await supabase
      .from("patient_portal_accounts")
      .select("id, email")
      .eq("patient_id", patient_id)
      .maybeSingle();

    if (existingAccount) {
      return NextResponse.json(
        {
          error: "Portal account already exists for this patient",
          account_id: existingAccount.id,
          email: existingAccount.email,
        },
        { status: 409 }
      );
    }

    // Check if email is already used by another patient
    const { data: emailExists } = await supabase
      .from("patient_portal_accounts")
      .select("id, patient_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (emailExists) {
      return NextResponse.json(
        { error: "Email is already registered to another patient" },
        { status: 409 }
      );
    }

    // Generate temporary password (8 characters, alphanumeric)
    const tempPassword =
      Math.random().toString(36).slice(-8).toUpperCase() +
      Math.random().toString(36).slice(-4);
    
    // Hash the password
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create portal account
    const { data: newAccount, error: createError } = await supabase
      .from("patient_portal_accounts")
      .insert({
        patient_id,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("[Patient Portal] Error creating account:", createError);
      
      // If table doesn't exist, return helpful error
      if (createError.code === 'PGRST205' || createError.message?.includes('Could not find the table')) {
        return NextResponse.json(
          { 
            error: "Patient portal accounts table does not exist. Please run the migration script: scripts/create_patient_portal_accounts_table.sql" 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to create portal account" },
        { status: 500 }
      );
    }

    // TODO: Send invitation email if send_invitation is true
    // This would require email service integration (SendGrid, AWS SES, etc.)
    if (send_invitation) {
      console.log("[Patient Portal] Would send invitation email to:", email);
      // Email would contain:
      // - Welcome message
      // - Temporary password
      // - Link to patient portal login
      // - Instructions to change password on first login
    }

    return NextResponse.json({
      success: true,
      account_id: newAccount.id,
      email: newAccount.email,
      temporary_password: tempPassword, // Return for staff to share with patient
      message: "Portal account created successfully",
    });
  } catch (error) {
    console.error("[Patient Portal] Create account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
