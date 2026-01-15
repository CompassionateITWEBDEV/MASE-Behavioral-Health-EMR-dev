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
    
    const {
      patient_id,
      order_type,
      current_dose_mg,
      requested_dose_mg,
      clinical_justification,
      physician_id,
      nurse_id,
      nurse_signature,
      status,
    } = body;

    // Validate required fields (nurse_id can be a placeholder for superadmin)
    if (!patient_id || !order_type || !clinical_justification || !physician_id) {
      return NextResponse.json(
        { error: "Missing required fields: patient_id, order_type, clinical_justification, and physician_id are required" },
        { status: 400 }
      );
    }

    // For superadmin sessions, use a default nurse_id or get from session
    const getFinalNurseId = async (): Promise<string> => {
      if (isSuperAdmin && (!nurse_id || nurse_id === "super_admin" || nurse_id === "super_admin_session")) {
        // Try to get superadmin ID from session
        try {
          const cookieStore = await cookies();
          const sessionToken = cookieStore.get("super_admin_session")?.value;
          if (sessionToken) {
            const { data: session } = await supabase
              .from("super_admin_sessions")
              .select("super_admin_id")
              .eq("session_token", sessionToken)
              .gt("expires_at", new Date().toISOString())
              .single();
            
            if (session?.super_admin_id) {
              return session.super_admin_id;
            }
          }
          return "super_admin";
        } catch {
          return "super_admin";
        }
      }
      return nurse_id || "";
    };

    const finalNurseId = await getFinalNurseId();

    // If still no nurse_id, return error
    if (!finalNurseId) {
      return NextResponse.json(
        { error: "Unable to identify nurse/staff member. Please ensure you are logged in." },
        { status: 401 }
      );
    }

    // Validate order_type
    const validOrderTypes = ["increase", "decrease", "hold", "taper", "split"];
    if (!validOrderTypes.includes(order_type)) {
      return NextResponse.json(
        { error: `Invalid order_type. Must be one of: ${validOrderTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate dose amounts if provided
    if (current_dose_mg !== null && current_dose_mg !== undefined) {
      const currentDose = Number(current_dose_mg);
      if (isNaN(currentDose) || currentDose < 0) {
        return NextResponse.json(
          { error: "current_dose_mg must be a valid positive number" },
          { status: 400 }
        );
      }
    }

    if (requested_dose_mg !== null && requested_dose_mg !== undefined) {
      const requestedDose = Number(requested_dose_mg);
      if (isNaN(requestedDose) || requestedDose < 0) {
        return NextResponse.json(
          { error: "requested_dose_mg must be a valid positive number" },
          { status: 400 }
        );
      }
    }

    // Validate status
    const validStatuses = ["draft", "pending_physician_review", "approved", "denied"];
    const finalStatus = status || "pending_physician_review";
    if (!validStatuses.includes(finalStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Insert order request
    const { data: orderRequest, error: insertError } = await supabase
      .from("medication_order_requests")
      .insert({
        patient_id,
        order_type,
        current_dose_mg: current_dose_mg !== null && current_dose_mg !== undefined ? Number(current_dose_mg) : null,
        requested_dose_mg: requested_dose_mg !== null && requested_dose_mg !== undefined ? Number(requested_dose_mg) : null,
        clinical_justification,
        physician_id,
        nurse_id: finalNurseId,
        nurse_signature: nurse_signature || null,
        status: finalStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Medication Order Request] Insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to create medication order request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_request: orderRequest,
      message: "Medication order request created successfully",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[Medication Order Request] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create medication order request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const isSuperAdmin = await checkSuperAdminSession();
    
    if (!isSuperAdmin) {
      const { user, error: authError } = await getAuthenticatedUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");
    const status = searchParams.get("status");
    const physicianId = searchParams.get("physician_id");

    // First, fetch orders
    let query = supabase
      .from("medication_order_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (physicianId) {
      query = query.eq("physician_id", physicianId);
    }

    const { data: orders, error: fetchError } = await query;

    if (fetchError) {
      console.error("[Medication Order Request] Fetch error:", fetchError);
      return NextResponse.json(
        { error: fetchError.message || "Failed to fetch medication order requests" },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        order_requests: [],
      });
    }

    // Get unique patient IDs
    const patientIds = [...new Set(orders.map((o: any) => o.patient_id).filter(Boolean))];
    
    // Fetch patient data separately using INNER JOIN via SQL
    // This ensures we get patient names even if relationship query fails
    let orderRequests: any[] = [];
    
    if (patientIds.length > 0) {
      // Fetch patients
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .in("id", patientIds);

      if (patientsError) {
        console.error("[Medication Order Request] Error fetching patients:", patientsError);
        // Continue without patient data rather than failing
      }

      // Create patient map
      const patientMap = new Map(
        (patients || []).map((p: any) => [p.id, { id: p.id, first_name: p.first_name, last_name: p.last_name }])
      );

      // Merge orders with patient data
      orderRequests = orders.map((order: any) => ({
        ...order,
        patients: order.patient_id ? (patientMap.get(order.patient_id) || null) : null,
      }));

      console.log(`[Medication Order Request] Merged ${orderRequests.length} orders with patient data`);
      console.log(`[Medication Order Request] Patients found: ${patientMap.size} out of ${patientIds.length} requested`);
      
      // Debug: Log sample
      if (orderRequests.length > 0) {
        console.log("[Medication Order Request] Sample order:", {
          orderId: orderRequests[0].id,
          patientId: orderRequests[0].patient_id,
          patientName: orderRequests[0].patients 
            ? `${orderRequests[0].patients.first_name} ${orderRequests[0].patients.last_name}`
            : "NOT FOUND"
        });
      }
    } else {
      // No patient IDs, return orders as-is
      orderRequests = orders;
    }

    return NextResponse.json({
      success: true,
      order_requests: orderRequests || [],
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("[Medication Order Request] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch medication order requests" },
      { status: 500 }
    );
  }
}
