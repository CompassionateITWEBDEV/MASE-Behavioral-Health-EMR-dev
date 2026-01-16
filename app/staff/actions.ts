"use server"

import { createServiceClient } from "@/lib/supabase/server"
import type { StaffRole } from "@/lib/auth/roles"

// Map TypeScript StaffRole to database staff_role ENUM values
// Database ENUM only supports: 'intake', 'counselor', 'doctor', 'rn', 'peer_recovery', 'general_staff', 'admin'
function mapRoleToDatabaseEnum(role: StaffRole): string {
  const roleMap: Record<string, string> = {
    // Direct matches
    'intake': 'intake',
    'counselor': 'counselor',
    'doctor': 'doctor',
    'rn': 'rn',
    'peer_recovery': 'peer_recovery',
    'general_staff': 'general_staff',
    'admin': 'admin',
    // Mappings for roles not in ENUM
    'super_admin': 'admin',
    'lpn': 'rn', // Map LPN to RN
    'dispensing_nurse': 'rn',
    'pharmacist': 'admin',
    'case_manager': 'counselor',
    'medical_assistant': 'general_staff',
    'front_desk': 'general_staff',
    'billing': 'general_staff',
    'supervisor': 'admin',
  }
  return roleMap[role] || 'general_staff'
}

export interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: StaffRole
  department: string | null
  is_active: boolean
  license_type: string | null
  license_number: string | null
  license_expiry: string | null
  hire_date: string | null
  employee_id: string | null
  permissions: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreateStaffInput {
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: StaffRole
  department?: string
  license_type?: string
  license_number?: string
  license_expiry?: string
  employee_id?: string
}

export async function getStaffMembers(): Promise<{ data: StaffMember[] | null; error: string | null }> {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase.from("staff").select("*").order("last_name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching staff:", error)
      return { data: null, error: error.message }
    }

    return { data: data as StaffMember[], error: null }
  } catch (err) {
    console.error("[v0] Unexpected error fetching staff:", err)
    return { data: null, error: "Failed to fetch staff members" }
  }
}

export async function createStaffMember(
  input: CreateStaffInput,
): Promise<{ data: StaffMember | null; error: string | null }> {
  try {
    const supabase = createServiceClient()

    // Generate employee_id if not provided
    const employeeId = input.employee_id || `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Step 1: Create auth user first (required by foreign key constraint)
    // The staff table has: id UUID PRIMARY KEY REFERENCES auth.users(id)
    // So we must create an auth user before creating the staff record
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      email_confirm: true, // Auto-confirm email
      password: `TempPassword${Math.random().toString(36).substring(2, 15)}`, // Generate temporary password
      user_metadata: {
        first_name: input.first_name,
        last_name: input.last_name,
        role: input.role,
        employee_id: employeeId,
      },
    })

    if (authError || !authData.user) {
      console.error("[v0] Error creating auth user:", authError)
      return {
        data: null,
        error: authError?.message || "Failed to create authentication user. Please ensure the email is unique and valid.",
      }
    }

    const authUserId = authData.user.id

    // Step 2: Create staff record with the auth user's ID
    // Map the role to database ENUM value to avoid "operator does not exist" error
    const dbRole = mapRoleToDatabaseEnum(input.role)
    
    const { data, error } = await supabase
      .from("staff")
      .insert({
        id: authUserId, // Use the auth user's ID
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        phone: input.phone || null,
        role: dbRole as any, // Cast to any - Supabase will handle ENUM conversion
        department: input.department || null,
        license_type: input.license_type || null,
        license_number: input.license_number || null,
        license_expiry: input.license_expiry || null,
        employee_id: employeeId,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating staff member:", error)
      // If staff creation fails, try to clean up the auth user
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {
        // Ignore cleanup errors
      })
      return { data: null, error: error.message }
    }

    return { data: data as StaffMember, error: null }
  } catch (err) {
    console.error("[v0] Unexpected error creating staff:", err)
    return { data: null, error: err instanceof Error ? err.message : "Failed to create staff member" }
  }
}

export async function updateStaffMember(
  id: string,
  updates: Partial<Omit<StaffMember, "id" | "created_at" | "updated_at">>,
): Promise<{ data: StaffMember | null; error: string | null }> {
  try {
    const supabase = createServiceClient()

    // If role is being updated, map it to database ENUM value
    const updateData: any = { ...updates }
    
    if (updates.role) {
      // Map the role to database ENUM value
      updateData.role = mapRoleToDatabaseEnum(updates.role) as any
    }

    const { data, error } = await supabase
      .from("staff")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating staff member:", error)
      return { data: null, error: error.message }
    }

    return { data: data as StaffMember, error: null }
  } catch (err) {
    console.error("[v0] Unexpected error updating staff:", err)
    return { data: null, error: "Failed to update staff member" }
  }
}

export async function deleteStaffMember(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createServiceClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("staff")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting staff member:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error("[v0] Unexpected error deleting staff:", err)
    return { success: false, error: "Failed to delete staff member" }
  }
}
