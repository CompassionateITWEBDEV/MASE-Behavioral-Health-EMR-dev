"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Ligature as Signature,
  Eye,
  Target,
} from "lucide-react"

// Mock data for work queue items
const workQueueItems = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    patientId: "P001",
    taskType: "assessment_due",
    taskDescription: "PHQ-9 Depression Assessment Due",
    priority: "high",
    dueDate: "2024-01-15",
    status: "overdue",
    documentType: "Assessment",
    lastUpdated: "2024-01-10T10:30:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 5,
  },
  {
    id: 2,
    patientName: "Michael Chen",
    patientId: "P002",
    taskType: "signature_needed",
    taskDescription: "Treatment Plan Requires Signature",
    priority: "urgent",
    dueDate: "2024-01-16",
    status: "pending",
    documentType: "Treatment Plan",
    lastUpdated: "2024-01-14T14:20:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 2,
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    patientId: "P003",
    taskType: "review_required",
    taskDescription: "COWS Assessment Needs Review",
    priority: "medium",
    dueDate: "2024-01-17",
    status: "in_progress",
    documentType: "Assessment",
    lastUpdated: "2024-01-15T09:15:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 10,
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientId: "P004",
    taskType: "assessment_due",
    taskDescription: "C-SSRS Suicide Risk Assessment Due",
    priority: "urgent",
    dueDate: "2024-01-16",
    status: "pending",
    documentType: "Assessment",
    lastUpdated: "2024-01-15T11:45:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 15,
  },
  {
    id: 5,
    patientName: "Lisa Thompson",
    patientId: "P005",
    taskType: "signature_needed",
    taskDescription: "Consent Form Requires Signature",
    priority: "medium",
    dueDate: "2024-01-18",
    status: "pending",
    documentType: "Consent Form",
    lastUpdated: "2024-01-15T16:30:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 1,
  },
  {
    id: 6,
    patientName: "Robert Garcia",
    patientId: "P006",
    taskType: "review_required",
    taskDescription: "Progress Note Needs Supervisory Review",
    priority: "low",
    dueDate: "2024-01-20",
    status: "pending",
    documentType: "Progress Note",
    lastUpdated: "2024-01-15T13:20:00Z",
    assignedTo: "Dr. Smith",
    estimatedTime: 5,
  },
]

const completedItems = [
  {
    id: 7,
    patientName: "Jennifer Lee",
    patientId: "P007",
    taskType: "assessment_completed",
    taskDescription: "GAD-7 Anxiety Assessment Completed",
    priority: "medium",
    completedDate: "2024-01-15",
    status: "completed",
    documentType: "Assessment",
    completedBy: "Dr. Smith",
    score: "12 (Moderate Anxiety)",
  },
  {
    id: 8,
    patientName: "Mark Davis",
    patientId: "P008",
    taskType: "document_finalized",
    taskDescription: "Treatment Plan Finalized",
    priority: "high",
    completedDate: "2024-01-14",
    status: "finalized",
    documentType: "Treatment Plan",
    completedBy: "Dr. Smith",
    reviewedBy: "Dr. Johnson",
  },
]

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

const statusColors = {
  pending: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  overdue: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  finalized: "bg-gray-100 text-gray-800",
}

export function MyWorkDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")

  const pendingCount = workQueueItems.filter((item) => item.status === "pending").length
  const overdueCount = workQueueItems.filter((item) => item.status === "overdue").length
  const inProgressCount = workQueueItems.filter((item) => item.status === "in_progress").length
  const totalEstimatedTime = workQueueItems.reduce((sum, item) => sum + item.estimatedTime, 0)

  const filteredItems = workQueueItems.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = selectedPriority === "all" || item.priority === selectedPriority
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        )
      case "patient":
        return a.patientName.localeCompare(b.patientName)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimatedTime}m</div>
            <p className="text-xs text-muted-foreground">To complete all tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, patients, or documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="patient">Patient</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Work ({workQueueItems.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <Card key={item.id} className={`${item.status === "overdue" ? "border-red-200 bg-red-50" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.taskDescription}</h3>
                        <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                          {item.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>
                            {item.patientName} ({item.patientId})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{item.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{item.documentType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.taskType === "signature_needed" && (
                        <Button size="sm" variant="outline">
                          <Signature className="h-4 w-4 mr-1" />
                          Sign
                        </Button>
                      )}
                      {item.taskType === "review_required" && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {item.taskType === "assessment_due" && (
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {completedItems.map((item) => (
              <Card key={item.id} className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.taskDescription}</h3>
                        <Badge className="bg-green-100 text-green-800">{item.status.toUpperCase()}</Badge>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>
                            {item.patientName} ({item.patientId})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Completed: {new Date(item.completedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{item.documentType}</span>
                        </div>
                        {item.score && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>Score: {item.score}</span>
                          </div>
                        )}
                      </div>
                      {item.reviewedBy && (
                        <div className="text-sm text-muted-foreground">Reviewed by: {item.reviewedBy}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Print
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View your work queue organized by due dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Calendar view would be implemented here with a proper calendar component showing tasks organized by due
                dates, with color coding for priorities.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
