import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get("specialty")
    const year = searchParams.get("year") || new Date().getFullYear()

    // Fetch quality measures
    let measuresQuery = supabase.from("quality_measures").select("*").order("measure_id")

    if (specialty && specialty !== "all") {
      measuresQuery = measuresQuery.eq("specialty", specialty)
    }

    const { data: measures, error: measuresError } = await measuresQuery

    if (measuresError) throw measuresError

    // Fetch tracking data for current year
    const { data: tracking, error: trackingError } = await supabase
      .from("quality_measure_tracking")
      .select(`
        *,
        patients (id, first_name, last_name),
        encounters (id, encounter_date, chief_complaint)
      `)
      .eq("performance_year", year)

    if (trackingError) throw trackingError

    // Calculate performance for each measure
    const measuresWithPerformance = measures?.map((measure) => {
      const measureTracking = tracking?.filter((t) => t.measure_id === measure.measure_id) || []

      const denominator = measureTracking.filter((t) => t.denominator_eligible && !t.excluded).length
      const numerator = measureTracking.filter(
        (t) => t.numerator_eligible && t.denominator_eligible && !t.excluded,
      ).length

      const performanceRate = denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0"
      const dataCompleteness =
        denominator > 0
          ? ((measureTracking.filter((t) => t.data_completeness_met).length / denominator) * 100).toFixed(1)
          : "0.0"

      return {
        ...measure,
        denominator,
        numerator,
        performance_rate: Number.parseFloat(performanceRate),
        data_completeness: Number.parseFloat(dataCompleteness),
        meets_minimum: denominator >= 20, // MIPS requires minimum case volume
        meets_data_completeness: Number.parseFloat(dataCompleteness) >= 75,
      }
    })

    return NextResponse.json({
      measures: measuresWithPerformance,
      year,
      specialty,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error("Error fetching quality measures:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("quality_measure_tracking")
      .insert({
        measure_id: body.measure_id,
        patient_id: body.patient_id,
        encounter_id: body.encounter_id,
        performance_year: body.performance_year || new Date().getFullYear(),
        performance_quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        numerator_eligible: body.numerator_eligible,
        denominator_eligible: body.denominator_eligible,
        excluded: body.excluded || false,
        exclusion_reason: body.exclusion_reason,
        data_completeness_met: true,
        recorded_by: body.recorded_by,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const err = error as Error
    console.error("Error recording quality measure:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
