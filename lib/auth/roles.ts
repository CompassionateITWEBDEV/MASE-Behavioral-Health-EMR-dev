// Role definitions and permissions for staff management system
export const STAFF_ROLES = {
  INTAKE: "intake",
  COUNSELOR: "counselor",
  DOCTOR: "doctor",
  RN: "rn",
  PEER_RECOVERY: "peer_recovery",
  GENERAL_STAFF: "general_staff",
  ADMIN: "admin",
} as const

export const REGULATORY_ROLES = {
  DEA_INSPECTOR: "dea_inspector",
  JOINT_COMMISSION_SURVEYOR: "joint_commission_surveyor",
  STATE_INSPECTOR: "state_inspector",
  COMPLIANCE_OFFICER: "compliance_officer",
  READ_ONLY_AUDITOR: "read_only_auditor",
} as const

export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES]
export type RegulatoryRole = (typeof REGULATORY_ROLES)[keyof typeof REGULATORY_ROLES]
export type UserRole = StaffRole | RegulatoryRole

// Permission definitions
export const PERMISSIONS = {
  // Patient management
  PATIENTS_READ: "patients:read",
  PATIENTS_WRITE: "patients:write",
  PATIENTS_DELETE: "patients:delete",

  // Medication management
  MEDICATIONS_READ: "medications:read",
  MEDICATIONS_WRITE: "medications:write",
  MEDICATIONS_PRESCRIBE: "medications:prescribe",
  MEDICATIONS_DISPENSE: "medications:dispense",

  // Assessment and treatment
  ASSESSMENTS_READ: "assessments:read",
  ASSESSMENTS_WRITE: "assessments:write",
  TREATMENT_PLANS_READ: "treatment_plans:read",
  TREATMENT_PLANS_WRITE: "treatment_plans:write",

  // Progress notes
  PROGRESS_NOTES_READ: "progress_notes:read",
  PROGRESS_NOTES_WRITE: "progress_notes:write",

  // Appointments
  APPOINTMENTS_READ: "appointments:read",
  APPOINTMENTS_WRITE: "appointments:write",
  APPOINTMENTS_SCHEDULE: "appointments:schedule",

  // Staff management
  STAFF_READ: "staff:read",
  STAFF_WRITE: "staff:write",
  STAFF_ADMIN: "staff:admin",

  // Regulatory and compliance
  COMPLIANCE_READ: "compliance:read",
  COMPLIANCE_WRITE: "compliance:write",
  REGULATORY_ACCESS: "regulatory:access",

  // System administration
  SYSTEM_ADMIN: "system:admin",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Staff roles
  [STAFF_ROLES.INTAKE]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_SCHEDULE,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_WRITE,
  ],

  [STAFF_ROLES.COUNSELOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_WRITE,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.TREATMENT_PLANS_WRITE,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.PROGRESS_NOTES_WRITE,
  ],

  [STAFF_ROLES.DOCTOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.MEDICATIONS_WRITE,
    PERMISSIONS.MEDICATIONS_PRESCRIBE,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_WRITE,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.TREATMENT_PLANS_WRITE,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.PROGRESS_NOTES_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
  ],

  [STAFF_ROLES.RN]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.MEDICATIONS_WRITE,
    PERMISSIONS.MEDICATIONS_DISPENSE,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.PROGRESS_NOTES_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
  ],

  [STAFF_ROLES.PEER_RECOVERY]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.PROGRESS_NOTES_WRITE,
    PERMISSIONS.TREATMENT_PLANS_READ,
  ],

  [STAFF_ROLES.GENERAL_STAFF]: [PERMISSIONS.PATIENTS_READ, PERMISSIONS.APPOINTMENTS_READ],

  [STAFF_ROLES.ADMIN]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.PATIENTS_DELETE,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.MEDICATIONS_WRITE,
    PERMISSIONS.MEDICATIONS_PRESCRIBE,
    PERMISSIONS.MEDICATIONS_DISPENSE,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.ASSESSMENTS_WRITE,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.TREATMENT_PLANS_WRITE,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.PROGRESS_NOTES_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.APPOINTMENTS_SCHEDULE,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_WRITE,
    PERMISSIONS.STAFF_ADMIN,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.COMPLIANCE_WRITE,
    PERMISSIONS.SYSTEM_ADMIN,
  ],

  // Regulatory roles
  [REGULATORY_ROLES.DEA_INSPECTOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.REGULATORY_ACCESS,
  ],

  [REGULATORY_ROLES.JOINT_COMMISSION_SURVEYOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.REGULATORY_ACCESS,
  ],

  [REGULATORY_ROLES.STATE_INSPECTOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.REGULATORY_ACCESS,
  ],

  [REGULATORY_ROLES.COMPLIANCE_OFFICER]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.COMPLIANCE_READ,
    PERMISSIONS.COMPLIANCE_WRITE,
    PERMISSIONS.STAFF_READ,
  ],

  [REGULATORY_ROLES.READ_ONLY_AUDITOR]: [
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.MEDICATIONS_READ,
    PERMISSIONS.ASSESSMENTS_READ,
    PERMISSIONS.TREATMENT_PLANS_READ,
    PERMISSIONS.PROGRESS_NOTES_READ,
    PERMISSIONS.COMPLIANCE_READ,
  ],
}

// Utility functions for role checking
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions.includes(permission)
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission))
}

export function canAccessResource(
  userRole: UserRole,
  resource: string,
  action: "read" | "write" | "delete" | "admin",
): boolean {
  const permission = `${resource}:${action}` as Permission
  return hasPermission(userRole, permission)
}

export function isStaffRole(role: string): role is StaffRole {
  return Object.values(STAFF_ROLES).includes(role as StaffRole)
}

export function isRegulatoryRole(role: string): role is RegulatoryRole {
  return Object.values(REGULATORY_ROLES).includes(role as RegulatoryRole)
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [STAFF_ROLES.INTAKE]: "Intake Specialist",
    [STAFF_ROLES.COUNSELOR]: "Counselor",
    [STAFF_ROLES.DOCTOR]: "Doctor",
    [STAFF_ROLES.RN]: "Registered Nurse",
    [STAFF_ROLES.PEER_RECOVERY]: "Peer Recovery Specialist",
    [STAFF_ROLES.GENERAL_STAFF]: "General Staff",
    [STAFF_ROLES.ADMIN]: "Administrator",
    [REGULATORY_ROLES.DEA_INSPECTOR]: "DEA Inspector",
    [REGULATORY_ROLES.JOINT_COMMISSION_SURVEYOR]: "Joint Commission Surveyor",
    [REGULATORY_ROLES.STATE_INSPECTOR]: "State Inspector",
    [REGULATORY_ROLES.COMPLIANCE_OFFICER]: "Compliance Officer",
    [REGULATORY_ROLES.READ_ONLY_AUDITOR]: "Read-Only Auditor",
  }

  return roleNames[role] || role
}
