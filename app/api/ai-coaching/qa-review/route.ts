import { generateObject } from "ai"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"

const documentQASchema = z.object({
  overallScore: z.number().min(0).max(100),
  complianceLevel: z.enum(["excellent", "good", "needs_improvement", "critical"]),
  findings: z.array(
    z.object({
      category: z.string(),
      issue: z.string(),
      severity: z.enum(["info", "warning", "error"]),
      recommendation: z.string(),
      jointCommissionStandard: z.string().optional(),
    }),
  ),
  summary: z.string(),
  actionItems: z.array(z.string()),
})

export async function POST(req: Request) {
  try {
    const { documentType, documentContent, patientId } = await req.json()

    const supabase = createServiceClient()

    // Fetch patient context if provided
    let patientContext = ""
    if (patientId) {
      const { data: patient } = await supabase
        .from("patients")
        .select("first_name, last_name, diagnosis")
        .eq("id", patientId)
        .single()

      if (patient) {
        patientContext = `Patient: ${patient.first_name} ${patient.last_name}, Diagnosis: ${patient.diagnosis || "Not specified"}`
      }
    }

    const prompt = `You are a Joint Commission compliance expert reviewing clinical documentation for a behavioral health OTP (Opioid Treatment Program).

Document Type: ${documentType}
${patientContext ? `Context: ${patientContext}` : ""}

Document Content:
${documentContent || "No content provided - provide general guidance for this document type"}

Review this documentation against Joint Commission standards and provide:
1. An overall compliance score (0-100)
2. Specific findings with categories, issues, severity, and recommendations
3. Reference relevant Joint Commission standards (e.g., PC.01.01.01, MM.06.01.01)
4. Actionable items for improvement

Key standards to check:
- PC.01.01.01: Patient Rights
- PC.02.01.21: Pain Assessment  
- PC.03.05.01: Safe Medication Practices
- MM.06.01.01: Medication Storage
- HR.01.02.01: Staff Competency
- PI.01.01.01: Quality Program
- RI.01.01.01: Patient Safety`

    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: documentQASchema,
      prompt,
    })

    // Log the QA review to audit trail
    await supabase.from("audit_trail").insert({
      action_type: "documentation_qa_review",
      table_name: "progress_notes",
      record_id: patientId || "general",
      changes: {
        documentType,
        score: object.overallScore,
        complianceLevel: object.complianceLevel,
        findingsCount: object.findings.length,
      },
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("QA Review error:", error)
    return NextResponse.json({ error: "Failed to perform QA review" }, { status: 500 })
  }
}
