"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Heart,
  Calendar,
  MessageSquare,
  Phone,
  Shield,
  Brain,
  FileText,
  Send,
  AlertTriangle,
  Bell,
  DollarSign,
  CheckCircle2,
  User,
  CreditCard,
} from "lucide-react"

interface PatientInfo {
  name: string
  id: string
  program: string
  dose: string
  nextAppointment: string
  counselor: string
  counselorPhone: string
  recoveryDays: number
}

interface Notification {
  id: string
  type: "appointment" | "counseling" | "balance" | "general"
  title: string
  message: string
  date: string
  read: boolean
  actionRequired: boolean
}

const aiMessages = [
  {
    id: 1,
    type: "ai",
    message: "Hello! I'm your AI wellness assistant. How are you feeling today?",
    timestamp: "2:30 PM",
  },
]

function generateAIResponse(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase()
  if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
    return {
      message:
        "I hear you are feeling anxious. That is a common experience in recovery. Would you like me to guide you through a quick breathing exercise, or would you prefer to talk to your counselor?",
      escalate: false,
    }
  } else if (lowerMessage.includes("craving") || lowerMessage.includes("urge")) {
    return {
      message:
        "Thank you for sharing that you're experiencing cravings. This is an important time to use your coping skills. I recommend reaching out to your counselor. Would you like me to connect you?",
      escalate: true,
    }
  } else if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
    return {
      message:
        "I'm here to support you. Can you tell me more about what you're going through? If you need immediate help, I can connect you with your care team.",
      escalate: false,
    }
  }
  return {
    message:
      "Thank you for sharing. I'm here to listen and support you. Is there anything specific you'd like to talk about or any resources you need?",
    escalate: false,
  }
}

