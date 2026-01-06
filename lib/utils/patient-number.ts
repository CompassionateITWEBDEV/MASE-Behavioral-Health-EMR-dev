/**
 * Patient Number Generation Utility
 * 
 * Generates sequential patient numbers (client_number) based on program type.
 * Format: PREFIX-XXX-YYYY
 * - PREFIX: OTP, MAT, or PC (based on program_type)
 * - XXX: Group number (increments every 1000 patients: 001, 002, 003...)
 * - YYYY: Sequential number within group (0001-1000)
 * 
 * Examples:
 * - OTP-001-0001, OTP-001-0002, ..., OTP-001-1000, OTP-002-0001
 * - MAT-001-0001, MAT-001-0002, ..., MAT-001-1000, MAT-002-0001
 * - PC-001-0001, PC-001-0002, ..., PC-001-1000, PC-002-0001
 */

type SupabaseClient = ReturnType<typeof import("@supabase/supabase-js").createClient>;

/**
 * Maps program type to patient number prefix
 */
function getProgramPrefix(programType: string | null | undefined): string {
  if (!programType) {
    return "OTP"; // Default to OTP
  }

  const normalized = programType.toLowerCase().trim();
  
  if (normalized === "otp" || normalized.includes("opioid treatment")) {
    return "OTP";
  } else if (normalized === "mat" || normalized.includes("medication-assisted")) {
    return "MAT";
  } else if (normalized === "primary_care" || normalized === "primary care" || normalized.includes("primary")) {
    return "PC";
  }
  
  // Default to OTP for unknown program types
  return "OTP";
}

/**
 * Parses a patient number string to extract group and sequence
 * Returns null if format is invalid
 */
function parsePatientNumber(clientNumber: string, prefix: string): { group: number; sequence: number } | null {
  // Expected format: PREFIX-XXX-YYYY
  const pattern = new RegExp(`^${prefix}-(\\d{3})-(\\d{4})$`);
  const match = clientNumber.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const group = parseInt(match[1], 10);
  const sequence = parseInt(match[2], 10);
  
  return { group, sequence };
}

/**
 * Generates the next patient number for a given program type
 * 
 * @param programType - The program type (otp, mat, primary_care)
 * @param supabase - Supabase client instance
 * @returns The next patient number in format PREFIX-XXX-YYYY
 */
export async function generatePatientNumber(
  programType: string | null | undefined,
  supabase: SupabaseClient
): Promise<string> {
  const prefix = getProgramPrefix(programType);
  
  try {
    // Query all existing client_numbers for this program type
    // We need to get all of them to find the highest number
    const { data: patients, error } = await supabase
      .from("patients")
      .select("client_number, program_type")
      .not("client_number", "is", null)
      .ilike("client_number", `${prefix}-%`);
    
    if (error) {
      console.warn("[Patient Number] Error querying existing numbers:", error);
      // If query fails, start fresh
      return `${prefix}-001-0001`;
    }
    
    // Filter to only patients with matching program type (if provided)
    type PatientWithNumber = { client_number: string | null; program_type?: string | null };
    let relevantPatients: PatientWithNumber[] = (patients || []) as PatientWithNumber[];
    if (programType) {
      const normalizedProgramType = programType.toLowerCase().trim();
      relevantPatients = relevantPatients.filter((p) => {
        if (!p.program_type) return false;
        const pt = p.program_type.toLowerCase().trim();
        return pt === normalizedProgramType;
      });
    }
    
    // If no existing patients, start at 001-0001
    if (relevantPatients.length === 0) {
      return `${prefix}-001-0001`;
    }
    
    // Parse all patient numbers and find the highest
    let maxGroup = 0;
    let maxSequence = 0;
    let foundValidNumber = false;
    
    for (const patient of relevantPatients) {
      if (!patient.client_number) continue;
      const parsed = parsePatientNumber(patient.client_number, prefix);
      if (parsed) {
        foundValidNumber = true;
        if (parsed.group > maxGroup) {
          maxGroup = parsed.group;
          maxSequence = parsed.sequence;
        } else if (parsed.group === maxGroup && parsed.sequence > maxSequence) {
          maxSequence = parsed.sequence;
        }
      }
    }
    
    // If no valid numbers found, start at 001-0001
    if (!foundValidNumber) {
      return `${prefix}-001-0001`;
    }
    
    // Generate next number
    let nextGroup = maxGroup;
    let nextSequence = maxSequence + 1;
    
    // If sequence exceeds 1000, move to next group
    if (nextSequence > 1000) {
      nextGroup += 1;
      nextSequence = 1;
    }
    
    // Ensure group is at least 001
    if (nextGroup === 0) {
      nextGroup = 1;
      nextSequence = 1;
    }
    
    // Format with leading zeros
    const groupStr = nextGroup.toString().padStart(3, "0");
    const sequenceStr = nextSequence.toString().padStart(4, "0");
    
    return `${prefix}-${groupStr}-${sequenceStr}`;
    
  } catch (error) {
    console.error("[Patient Number] Error generating patient number:", error);
    // On error, return a default starting number
    return `${prefix}-001-0001`;
  }
}

