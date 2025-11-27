import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Fetch staff with their training data
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id, first_name, last_name, role, department, hire_date, is_active")
      .eq("is_active", true)
      .order("last_name")

    if (staffError) throw staffError

    // Training modules with requirements
    const trainingModules = [
      {
        id: "hipaa",
        name: "HIPAA Compliance",
        description: "Privacy and security of protected health information",
        duration: "2 hours",
        required: true,
        frequency: "annual",
        category: "compliance",
      },
      {
        id: "patient-safety",
        name: "Patient Safety Fundamentals",
        description: "Core patient safety principles and practices",
        duration: "1.5 hours",
        required: true,
        frequency: "annual",
        category: "clinical",
      },
      {
        id: "documentation",
        name: "Clinical Documentation Standards",
        description: "Joint Commission documentation requirements",
        duration: "2 hours",
        required: true,
        frequency: "annual",
        category: "documentation",
      },
      {
        id: "dea-regulations",
        name: "DEA Regulations for OTPs",
        description: "Controlled substance handling and compliance",
        duration: "3 hours",
        required: true,
        frequency: "annual",
        category: "compliance",
      },
      {
        id: "joint-commission",
        name: "Joint Commission Standards",
        description: "Accreditation standards and survey preparation",
        duration: "4 hours",
        required: true,
        frequency: "annual",
        category: "compliance",
      },
      {
        id: "suicide-prevention",
        name: "Suicide Risk Assessment",
        description: "Columbia Protocol and risk assessment tools",
        duration: "2 hours",
        required: true,
        frequency: "annual",
        category: "clinical",
      },
      {
        id: "mat-best-practices",
        name: "MAT Best Practices",
        description: "Medication-assisted treatment protocols",
        duration: "3 hours",
        required: true,
        frequency: "annual",
        category: "clinical",
      },
      {
        id: "emergency-response",
        name: "Emergency Response",
        description: "Overdose response and Narcan administration",
        duration: "1 hour",
        required: true,
        frequency: "biannual",
        category: "safety",
      },
    ]

    // Generate completion status for each staff member
    const staffWithTraining =
      staff?.map((member) => {
        const completedModules = trainingModules.map((module) => ({
          ...module,
          completed: Math.random() > 0.2, // Simulate completion status
          completedDate:
            Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : null,
          dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        }))

        const completionRate = Math.round(
          (completedModules.filter((m) => m.completed).length / completedModules.length) * 100,
        )

        return {
          ...member,
          training: completedModules,
          completionRate,
          overdue: completedModules.filter((m) => !m.completed && new Date(m.dueDate) < new Date()).length,
        }
      }) || []

    // Calculate overall statistics
    const stats = {
      totalStaff: staffWithTraining.length,
      averageCompletion:
        Math.round(staffWithTraining.reduce((sum, s) => sum + s.completionRate, 0) / staffWithTraining.length) || 0,
      overdueCount: staffWithTraining.reduce((sum, s) => sum + s.overdue, 0),
      fullyCompliant: staffWithTraining.filter((s) => s.completionRate === 100).length,
    }

    return NextResponse.json({
      staff: staffWithTraining,
      modules: trainingModules,
      stats,
    })
  } catch (error) {
    console.error("Staff education fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch staff education data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { staffId, moduleId, completed } = await req.json()
    const supabase = createServiceClient()

    // Log training completion to audit trail
    await supabase.from("audit_trail").insert({
      action_type: "training_completion",
      table_name: "staff",
      record_id: staffId,
      changes: {
        moduleId,
        completed,
        completedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Training update error:", error)
    return NextResponse.json({ error: "Failed to update training status" }, { status: 500 })
  }
}
