import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

const VALID_STATUSES = new Set(["pending", "in_progress", "completed", "overdue"])

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const taskId = params.id

    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from("workflow_tasks")
      .update(updates)
      .eq("id", taskId)
      .select("id, assigned_to")
      .single()

    if (error || !task) {
      console.error("[workflow] status update failed", error)
      return NextResponse.json({ error: "Failed to update task status" }, { status: 500 })
    }

    if (task.assigned_to) {
      await supabase.from("staff_activity_log").insert({
        staff_id: task.assigned_to,
        action: "workflow_task_status_updated",
        resource_type: "workflow_task",
        resource_id: task.id,
        details: { status },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[workflow] status error", error)
    return NextResponse.json({ error: "Failed to update task status" }, { status: 500 })
  }
}