export default function PatientPortalPage() {
  const [messages, setMessages] = useState(aiMessages)
  const [newMessage, setNewMessage] = useState("")
  const [escalationRequested, setEscalationRequested] = useState(false)
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "appointment",
      title: "Upcoming Appointment",
      message: "You have an appointment tomorrow, January 18, 2024 at 10:00 AM with Dr. Smith.",
      date: "2025-01-17",
      read: false,
      actionRequired: true,
    },
    {
      id: "2",
      type: "counseling",
      title: "Missed Counseling Session",
      message: "You missed your counseling session on January 15, 2024. Please call to reschedule as soon as possible.",
      date: "2025-01-15",
      read: false,
      actionRequired: true,
    },
    {
      id: "3",
      type: "balance",
      title: "Balance Due Reminder",
      message:
        "You have an outstanding balance of $150.00. Please make a payment or contact billing to set up a payment plan.",
      date: "2025-01-10",
      read: true,
      actionRequired: true,
    },
    {
      id: "4",
      type: "general",
      title: "New Resources Available",
      message: "Check out our new meditation guides and coping strategies in the Resources section.",
      date: "2025-01-08",
      read: true,
      actionRequired: false,
    },
  ])
  const [activeTab, setActiveTab] = useState("home")

  useEffect(() => {
    const loadPatientInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/patient-portal/info")
        if (!response.ok) throw new Error("Failed to fetch patient info")
        const data = await response.json()
        setPatientInfo(data)
      } catch (err) {
        console.error("[v0] Error loading patient info:", err)
        setPatientInfo({
          name: "Sarah Johnson",
          id: "PT-2024-001",
          program: "Methadone Program",
          dose: "80mg",
          nextAppointment: "January 18, 2024 at 10:00 AM",
          counselor: "Dr. Smith",
          counselorPhone: "(555) 123-4567",
          recoveryDays: 127,
        })
      } finally {
        setLoading(false)
      }
    }

    loadPatientInfo()
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])

    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage)
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        message: aiResponse.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        escalate: aiResponse.escalate,
      }
      setMessages((prev) => [...prev, aiMessage])

      if (aiResponse.escalate) {
        setEscalationRequested(true)
      }
    }, 1000)

    setNewMessage("")
  }

  const handleEscalateToCounselor = () => {
    const systemMessage = {
      id: messages.length + 1,
      type: "system",
      message:
        "Your counselor has been notified and will reach out to you shortly. If this is an emergency, please call 911 or the crisis line at 988.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, systemMessage])
    setEscalationRequested(false)
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#16a34a" }}
          ></div>
          <p style={{ color: "#64748b" }}>Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
      {/* Header */}
      <header className="border-b p-4" style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#16a34a" }}
            >
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: "#1e293b" }}>
                Recovery Support Portal
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Welcome back, {patientInfo?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab("notifications")}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  {unreadCount}
                </span>
              )}
            </Button>
            <Avatar>
              <AvatarFallback style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                {patientInfo?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">
              <Heart className="mr-2 h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2" variant="destructive" style={{ fontSize: "10px", padding: "0 6px" }}>
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="mr-2 h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Recovery Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card style={{ backgroundColor: "#ffffff" }}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: "#16a34a" }}>
                      {patientInfo?.recoveryDays}
                    </div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Days in Recovery
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: "#ffffff" }}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: "#0284c7" }}>
                      {patientInfo?.dose}
                    </div>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Current Dose
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: "#ffffff" }}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2" style={{ color: "#16a34a" }} />
                    <p className="text-sm font-medium" style={{ color: "#1e293b" }}>
                      Next Appointment
                    </p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {patientInfo?.nextAppointment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {notifications.filter((n) => !n.read && n.actionRequired).length > 0 && (
              <Card style={{ backgroundColor: "#fef3c7", borderColor: "#f59e0b" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg" style={{ color: "#92400e" }}>
                    <AlertTriangle className="h-5 w-5" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notifications
                      .filter((n) => !n.read && n.actionRequired)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: "#ffffff" }}
                        >
                          <div className="flex items-center gap-3">
                            {notification.type === "appointment" && (
                              <Calendar className="h-5 w-5" style={{ color: "#16a34a" }} />
                            )}
                            {notification.type === "counseling" && (
                              <AlertTriangle className="h-5 w-5" style={{ color: "#dc2626" }} />
                            )}
                            {notification.type === "balance" && (
                              <DollarSign className="h-5 w-5" style={{ color: "#d97706" }} />
                            )}
                            <div>
                              <p className="font-medium" style={{ color: "#1e293b" }}>
                                {notification.title}
                              </p>
                              <p className="text-sm" style={{ color: "#64748b" }}>
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                            View
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setActiveTab("support")}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span>Chat Support</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setActiveTab("appointments")}
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Appointments</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => setActiveTab("billing")}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Pay Balance</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Phone className="h-6 w-6" />
                    <span>Call Clinic</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Counselor Info */}
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Your Care Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>DS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" style={{ color: "#1e293b" }}>
                      {patientInfo?.counselor}
                    </p>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      Primary Counselor
                    </p>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                      {patientInfo?.counselorPhone}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Appointment reminders, alerts, and important messages</CardDescription>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                    >
                      Mark All as Read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8" style={{ color: "#64748b" }}>
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${!notification.read ? "border-l-4" : ""}`}
                        style={{
                          backgroundColor: notification.read ? "#f8fafc" : "#ffffff",
                          borderLeftColor: !notification.read
                            ? notification.type === "counseling"
                              ? "#dc2626"
                              : notification.type === "balance"
                                ? "#d97706"
                                : notification.type === "appointment"
                                  ? "#16a34a"
                                  : "#0284c7"
                            : undefined,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor:
                                notification.type === "appointment"
                                  ? "#dcfce7"
                                  : notification.type === "counseling"
                                    ? "#fee2e2"
                                    : notification.type === "balance"
                                      ? "#fef3c7"
                                      : "#e0f2fe",
                            }}
                          >
                            {notification.type === "appointment" && (
                              <Calendar className="h-5 w-5" style={{ color: "#16a34a" }} />
                            )}
                            {notification.type === "counseling" && (
                              <AlertTriangle className="h-5 w-5" style={{ color: "#dc2626" }} />
                            )}
                            {notification.type === "balance" && (
                              <DollarSign className="h-5 w-5" style={{ color: "#d97706" }} />
                            )}
                            {notification.type === "general" && (
                              <Bell className="h-5 w-5" style={{ color: "#0284c7" }} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium" style={{ color: "#1e293b" }}>
                                {notification.title}
                              </h4>
                              <span className="text-xs" style={{ color: "#64748b" }}>
                                {notification.date}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: "#64748b" }}>
                              {notification.message}
                            </p>
                            {notification.actionRequired && (
                              <div className="mt-3 flex gap-2">
                                {notification.type === "appointment" && (
                                  <>
                                    <Button size="sm">Confirm</Button>
                                    <Button size="sm" variant="outline">
                                      Reschedule
                                    </Button>
                                  </>
                                )}
                                {notification.type === "counseling" && (
                                  <Button size="sm">
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call to Reschedule
                                  </Button>
                                )}
                                {notification.type === "balance" && (
                                  <Button size="sm" onClick={() => setActiveTab("billing")}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          {!notification.read && (
                            <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you receive reminders and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" style={{ color: "#16a34a" }} />
                      <div>
                        <p className="font-medium" style={{ color: "#1e293b" }}>
                          Appointment Reminders
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          Get reminded about upcoming appointments
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                      <Badge variant="outline">SMS</Badge>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />
                      <div>
                        <p className="font-medium" style={{ color: "#1e293b" }}>
                          Missed Session Alerts
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          Get notified if you miss a session
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                      <Badge variant="outline">SMS</Badge>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5" style={{ color: "#db2777" }} />
                      <div>
                        <p className="font-medium" style={{ color: "#1e293b" }}>
                          Balance Reminders
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          Get reminded about outstanding balances
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 bg-transparent">
                  <User className="mr-2 h-4 w-4" />
                  Update Contact Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
                <CardDescription>View and manage your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{ backgroundColor: "#f0fdf4", borderLeftColor: "#16a34a" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: "#1e293b" }}>
                          Counseling Session
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          {patientInfo?.nextAppointment}
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          With {patientInfo?.counselor}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Confirm</Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: "#1e293b" }}>
                          Medical Check-up
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          January 25, 2024 at 2:00 PM
                        </p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          With Dr. Williams
                        </p>
                      </div>
                      <Badge variant="outline">Confirmed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
                <CardDescription>View and pay your outstanding balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    Current Balance Due
                  </p>
                  <p className="text-4xl font-bold" style={{ color: "#dc2626" }}>
                    $150.00
                  </p>
                  <p className="text-sm mt-2" style={{ color: "#64748b" }}>
                    Due by January 31, 2025
                  </p>
                  <div className="flex justify-center gap-4 mt-6">
                    <Button size="lg">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Now
                    </Button>
                    <Button size="lg" variant="outline">
                      Set Up Payment Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: "#ffffff" }}>
              <CardHeader>
                <CardTitle>Recent Statements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: "#1e293b" }}>
                        January 2025 Statement
                      </p>
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        Services: $350.00 | Payments: $200.00
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: "#1e293b" }}>
                        December 2024 Statement
                      </p>
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        Services: $300.00 | Payments: $300.00
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat */}
              <Card className="lg:col-span-2" style={{ backgroundColor: "#ffffff" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" style={{ color: "#16a34a" }} />
                    AI Wellness Assistant
                  </CardTitle>
                  <CardDescription>Chat with our AI assistant for support and resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg`}
                            style={{
                              backgroundColor:
                                message.type === "user" ? "#16a34a" : message.type === "system" ? "#fee2e2" : "#f1f5f9",
                              color: message.type === "user" ? "#ffffff" : "#1e293b",
                            }}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                            {message.escalate && (
                              <div className="mt-2 pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleEscalateToCounselor}
                                  className="text-xs bg-transparent"
                                  style={{ backgroundColor: "#ffffff" }}
                                >
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Connect with Counselor
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I'm feeling anxious today")}>
                        I&apos;m anxious
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I'm having cravings")}>
                        Having cravings
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I need support")}>
                        Need support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card style={{ backgroundColor: "#ffffff" }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" style={{ color: "#dc2626" }} />
                      Emergency Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="destructive" className="w-full" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Call 911
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Crisis Line: 988
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      Your Counselor
                    </Button>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: "#ffffff" }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Brain className="mr-2 h-4 w-4" />
                      Coping Strategies
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Heart className="mr-2 h-4 w-4" />
                      Meditation Guide
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Recovery Tips
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
