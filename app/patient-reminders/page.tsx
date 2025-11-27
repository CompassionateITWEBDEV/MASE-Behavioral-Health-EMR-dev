"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  FileText,
} from "lucide-react"

interface ReminderTemplate {
  id: string
  name: string
  type: "appointment" | "counseling" | "balance" | "medication" | "custom"
  channel: "email" | "sms" | "both"
  subject: string
  message: string
  timing: string
  isActive: boolean
}

interface SentReminder {
  id: string
  patientName: string
  patientId: string
  type: string
  channel: string
  sentAt: string
  status: "delivered" | "failed" | "pending"
  message: string
}

interface PendingReminder {
  id: string
  patientName: string
  patientId: string
  type: string
  reason: string
  scheduledFor: string
  channel: string
}

export default function PatientRemindersPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [templates, setTemplates] = useState<ReminderTemplate[]>([
    {
      id: "1",
      name: "Appointment Reminder - 24 Hours",
      type: "appointment",
      channel: "both",
      subject: "Appointment Reminder",
      message:
        "Hi {patient_name}, this is a reminder that you have an appointment scheduled for {appointment_date} at {appointment_time}. Please arrive 10 minutes early. Reply CONFIRM to confirm or call us to reschedule.",
      timing: "24 hours before",
      isActive: true,
    },
    {
      id: "2",
      name: "Appointment Reminder - 2 Hours",
      type: "appointment",
      channel: "sms",
      subject: "Appointment Today",
      message: "Reminder: Your appointment is today at {appointment_time}. See you soon!",
      timing: "2 hours before",
      isActive: true,
    },
    {
      id: "3",
      name: "Missed Counseling Session",
      type: "counseling",
      channel: "both",
      subject: "Missed Counseling Session - Action Required",
      message:
        "Hi {patient_name}, we noticed you missed your counseling session on {session_date}. Counseling is an important part of your treatment plan. Please call us at {clinic_phone} to reschedule as soon as possible. Your care team is here to support you.",
      timing: "Same day",
      isActive: true,
    },
    {
      id: "4",
      name: "Balance Due Reminder",
      type: "balance",
      channel: "email",
      subject: "Account Balance Reminder",
      message:
        "Hi {patient_name}, this is a friendly reminder that you have an outstanding balance of ${balance_amount}. Please contact our billing department or make a payment through your patient portal. Thank you for your attention to this matter.",
      timing: "7 days overdue",
      isActive: true,
    },
    {
      id: "5",
      name: "Balance Past Due",
      type: "balance",
      channel: "both",
      subject: "Account Past Due - Action Required",
      message:
        "Hi {patient_name}, your account balance of ${balance_amount} is now {days_overdue} days past due. Please contact us to discuss payment options. We want to help you stay current with your account.",
      timing: "30 days overdue",
      isActive: true,
    },
  ])

  const [sentReminders, setSentReminders] = useState<SentReminder[]>([
    {
      id: "1",
      patientName: "Sarah Johnson",
      patientId: "PT-2024-001",
      type: "Appointment Reminder",
      channel: "SMS + Email",
      sentAt: "2025-01-17 08:00 AM",
      status: "delivered",
      message: "Appointment reminder for Jan 18 at 10:00 AM",
    },
    {
      id: "2",
      patientName: "Michael Chen",
      patientId: "PT-2024-002",
      type: "Missed Counseling",
      channel: "Email",
      sentAt: "2025-01-16 05:30 PM",
      status: "delivered",
      message: "Missed counseling session notification",
    },
    {
      id: "3",
      patientName: "Emily Davis",
      patientId: "PT-2024-003",
      type: "Balance Due",
      channel: "SMS",
      sentAt: "2025-01-16 09:00 AM",
      status: "failed",
      message: "Balance reminder - $150.00 due",
    },
    {
      id: "4",
      patientName: "Robert Wilson",
      patientId: "PT-2024-004",
      type: "Appointment Reminder",
      channel: "SMS",
      sentAt: "2025-01-17 10:00 AM",
      status: "pending",
      message: "Appointment reminder for Jan 18 at 2:00 PM",
    },
  ])

  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([
    {
      id: "1",
      patientName: "Sarah Johnson",
      patientId: "PT-2024-001",
      type: "Appointment",
      reason: "Counseling session tomorrow",
      scheduledFor: "2025-01-18 08:00 AM",
      channel: "SMS + Email",
    },
    {
      id: "2",
      patientName: "James Brown",
      patientId: "PT-2024-005",
      type: "Balance Due",
      reason: "Account 14 days overdue - $275.00",
      scheduledFor: "2025-01-18 09:00 AM",
      channel: "Email",
    },
    {
      id: "3",
      patientName: "Lisa Anderson",
      patientId: "PT-2024-006",
      type: "Missed Counseling",
      reason: "Missed session on Jan 15",
      scheduledFor: "2025-01-17 02:00 PM",
      channel: "SMS + Email",
    },
  ])

  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [showSendReminder, setShowSendReminder] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<ReminderTemplate>>({
    type: "appointment",
    channel: "both",
    isActive: true,
  })

  const [settings, setSettings] = useState({
    autoAppointmentReminders: true,
    appointmentReminderTiming: "24",
    autoMissedCounseling: true,
    missedCounselingDelay: "4",
    autoBalanceReminders: true,
    balanceReminderThreshold: "50",
    smsEnabled: true,
    emailEnabled: true,
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
  })

  const stats = {
    totalSent: 1247,
    delivered: 1198,
    failed: 49,
    pending: 23,
    appointmentReminders: 856,
    missedCounseling: 234,
    balanceReminders: 157,
  }

  const handleSaveTemplate = () => {
    if (newTemplate.name && newTemplate.message) {
      setTemplates([
        ...templates,
        {
          ...newTemplate,
          id: Date.now().toString(),
        } as ReminderTemplate,
      ])
      setShowNewTemplate(false)
      setNewTemplate({ type: "appointment", channel: "both", isActive: true })
    }
  }

  const handleToggleTemplate = (id: string) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)))
  }

  const handleResendReminder = (id: string) => {
    setSentReminders(
      sentReminders.map((r) =>
        r.id === id ? { ...r, status: "pending" as const, sentAt: new Date().toLocaleString() } : r,
      ),
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1e293b" }}>
                Patient Reminders
              </h1>
              <p style={{ color: "#64748b" }}>
                Manage appointment reminders, missed session alerts, and balance notifications
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showSendReminder} onOpenChange={setShowSendReminder}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Manual Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Send Manual Reminder</DialogTitle>
                    <DialogDescription>Send a one-time reminder to a specific patient</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Patient</Label>
                      <Input placeholder="Search by name or patient ID..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Reminder Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">Appointment Reminder</SelectItem>
                          <SelectItem value="counseling">Missed Counseling</SelectItem>
                          <SelectItem value="balance">Balance Due</SelectItem>
                          <SelectItem value="custom">Custom Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select defaultValue="both">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Only</SelectItem>
                          <SelectItem value="sms">SMS Only</SelectItem>
                          <SelectItem value="both">Email + SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea rows={4} placeholder="Enter custom message or use template..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSendReminder(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowSendReminder(false)}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                      Total Sent (This Month)
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      {stats.totalSent}
                    </p>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#e0f2fe" }}
                  >
                    <Send className="h-6 w-6" style={{ color: "#0284c7" }} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs" style={{ color: "#16a34a", borderColor: "#16a34a" }}>
                    {stats.delivered} delivered
                  </Badge>
                  <Badge variant="outline" className="text-xs" style={{ color: "#dc2626", borderColor: "#dc2626" }}>
                    {stats.failed} failed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                      Appointment Reminders
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      {stats.appointmentReminders}
                    </p>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    <Calendar className="h-6 w-6" style={{ color: "#16a34a" }} />
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                  96% confirmation rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                      Missed Counseling Alerts
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      {stats.missedCounseling}
                    </p>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#fef3c7" }}
                  >
                    <AlertTriangle className="h-6 w-6" style={{ color: "#d97706" }} />
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                  78% rescheduled within 48hrs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                      Balance Reminders
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#1e293b" }}>
                      {stats.balanceReminders}
                    </p>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#fce7f3" }}
                  >
                    <DollarSign className="h-6 w-6" style={{ color: "#db2777" }} />
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                  $12,450 collected this month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <Bell className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Clock className="mr-2 h-4 w-4" />
                Pending ({pendingReminders.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileText className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="templates">
                <MessageSquare className="mr-2 h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Upcoming Reminders
                    </CardTitle>
                    <CardDescription>Reminders scheduled to send soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingReminders.slice(0, 5).map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: "#f1f5f9" }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  reminder.type === "Appointment"
                                    ? "#dcfce7"
                                    : reminder.type === "Balance Due"
                                      ? "#fce7f3"
                                      : "#fef3c7",
                              }}
                            >
                              {reminder.type === "Appointment" ? (
                                <Calendar className="h-5 w-5" style={{ color: "#16a34a" }} />
                              ) : reminder.type === "Balance Due" ? (
                                <DollarSign className="h-5 w-5" style={{ color: "#db2777" }} />
                              ) : (
                                <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: "#1e293b" }}>
                                {reminder.patientName}
                              </p>
                              <p className="text-sm" style={{ color: "#64748b" }}>
                                {reminder.reason}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{reminder.channel}</Badge>
                            <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                              {reminder.scheduledFor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />
                      Requires Attention
                    </CardTitle>
                    <CardDescription>Failed deliveries and issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sentReminders
                        .filter((r) => r.status === "failed")
                        .map((reminder) => (
                          <div
                            key={reminder.id}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: "#fef2f2" }}
                          >
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5" style={{ color: "#dc2626" }} />
                              <div>
                                <p className="font-medium" style={{ color: "#1e293b" }}>
                                  {reminder.patientName}
                                </p>
                                <p className="text-sm" style={{ color: "#64748b" }}>
                                  {reminder.type} - {reminder.channel}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleResendReminder(reminder.id)}>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Retry
                            </Button>
                          </div>
                        ))}
                      {sentReminders.filter((r) => r.status === "failed").length === 0 && (
                        <div className="text-center py-8" style={{ color: "#64748b" }}>
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No failed deliveries</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Reminders</CardTitle>
                      <CardDescription>Reminders scheduled to be sent</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Search patients..." className="w-64" />
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Scheduled For</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{reminder.patientName}</p>
                              <p className="text-sm" style={{ color: "#64748b" }}>
                                {reminder.patientId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                color:
                                  reminder.type === "Appointment"
                                    ? "#16a34a"
                                    : reminder.type === "Balance Due"
                                      ? "#db2777"
                                      : "#d97706",
                                borderColor:
                                  reminder.type === "Appointment"
                                    ? "#16a34a"
                                    : reminder.type === "Balance Due"
                                      ? "#db2777"
                                      : "#d97706",
                              }}
                            >
                              {reminder.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{reminder.reason}</TableCell>
                          <TableCell>{reminder.scheduledFor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {reminder.channel.includes("Email") && (
                                <Mail className="h-4 w-4" style={{ color: "#64748b" }} />
                              )}
                              {reminder.channel.includes("SMS") && (
                                <MessageSquare className="h-4 w-4" style={{ color: "#64748b" }} />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Send className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reminder History</CardTitle>
                      <CardDescription>All sent reminders and their delivery status</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Search..." className="w-64" />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="appointment">Appointments</SelectItem>
                          <SelectItem value="counseling">Missed Counseling</SelectItem>
                          <SelectItem value="balance">Balance Due</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentReminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{reminder.patientName}</p>
                              <p className="text-sm" style={{ color: "#64748b" }}>
                                {reminder.patientId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{reminder.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {reminder.channel.includes("Email") && <Mail className="h-4 w-4" />}
                              {reminder.channel.includes("SMS") && <MessageSquare className="h-4 w-4" />}
                              <span className="text-sm">{reminder.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{reminder.message}</TableCell>
                          <TableCell>{reminder.sentAt}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reminder.status === "delivered"
                                  ? "default"
                                  : reminder.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {reminder.status === "delivered" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {reminder.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                              {reminder.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                              {reminder.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reminder.status === "failed" && (
                              <Button size="sm" variant="outline" onClick={() => handleResendReminder(reminder.id)}>
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reminder Templates</CardTitle>
                      <CardDescription>Manage automated reminder messages</CardDescription>
                    </div>
                    <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Reminder Template</DialogTitle>
                          <DialogDescription>Create a new automated reminder template</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Template Name</Label>
                              <Input
                                value={newTemplate.name || ""}
                                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                placeholder="e.g., Appointment Reminder - 1 Week"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={newTemplate.type}
                                onValueChange={(value: any) => setNewTemplate({ ...newTemplate, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="appointment">Appointment Reminder</SelectItem>
                                  <SelectItem value="counseling">Missed Counseling</SelectItem>
                                  <SelectItem value="balance">Balance Due</SelectItem>
                                  <SelectItem value="medication">Medication Reminder</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Channel</Label>
                              <Select
                                value={newTemplate.channel}
                                onValueChange={(value: any) => setNewTemplate({ ...newTemplate, channel: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email Only</SelectItem>
                                  <SelectItem value="sms">SMS Only</SelectItem>
                                  <SelectItem value="both">Email + SMS</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Timing</Label>
                              <Input
                                value={newTemplate.timing || ""}
                                onChange={(e) => setNewTemplate({ ...newTemplate, timing: e.target.value })}
                                placeholder="e.g., 24 hours before"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Subject (for email)</Label>
                            <Input
                              value={newTemplate.subject || ""}
                              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                              placeholder="Email subject line"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                              value={newTemplate.message || ""}
                              onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                              rows={4}
                              placeholder="Use variables: {patient_name}, {appointment_date}, {appointment_time}, {clinic_phone}, {balance_amount}"
                            />
                            <p className="text-xs" style={{ color: "#64748b" }}>
                              Available variables: {"{patient_name}"}, {"{appointment_date}"}, {"{appointment_time}"},{" "}
                              {"{clinic_phone}"}, {"{balance_amount}"}, {"{session_date}"}, {"{days_overdue}"}
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveTemplate}>Save Template</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border"
                        style={{ backgroundColor: template.isActive ? "#ffffff" : "#f8fafc" }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium" style={{ color: "#1e293b" }}>
                                {template.name}
                              </h4>
                              <Badge variant="outline">{template.type}</Badge>
                              <Badge variant="secondary">
                                {template.channel === "both" ? "Email + SMS" : template.channel.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{template.timing}</Badge>
                            </div>
                            <p className="text-sm mb-2" style={{ color: "#64748b" }}>
                              <strong>Subject:</strong> {template.subject}
                            </p>
                            <p className="text-sm" style={{ color: "#64748b" }}>
                              {template.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Active</Label>
                              <Switch
                                checked={template.isActive}
                                onCheckedChange={() => handleToggleTemplate(template.id)}
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Automation Settings</CardTitle>
                    <CardDescription>Configure automatic reminder triggers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto Appointment Reminders</p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          Automatically send reminders before appointments
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoAppointmentReminders}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoAppointmentReminders: checked })}
                      />
                    </div>
                    {settings.autoAppointmentReminders && (
                      <div className="ml-4 space-y-2">
                        <Label>Send reminder</Label>
                        <Select
                          value={settings.appointmentReminderTiming}
                          onValueChange={(value) => setSettings({ ...settings, appointmentReminderTiming: value })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 hours before</SelectItem>
                            <SelectItem value="24">24 hours before</SelectItem>
                            <SelectItem value="48">48 hours before</SelectItem>
                            <SelectItem value="168">1 week before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto Missed Counseling Alerts</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>
                            Notify patients when they miss counseling sessions
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoMissedCounseling}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoMissedCounseling: checked })}
                        />
                      </div>
                      {settings.autoMissedCounseling && (
                        <div className="ml-4 mt-4 space-y-2">
                          <Label>Send alert after</Label>
                          <Select
                            value={settings.missedCounselingDelay}
                            onValueChange={(value) => setSettings({ ...settings, missedCounselingDelay: value })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                              <SelectItem value="24">Same day (end of day)</SelectItem>
                              <SelectItem value="48">Next day</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto Balance Reminders</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>
                            Send reminders for outstanding balances
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoBalanceReminders}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoBalanceReminders: checked })}
                        />
                      </div>
                      {settings.autoBalanceReminders && (
                        <div className="ml-4 mt-4 space-y-2">
                          <Label>Minimum balance to trigger reminder</Label>
                          <div className="flex items-center gap-2">
                            <span>$</span>
                            <Input
                              type="number"
                              value={settings.balanceReminderThreshold}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  balanceReminderThreshold: e.target.value,
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Settings</CardTitle>
                    <CardDescription>Configure how reminders are sent</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5" style={{ color: "#64748b" }} />
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>
                            Send text message reminders
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" style={{ color: "#64748b" }} />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>
                            Send email reminders
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <p className="font-medium mb-4">Quiet Hours</p>
                      <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                        Do not send notifications during these hours
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start</Label>
                          <Input
                            type="time"
                            value={settings.quietHoursStart}
                            onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End</Label>
                          <Input
                            type="time"
                            value={settings.quietHoursEnd}
                            onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
