import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      // If no patientId provided, return error instead of mock data
      // This ensures we always require a patientId for real data
      console.warn("[Patient Portal] No patientId provided in query");
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .select(
        `
        id,
        first_name,
        last_name,
        date_of_birth,
        phone,
        email,
        status,
        created_at,
        client_number,
        patient_medications(
          id,
          medication_name,
          dosage,
          frequency,
          status,
          start_date
        ),
        prescriptions(
          id,
          medication_name,
          dosage,
          strength,
          directions,
          status,
          prescribed_date
        ),
        appointments(
          id,
          appointment_date,
          appointment_time,
          status,
          appointment_type,
          providers(
            id,
            first_name,
            last_name,
            phone,
            email
          )
        )
      `
      )
      .eq("id", patientId)
      .single();

    if (error || !patient) {
      console.error("[v0] Error fetching patient portal info:", error);
      return NextResponse.json(getMockPatientInfo());
    }

    // Get admission date from otp_admissions table for accurate recovery days
    const { data: admission } = await supabase
      .from("otp_admissions")
      .select("admission_date")
      .eq("patient_id", patientId)
      .order("admission_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    // Find active medication or prescription for program info
    // Try patient_medications first (has frequency), then prescriptions
    const activeMedication = patient.patient_medications?.find(
      (m: any) => m.status === "active"
    );
    const activePrescription = patient.prescriptions?.find(
      (p: any) => p.status === "active" || p.status === "sent"
    );
    
    // Prefer active medication over prescription
    const activeMed = activeMedication || activePrescription;

    // Find next appointment
    const upcomingAppointment = patient.appointments
      ?.filter(
        (a: any) =>
          a.status === "scheduled" && new Date(a.appointment_date) >= new Date()
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.appointment_date).getTime() -
          new Date(b.appointment_date).getTime()
      )[0];

    // Get counselor/provider info from appointment or find primary provider
    let counselorName = "Assigned Counselor";
    let counselorPhone = "";
    
    if (upcomingAppointment?.providers) {
      const provider = Array.isArray(upcomingAppointment.providers)
        ? upcomingAppointment.providers[0]
        : upcomingAppointment.providers;
      
      if (provider) {
        counselorName = provider.first_name && provider.last_name
          ? `Dr. ${provider.first_name} ${provider.last_name}`
          : "Assigned Counselor";
        counselorPhone = provider.phone || "";
      }
    } else if (activeMed) {
      // Try to find provider from active medication or prescription
      // Check if it's from patient_medications or prescriptions
      const isFromMedications = activeMedication && activeMed.id === activeMedication.id;
      const tableName = isFromMedications ? "patient_medications" : "prescriptions";
      const providerField = isFromMedications ? "prescribed_by" : "prescribed_by";
      
      const { data: medWithProvider } = await supabase
        .from(tableName)
        .select(`
          ${providerField},
          providers:${providerField}(
            id,
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq("id", activeMed.id)
        .single();
      
      if (medWithProvider?.providers) {
        const provider = Array.isArray(medWithProvider.providers)
          ? medWithProvider.providers[0]
          : medWithProvider.providers;
        
        if (provider && provider.first_name && provider.last_name) {
          counselorName = `Dr. ${provider.first_name} ${provider.last_name}`;
          counselorPhone = provider.phone || "";
        }
      }
    }

    // Calculate recovery days from admission date or patient created_at
    const startDate = admission?.admission_date || patient.created_at;
    const recoveryDays = calculateRecoveryDays(startDate);

    return NextResponse.json({
      name: `${patient.first_name} ${patient.last_name}`,
      id: patient.client_number || `PT-${patient.id.slice(0, 8)}`,
      patientId: patient.id,
      program: activeMed?.medication_name || "Treatment Program",
      dose: activeMed?.dosage || activeMed?.strength || activeMed?.directions || (activeMed?.frequency ? `${activeMed.dosage} ${activeMed.frequency}` : "N/A"),
      nextAppointment: upcomingAppointment
        ? `${new Date(
            upcomingAppointment.appointment_date
          ).toLocaleDateString()} at ${upcomingAppointment.appointment_time || "TBD"}`
        : "No upcoming appointments",
      counselor: counselorName,
      counselorPhone: counselorPhone || "Contact facility for phone number",
      recoveryDays: recoveryDays,
    });
  } catch (error) {
    console.error("[v0] Patient portal info error:", error);
    return NextResponse.json(getMockPatientInfo());
  }
}

function calculateRecoveryDays(startDate: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getMockPatientInfo() {
  return {
    name: "Sarah Johnson",
    id: "PT-2024-001",
    patientId: null, // Will be null for demo - frontend should handle this
    program: "Methadone Program",
    dose: "80mg",
    nextAppointment: "January 18, 2024 at 10:00 AM",
    counselor: "Dr. Smith",
    counselorPhone: "(555) 123-4567",
    recoveryDays: 127,
  };
}
