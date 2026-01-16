import { createServiceClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("[API] SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { 
          error: "Service role key not configured",
          warning: "SUPABASE_SERVICE_ROLE_KEY environment variable is missing"
        },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const activeOnly = searchParams.get("active") !== "false";

    let query = supabase
      .from("staff")
      .select("*")
      .order("last_name", { ascending: true });

    if (activeOnly) {
      // Filter for active staff only
      query = query.eq("is_active", true);
    }

    let { data, error } = await query;

    // Debug: Log query results
    console.log("[API] Query result:", {
      hasData: !!data,
      dataLength: data?.length || 0,
      hasError: !!error,
      error: error ? { message: error.message, code: error.code, details: error.details } : null,
      activeOnly,
      firstStaff: data?.[0] ? {
        id: data[0].id,
        name: `${data[0].first_name} ${data[0].last_name}`,
        role: data[0].role,
        roleType: typeof data[0].role,
        roleString: String(data[0].role),
        is_active: data[0].is_active
      } : null
    });

    // If query returned 0 results and we're filtering by active, try without filter
    if (!error && (!data || data.length === 0) && activeOnly) {
      console.warn("[API] Query returned 0 results with is_active filter, trying without filter");
      const { data: retryData, error: retryError } = await supabase
        .from("staff")
        .select("*")
        .order("last_name", { ascending: true });
      
      if (!retryError && retryData && retryData.length > 0) {
        console.log("[API] Retry successful, got", retryData.length, "staff members");
        data = retryData;
        error = null;
      } else {
        console.error("[API] Retry also failed:", retryError);
      }
    }

    if (error) {
      // If is_active column doesn't exist, retry without filter
      if (error.message?.includes("is_active") || error.code === "42703") {
        console.warn("[API] is_active column not found, fetching all staff");
        const { data: retryData, error: retryError } = await supabase
          .from("staff")
          .select("*")
          .order("last_name", { ascending: true });
        
        if (retryError) {
          console.error("[API] Retry error:", retryError);
          throw retryError;
        }
        
        console.log("[API] Retry data:", {
          count: retryData?.length || 0,
          roles: retryData?.map((s: any) => ({
            name: `${s.first_name} ${s.last_name}`,
            role: s.role,
            roleString: String(s.role)
          })) || []
        });
        
        // Filter by eligible roles in JavaScript
        const eligibleRoles = ["counselor", "case_manager", "therapist", "social_worker", "case manager"];
        const filtered = (retryData || []).filter((s: any) => {
          if (!s.role) {
            console.log("[API] Staff with no role:", s.id);
            return false;
          }
          
          const roleString = String(s.role).toLowerCase().trim();
          const staffRole = roleString.replace(/\s+/g, "_").replace(/-/g, "_");
          
          // Check if role matches any eligible role
          const matches = eligibleRoles.some(eligible => {
            const normalizedEligible = eligible.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
            const isMatch = staffRole === normalizedEligible || staffRole.includes(normalizedEligible);
            
            if (isMatch) {
              console.log("[API] Match found:", {
                staffName: `${s.first_name} ${s.last_name}`,
                staffRole,
                normalizedEligible
              });
            }
            
            return isMatch;
          });
          
          if (!matches) {
            console.log("[API] No match for:", {
              staffName: `${s.first_name} ${s.last_name}`,
              originalRole: s.role,
              roleString,
              staffRole
            });
          }
          
          return matches;
        });
        
        // If no matches, return all staff with warning
        if (filtered.length === 0 && retryData && retryData.length > 0) {
          const availableRoles = [...new Set(retryData.map((s: any) => s.role).filter(Boolean))];
          console.warn("[API] No staff found with eligible roles. Available roles:", availableRoles);
          return NextResponse.json({ 
            staff: retryData,
            warning: "No staff found with eligible roles. Showing all staff.",
            availableRoles
          });
        }
        
        return NextResponse.json({ staff: filtered });
      }
      throw error;
    }

    // Debug: Log all staff before filtering
    console.log("[API] Before filtering:", {
      totalStaff: data?.length || 0,
      allStaff: data?.map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        role: s.role,
        roleType: typeof s.role,
        roleString: String(s.role),
        roleLower: String(s.role).toLowerCase(),
        normalized: String(s.role).toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_"),
        is_active: s.is_active
      })) || []
    });

    // Filter by eligible roles in JavaScript (avoids ENUM type issues)
    const eligibleRoles = ["counselor", "case_manager", "therapist", "social_worker", "case manager"];
    const filtered = (data || []).filter((s: any) => {
      if (!s.role) {
        console.log("[API] Staff with no role:", s.id, s.first_name, s.last_name);
        return false;
      }
      
      // Handle ENUM types - convert to string first
      const roleString = String(s.role).toLowerCase().trim();
      const staffRole = roleString.replace(/\s+/g, "_").replace(/-/g, "_");
      
      // Check if role matches any eligible role
      const matches = eligibleRoles.some(eligible => {
        const normalizedEligible = eligible.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
        const isMatch = staffRole === normalizedEligible || staffRole.includes(normalizedEligible);
        
        if (isMatch) {
          console.log("[API] Match found:", {
            staffName: `${s.first_name} ${s.last_name}`,
            staffRole,
            normalizedEligible,
            originalRole: s.role
          });
        }
        
        return isMatch;
      });
      
      if (!matches) {
        console.log("[API] No match for role:", {
          staffName: `${s.first_name} ${s.last_name}`,
          originalRole: s.role,
          roleString,
          staffRole,
          eligibleRoles
        });
      }
      
      return matches;
    });

    // If no staff found with eligible roles, return all active staff (for debugging)
    if (filtered.length === 0 && data && data.length > 0) {
      const availableRoles = [...new Set(data.map((s: any) => s.role).filter(Boolean))];
      console.warn("[API] No staff found with eligible roles. Available roles:", availableRoles);
      // Return all staff so user can see what's available
      return NextResponse.json({ 
        staff: data,
        warning: "No staff found with eligible roles. Showing all staff.",
        availableRoles
      });
    }

    // If still no data after all attempts, return error info
    if (!data || data.length === 0) {
      console.error("[API] No staff data available after all attempts");
      return NextResponse.json({ 
        staff: [],
        error: "No staff members found in database",
        warning: "Please check if staff table has data and RLS policies"
      });
    }

    console.log("[API] Staff request result:", {
      total: data?.length || 0,
      filtered: filtered.length,
      activeOnly,
      availableRoles: data ? [...new Set(data.map((s: any) => s.role).filter(Boolean))] : [],
      filteredStaff: filtered.map((s: any) => ({
        name: `${s.first_name} ${s.last_name}`,
        role: s.role
      }))
    });

    return NextResponse.json({ staff: filtered });
  } catch (error: any) {
    console.error("[API] Error fetching staff:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
