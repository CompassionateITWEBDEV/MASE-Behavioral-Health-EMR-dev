import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

interface WorkflowTaskPayload {
  title: string
  description?: string
  assigned_to?: string
  due_date?: string
  priority?: "low" | "medium" | "high" | "urgent"
  workflow_type?: string
  patient_id?: string
  created_by?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assigned_to")

    let query = supabase
      .from("workflow_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (status) {
      query = query.eq("status", status)
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error("[workflow] task fetch failed", error)
      return NextResponse.json({ error: "Failed to load workflow tasks" }, { status: 500 })
    }

    const staffIds = Array.from(
      new Set((tasks ?? []).flatMap((task: any) => [task.assigned_to, task.created_by]).filter(Boolean)),
    )
    const patientIds = Array.from(new Set((tasks ?? []).map((task: any) => task.patient_id).filter(Boolean)))

    const staffNames = await loadStaffNames(supabase, staffIds)
    const patientNames = await loadPatientNames(supabase, patientIds)

    const response = (tasks ?? []).map((task: any) => ({
      ...task,
      assigned_to_name: task.assigned_to ? staffNames.get(task.assigned_to) ?? "Unassigned" : "Unassigned",
      created_by_name: task.created_by ? staffNames.get(task.created_by) ?? "System" : "System",
      patient_name: task.patient_id ? patientNames.get(task.patient_id) ?? "Unknown patient" : null,
    }))

    return NextResponse.json({ tasks: response })
  } catch (error) {
    console.error("[workflow] list error", error)
    return NextResponse.json({ error: "Failed to load workflow tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkflowTaskPayload
    if (!body.title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const payload = {
      ...body,
      status: "pending",
      priority: body.priority ?? "medium",
    }

    const { data: task, error } = await supabase
      .from("workflow_tasks")
      .insert(payload)
      .select("*")
      .single()

    if (error || !task) {
      console.error("[workflow] task insert failed", error)
      return NextResponse.json({ error: "Failed to create workflow task" }, { status: 500 })
    }

    if (body.created_by) {
      await supabase.from("staff_activity_log").insert({
        staff_id: body.created_by,
        action: "workflow_task_created",
        resource_type: "workflow_task",
        resource_id: task.id,
        details: {
          assigned_to: body.assigned_to ?? null,
          patient_id: body.patient_id ?? null,
        },
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("[workflow] create error", error)
    return NextResponse.json({ error: "Failed to create workflow task" }, { status: 500 })
  }
}

async function loadStaffNames(supabase: any, staffIds: any[]) {
  const names = new Map<any, string>()
  if (staffIds.length === 0) {
    return names
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("id, first_name, last_name, employee_id")
    .in("id", staffIds)

  for (const member of staff ?? []) {
    const label = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || member.employee_id
    if (label) {
      names.set(member.id, label)
    }
  }

  return names
}

async function loadPatientNames(supabase: any, patientIds: any[]) {
  const names = new Map<any, string>()
  if (patientIds.length === 0) {
    return names
  }

  const { data: patients } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .in("id", patientIds)

  for (const patient of patients ?? []) {
    names.set(patient.id, `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim())
  }

  return names
}
