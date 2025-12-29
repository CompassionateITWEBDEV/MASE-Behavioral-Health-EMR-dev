import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Fetch patient data - explicitly include client_number and patient_number
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()

    if (patientError) {
      console.error("[v0] Error fetching patient:", patientError)
      return NextResponse.json({ error: patientError.message }, { status: 500 })
    }

    if (!patientData) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Log patient data to debug patient number issue
    console.log("[v0] Patient data fetched:", {
      id: patientData.id,
      name: `${patientData.first_name} ${patientData.last_name}`,
      client_number: patientData.client_number,
      patient_number: patientData.patient_number,
      allKeys: Object.keys(patientData),
    })

    // Fetch all related data in parallel
    const [vitalsResult, medsResult, assessmentsResult, encountersResult, dosingResult, consentsResult] =
      await Promise.all([
        supabase
          .from("vital_signs")
          .select("*")
          .eq("patient_id", id)
          .order("measurement_date", { ascending: false })
          .limit(30),
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("assessments")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("encounters")
          .select("*")
          .eq("patient_id", id)
          .order("encounter_date", { ascending: false })
          .limit(10),
        supabase
          .from("dosing_log")
          .select("*")
          .eq("patient_id", id)
          .order("dose_date", { ascending: false })
          .limit(30),
        supabase
          .from("hie_patient_consents")
          .select("*")
          .eq("patient_id", id)
          .order("created_at", { ascending: false }),
      ])

    return NextResponse.json({
      patient: patientData,
      vitalSigns: vitalsResult.data || [],
      medications: medsResult.data || [],
      assessments: assessmentsResult.data || [],
      encounters: encountersResult.data || [],
      dosingLog: dosingResult.data || [],
      consents: consentsResult.data || [],
    })
  } catch (error) {
    console.error("[v0] Error fetching patient chart data:", error)
    return NextResponse.json({ error: "Failed to fetch patient chart data" }, { status: 500 })
  }
}

