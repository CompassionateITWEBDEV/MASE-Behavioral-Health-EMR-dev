/**
 * Role-Based Context Service
 * Filters and customizes AI recommendations based on user role
 */

export type UserRole =
  | "physician"
  | "nurse"
  | "therapist"
  | "care_manager"
  | "counselor"
  | "admin"
  | "provider"
  | "other";

export interface RoleContext {
  role: UserRole;
  specialtyId?: string;
  permissions?: string[];
}

/**
 * Maps database role strings to standardized role types
 */
export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return "provider";

  const roleLower = role.toLowerCase();

  if (
    roleLower.includes("physician") ||
    roleLower.includes("doctor") ||
    roleLower.includes("md") ||
    roleLower.includes("do")
  ) {
    return "physician";
  }

  if (
    roleLower.includes("nurse") ||
    roleLower.includes("rn") ||
    roleLower.includes("lpn")
  ) {
    return "nurse";
  }

  if (
    roleLower.includes("therapist") ||
    roleLower.includes("pt") ||
    roleLower.includes("ot") ||
    roleLower.includes("slp")
  ) {
    return "therapist";
  }

  if (
    roleLower.includes("care_manager") ||
    roleLower.includes("case_manager") ||
    roleLower.includes("care coordinator")
  ) {
    return "care_manager";
  }

  if (
    roleLower.includes("counselor") ||
    roleLower.includes("lpc") ||
    roleLower.includes("lcsw")
  ) {
    return "counselor";
  }

  if (roleLower.includes("admin")) {
    return "admin";
  }

  return "provider";
}

/**
 * Gets role-specific focus areas for AI recommendations
 */
export function getRoleFocusAreas(role: UserRole): string[] {
  switch (role) {
    case "physician":
      return [
        "diagnostic recommendations",
        "treatment plan decisions",
        "medication management",
        "differential diagnosis",
        "specialist referrals",
        "clinical decision-making",
      ];

    case "nurse":
      return [
        "care coordination",
        "medication administration",
        "patient education",
        "vital signs monitoring",
        "follow-up scheduling",
        "patient adherence",
        "care plan execution",
      ];

    case "therapist":
      return [
        "progress tracking",
        "goal adjustments",
        "treatment modifications",
        "functional assessments",
        "discharge planning",
        "home exercise programs",
      ];

    case "care_manager":
      return [
        "care gaps",
        "follow-up scheduling",
        "patient engagement",
        "resource coordination",
        "preventive care",
        "chronic disease management",
      ];

    case "counselor":
      return [
        "therapy progress",
        "treatment adherence",
        "crisis assessment",
        "support services",
        "relapse prevention",
      ];

    default:
      return [
        "clinical recommendations",
        "patient care",
        "treatment planning",
      ];
  }
}

/**
 * Gets role-specific information to emphasize in AI prompts
 */
export function getRolePromptContext(role: UserRole): string {
  switch (role) {
    case "physician":
      return `You are providing recommendations to a PHYSICIAN. Focus on:
- Diagnostic considerations and differential diagnoses
- Evidence-based treatment recommendations
- Medication management and adjustments
- Specialist referral needs
- Clinical decision support for complex cases
- Billing and documentation requirements`;

    case "nurse":
      return `You are providing recommendations to a NURSE. Focus on:
- Care coordination tasks and follow-ups
- Medication administration and monitoring
- Patient education topics and materials
- Vital signs and symptom monitoring
- Patient adherence and engagement
- Practical care delivery recommendations`;

    case "therapist":
      return `You are providing recommendations to a THERAPIST. Focus on:
- Progress toward therapy goals
- Treatment plan modifications
- Functional assessment results
- Home exercise program updates
- Re-evaluation timing
- Discharge readiness`;

    case "care_manager":
      return `You are providing recommendations to a CARE MANAGER. Focus on:
- Preventive care gaps
- Care coordination needs
- Follow-up scheduling
- Patient engagement strategies
- Resource referrals
- Chronic disease management tracking`;

    case "counselor":
      return `You are providing recommendations to a COUNSELOR. Focus on:
- Therapy session planning
- Treatment adherence
- Crisis intervention needs
- Support service referrals
- Relapse prevention strategies
- Progress monitoring`;

    default:
      return `You are providing clinical recommendations. Focus on evidence-based care and patient safety.`;
  }
}

/**
 * Filters AI recommendations based on role relevance
 */
export function filterRecommendationsByRole(
  role: UserRole,
  recommendations: {
    riskAlerts: any[];
    recommendations: any[];
    labOrders: any[];
    differentialDiagnosis: any[];
    preventiveGaps: any[];
    educationTopics: any[];
  }
): {
  riskAlerts: any[];
  recommendations: any[];
  labOrders: any[];
  differentialDiagnosis: any[];
  preventiveGaps: any[];
  educationTopics: any[];
} {
  const filtered = {
    riskAlerts: [...recommendations.riskAlerts], // Always show all alerts
    recommendations: [...recommendations.recommendations],
    labOrders: [...recommendations.labOrders],
    differentialDiagnosis: [...recommendations.differentialDiagnosis],
    preventiveGaps: [...recommendations.preventiveGaps],
    educationTopics: [...recommendations.educationTopics],
  };

  switch (role) {
    case "nurse":
      // Nurses see all but emphasize care coordination
      // Filter out complex diagnostic recommendations
      filtered.differentialDiagnosis = [];
      filtered.recommendations = filtered.recommendations.filter(
        (rec) =>
          !rec.category?.toLowerCase().includes("diagnostic") &&
          !rec.text?.toLowerCase().includes("differential")
      );
      break;

    case "therapist":
      // Therapists focus on progress and goals
      filtered.differentialDiagnosis = [];
      filtered.labOrders = filtered.labOrders.filter(
        (lab) =>
          lab.test?.toLowerCase().includes("functional") ||
          lab.test?.toLowerCase().includes("assessment")
      );
      break;

    case "care_manager":
      // Care managers focus on gaps and coordination
      filtered.differentialDiagnosis = [];
      filtered.labOrders = [];
      break;

    case "counselor":
      // Counselors focus on therapy and support
      filtered.differentialDiagnosis = [];
      filtered.labOrders = [];
      break;

    case "physician":
    default:
      // Physicians see everything
      break;
  }

  return filtered;
}

/**
 * Gets role-specific system prompt addition
 */
export function getRoleSystemPromptAddition(role: UserRole): string {
  return getRolePromptContext(role);
}
