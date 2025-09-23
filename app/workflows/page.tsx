"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"
import { useAuth } from "@/lib/auth/rbac-hooks"
import { RoleGuard } from "@/components/auth/role-guard"
import { PERMISSIONS } from "@/lib/auth/roles"

interface WorkflowTask {
  id: string
  title: string
  description: string
  assigned_to: string
  assigned_to_name: string
  due_date: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "overdue"
  workflow_type: string
  patient_id?: string
  patient_name?: string
  created_at: string
  completed_at?: string
  notes?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  type: "patient_intake" | "medication_review" | "compliance_check" | "assessment" | "custom"
  steps: WorkflowStep[]
  is_active: boolean
  created_by: string
  created_at: string
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  role_required: string
  estimated_duration: number
  is_required: boolean
  order: number
}

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState("tasks")
  const [tasks, setTasks] = useState<WorkflowTask[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false)
  const { user, hasPermission } = useAuth()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium" as const,
    workflow_type: "",
    patient_id: "",
  })

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    type: "custom" as const,
    steps: [] as Omit<WorkflowStep, "id">[],
  })

  useEffect(() => {
    loadTasks()
    loadWorkflows()
  }, [])

  const loadTasks = async () => {
    // Mock data - replace with actual API call
    setTasks([
      {
        id: "task-001",
        title: "Complete Patient Intake Assessment",
        description: "New patient Sarah Johnson requires initial intake assessment and documentation",
        assigned_to: "staff-001",
        assigned_to_name: "Dr. Smith",
        due_date: "2024-01-18T17:00:00Z",
        priority: "high",
        status: "pending",
        workflow_type: "patient_intake",
        patient_id: "pt-001",
        patient_name: "Sarah Johnson",
        created_at: "2024-01-17T08:00:00Z",
      },
      {
        id: "task-002",
        title: "Medication Reconciliation Review",
        description: "Review and reconcile medications for patient Michael Chen after hospital discharge",
        assigned_to: "staff-002",
        assigned_to_name: "Nurse Wilson",
        due_date: "2024-01-17T15:00:00Z",
        priority: "urgent",
        status: "in_progress",
        workflow_type: "medication_review",
        patient_id: "pt-002",
        patient_name: "Michael Chen",
        created_at: "2024-01-17T09:00:00Z",
      },
      {
        id: "task-003",
        title: "Monthly Compliance Check",
        description: "Conduct monthly compliance review for take-home medication program",
        assigned_to: "staff-003",
        assigned_to_name: "Counselor Davis",
        due_date: "2024-01-19T12:00:00Z",
        priority: "medium",
        status: "pending",
        workflow_type: "compliance_check",
        created_at: "2024-01-17T10:00:00Z",
      },
      {
        id: "task-004",
        title: "ASAM Assessment Update",
        description: "Complete 6-month ASAM criteria reassessment for David Wilson",
        assigned_to: "staff-001",
        assigned_to_name: "Dr. Smith",
        due_date: "2024-01-16T16:00:00Z",
        priority: "high",
        status: "overdue",
        workflow_type: "assessment",
        patient_id: "pt-003",
        patient_name: "David Wilson",
        created_at: "2024-01-15T08:00:00Z",
      },
    ])
  }

  const loadWorkflows = async () => {
    // Mock data - replace with actual API call
    setWorkflows([
      {
        id: "wf-001",
        name: "New Patient Intake",
        description: "Complete workflow for new patient onboarding and assessment",
        type: "patient_intake",
        steps: [
          {
            id: "step-001",
            title: "Initial Screening",
            description: "Conduct initial screening and eligibility assessment",
            role_required: "intake",
            estimated_duration: 30,
            is_required: true,
            order: 1,
          },
          {
            id: "step-002",
            title: "Medical Assessment",
            description: "Complete medical history and physical examination",
            role_required: "doctor",
            estimated_duration: 45,
            is_required: true,
            order: 2,
          },
          {
            id: "step-003",
            title: "ASAM Assessment",
            description: "Complete ASAM criteria assessment",
            role_required: "counselor",
            estimated_duration: 60,
            is_required: true,
            order: 3,
          },
        ],
        is_active: true,
        created_by: "admin-001",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "wf-002",
        name: "Medication Review Process",
        description: "Systematic medication review and reconciliation workflow",
        type: "medication_review",
        steps: [
          {
            id: "step-004",
            title: "Medication History Review",
            description: "Review current medications and identify discrepancies",
            role_required: "rn",
            estimated_duration: 20,
            is_required: true,
            order: 1,
          },
          {
            id: "step-005",
            title: "Drug Interaction Check",
            description: "Check for drug interactions and contraindications",
            role_required: "doctor",
            estimated_duration: 15,
            is_required: true,
            order: 2,
          },
          {
            id: "step-006",
            title: "Patient Education",
            description: "Educate patient on medication changes",
            role_required: "rn",
            estimated_duration: 25,
            is_required: false,
            order: 3,
          },
        ],
        is_active: true,
        created_by: "admin-001",
        created_at: "2024-01-01T00:00:00Z",
      },
    ])
  }

  const handleCreateTask = async () => {
    if (!hasPermission(PERMISSIONS.STAFF_WRITE)) {
      alert("You don't have permission to create tasks")
      return
    }

    try {
      const response = await fetch("/api/workflow-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          created_by: user?.id,
        }),
      })

      if (response.ok) {
        loadTasks()
        setShowNewTaskDialog(false)
        setNewTask({
          title: "",
          description: "",
          assigned_to: "",
          due_date: "",
          priority: "medium",
          workflow_type: "",
          patient_id: "",
        })
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: WorkflowTask["status"]) => {
    try {
      const response = await fetch(`/api/workflow-tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        loadTasks()
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const getPriorityColor = (priority: WorkflowTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityBadgeVariant = (priority: WorkflowTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "outline"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: WorkflowTask["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in_progress":
        return <Play className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusBadgeVariant = (status: WorkflowTask["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "my-tasks") {
      return task.assigned_to === user?.id
    }
    if (activeTab === "overdue") {
      return task.status === "overdue"
    }
    if (activeTab === "completed") {
      return task.status === "completed"
    }
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Workflows</h1>
          <p className="text-muted-foreground">Manage tasks, workflows, and staff assignments</p>
        </div>
        <div className="flex gap-2">
          <RoleGuard requiredPermissions={[PERMISSIONS.STAFF_WRITE]}>
            <Dialog open={showNewWorkflowDialog} onOpenChange={setShowNewWorkflowDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>Create a new workflow template for staff tasks</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Workflow creation interface would include step definition, role assignments, and automation rules.
                  </p>
                  <Button onClick={() => setShowNewWorkflowDialog(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Assign a new task to a staff member</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the task requirements..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assigned-to">Assign To</Label>
                      <Select
                        value={newTask.assigned_to}
                        onValueChange={(value) => setNewTask((prev) => ({ ...prev, assigned_to: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff-001">Dr. Smith</SelectItem>
                          <SelectItem value="staff-002">Nurse Wilson</SelectItem>
                          <SelectItem value="staff-003">Counselor Davis</SelectItem>
                          <SelectItem value="staff-004">Intake Coordinator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="datetime-local"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="workflow-type">Workflow Type</Label>
                      <Select
                        value={newTask.workflow_type}
                        onValueChange={(value) => setNewTask((prev) => ({ ...prev, workflow_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient_intake">Patient Intake</SelectItem>
                          <SelectItem value="medication_review">Medication Review</SelectItem>
                          <SelectItem value="compliance_check">Compliance Check</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="patient">Patient (Optional)</Label>
                    <Select
                      value={newTask.patient_id}
                      onValueChange={(value) => setNewTask((prev) => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No patient</SelectItem>
                        <SelectItem value="pt-001">Sarah Johnson</SelectItem>
                        <SelectItem value="pt-002">Michael Chen</SelectItem>
                        <SelectItem value="pt-003">David Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateTask} className="w-full">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </RoleGuard>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {activeTab !== "workflows" ? (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className={task.status === "overdue" ? "border-red-200 bg-red-50" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          {task.title}
                        </CardTitle>
                        <CardDescription>
                          <User className="w-4 h-4 inline mr-1" />
                          Assigned to {task.assigned_to_name}
                          {task.patient_name && ` • Patient: ${task.patient_name}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)} className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{task.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(task.due_date).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Type: {task.workflow_type.replace("_", " ")}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {task.notes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1">Notes</div>
                          <div className="text-sm text-muted-foreground">{task.notes}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {task.status === "pending" && (
                          <Button size="sm" onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Task
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateTaskStatus(task.id, "completed")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, "pending")}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                          </>
                        )}
                        {task.status === "overdue" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTasks.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No tasks found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {workflow.name}
                        </CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{workflow.type.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Workflow Steps</div>
                        <div className="space-y-2">
                          {workflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                {step.order}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{step.title}</div>
                                <div className="text-sm text-muted-foreground">{step.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Role: {step.role_required} • Duration: {step.estimated_duration}min
                                  {step.is_required && " • Required"}
                                </div>
                              </div>
                              {index < workflow.steps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(workflow.created_at).toLocaleDateString()} • {workflow.steps.length} steps
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
