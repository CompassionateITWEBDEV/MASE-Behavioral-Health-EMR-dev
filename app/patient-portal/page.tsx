"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  MessageSquare,
  Calendar,
  FileText,
  Pill,
  AlertTriangle,
  Send,
  Phone,
  Video,
  User,
  Heart,
  Shield,
  Clock,
  CheckCircle,
  Download,
  Gamepad2,
  Target,
  BookOpen,
  HelpCircle,
  Star,
  Trophy,
  Zap,
} from "lucide-react"

// Mock patient data
const patientInfo = {
  name: "Sarah Johnson",
  id: "PT-2024-001",
  program: "Methadone Program",
  dose: "80mg",
  nextAppointment: "January 18, 2024 at 10:00 AM",
  counselor: "Dr. Smith",
  counselorPhone: "(555) 123-4567",
}

const aiMessages = [
  {
    id: 1,
    type: "ai",
    message: "Hello Sarah! I'm your AI wellness assistant. How are you feeling today?",
    timestamp: "2:30 PM",
  },
]

export default function PatientPortalPage() {
  const [messages, setMessages] = useState(aiMessages)
  const [newMessage, setNewMessage] = useState("")
  const [escalationRequested, setEscalationRequested] = useState(false)
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [gameScore, setGameScore] = useState(0)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
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

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for crisis keywords
    if (
      lowerMessage.includes("suicide") ||
      lowerMessage.includes("kill myself") ||
      lowerMessage.includes("end it all") ||
      lowerMessage.includes("hurt myself")
    ) {
      return {
        message:
          "I'm very concerned about what you're sharing. This is serious and I want to make sure you get immediate support. I'm connecting you with your counselor right away. If this is an emergency, please call 911 or go to your nearest emergency room. You can also call the 988 Suicide & Crisis Lifeline.",
        escalate: true,
      }
    }

    // Check for relapse concerns
    if (
      lowerMessage.includes("relapse") ||
      lowerMessage.includes("using") ||
      lowerMessage.includes("cravings") ||
      lowerMessage.includes("want to use")
    ) {
      return {
        message:
          "Thank you for sharing this with me. Cravings and thoughts about using are a normal part of recovery. I'm going to connect you with your counselor so you can get personalized support. In the meantime, remember your coping strategies and consider reaching out to your support network.",
        escalate: true,
      }
    }

    // Check for medication concerns
    if (lowerMessage.includes("medication") || lowerMessage.includes("dose") || lowerMessage.includes("side effects")) {
      return {
        message:
          "I understand you have concerns about your medication. This is important to discuss with your treatment team. I'm notifying your counselor so they can address this with you promptly. Never stop or change your medication without medical supervision.",
        escalate: true,
      }
    }

    // General supportive responses
    if (lowerMessage.includes("anxious") || lowerMessage.includes("worried")) {
      return {
        message:
          "It sounds like you're experiencing some anxiety. That's completely understandable. Some helpful techniques include deep breathing, grounding exercises, or calling a trusted friend. Would you like me to guide you through a breathing exercise, or would you prefer to speak with your counselor?",
        escalate: false,
      }
    }

    if (lowerMessage.includes("good") || lowerMessage.includes("better") || lowerMessage.includes("fine")) {
      return {
        message:
          "I'm glad to hear you're doing well! Maintaining your recovery is something to be proud of. Remember to keep up with your appointments and continue using the coping strategies that work for you. Is there anything specific you'd like to talk about today?",
        escalate: false,
      }
    }

    // Default response
    return {
      message:
        "Thank you for sharing that with me. I'm here to support you in your recovery journey. If you need immediate assistance or want to discuss something in detail, I can connect you with your counselor. How else can I help you today?",
      escalate: false,
    }
  }

  const handleEscalateToCounselor = () => {
    setEscalationRequested(true)
    const escalationMessage = {
      id: messages.length + 1,
      type: "system",
      message:
        "🚨 Your counselor has been notified and will contact you within 1 hour. If this is an emergency, please call 911 or your crisis hotline.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, escalationMessage])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
              Welcome, {patientInfo.name}
            </h1>
            <p className="text-muted-foreground">Your personal health portal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Emergency: 911
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Crisis Line: 988
            </Button>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Current Program</p>
                  <p className="text-lg font-bold">{patientInfo.program}</p>
                  <p className="text-sm text-muted-foreground">Dose: {patientInfo.dose}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Next Appointment</p>
                  <p className="text-sm font-bold">{patientInfo.nextAppointment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Your Counselor</p>
                  <p className="text-lg font-bold">{patientInfo.counselor}</p>
                  <p className="text-sm text-muted-foreground">{patientInfo.counselorPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Recovery Days</p>
                  <p className="text-2xl font-bold text-green-600">127</p>
                  <p className="text-sm text-muted-foreground">Keep going!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ai-coach" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
            <TabsTrigger value="treatment-plan">Treatment Plan</TabsTrigger>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="mind-games">Mind Games</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-coach" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI Wellness Assistant
                      {escalationRequested && (
                        <Badge variant="destructive" className="ml-2">
                          Counselor Notified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Your personal AI assistant for recovery support and guidance</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : message.type === "system"
                                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                            {message.escalate && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleEscalateToCounselor}
                                  className="text-xs bg-transparent"
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

                    {/* Message Input */}
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

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I'm feeling anxious today")}>
                        I'm anxious
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I'm having cravings")}>
                        Having cravings
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setNewMessage("I need support")}>
                        Need support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Emergency Contacts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
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

                {/* Daily Check-in */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Check-in</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">How are you feeling today?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          😊 Good
                        </Button>
                        <Button variant="outline" size="sm">
                          😐 Okay
                        </Button>
                        <Button variant="outline" size="sm">
                          😟 Anxious
                        </Button>
                        <Button variant="outline" size="sm">
                          😢 Struggling
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Resources */}
                <Card>
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

          <TabsContent value="treatment-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  My Treatment Plan
                </CardTitle>
                <CardDescription>Your personalized recovery roadmap and goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Current Goals</h3>
                    <div className="space-y-3">
                      {[
                        { goal: "Maintain stable methadone dose", status: "On Track", progress: 90 },
                        { goal: "Attend weekly counseling sessions", status: "Excellent", progress: 95 },
                        { goal: "Complete relapse prevention plan", status: "In Progress", progress: 70 },
                        { goal: "Develop healthy coping strategies", status: "Good", progress: 80 },
                      ].map((item, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{item.goal}</p>
                            <Badge
                              variant={
                                item.status === "Excellent"
                                  ? "default"
                                  : item.status === "Good" || item.status === "On Track"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.progress}% Complete</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Treatment Milestones</h3>
                    <div className="space-y-3">
                      {[
                        { milestone: "Initial Assessment Completed", date: "Dec 15, 2023", completed: true },
                        { milestone: "30-Day Stability Achieved", date: "Jan 15, 2024", completed: true },
                        { milestone: "First Take-Home Privileges", date: "Feb 1, 2024", completed: true },
                        { milestone: "6-Month Review", date: "Jun 15, 2024", completed: false },
                        { milestone: "Transition Planning", date: "Dec 15, 2024", completed: false },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                          {item.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {item.milestone}
                            </p>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Treatment Team Notes</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      "Sarah has shown excellent progress in her recovery journey. She consistently attends appointments
                      and has demonstrated strong commitment to her treatment goals. Continue current medication regimen
                      and focus on developing additional coping strategies for stress management."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">- Dr. Smith, Primary Counselor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    My Documents
                  </CardTitle>
                  <CardDescription>Access your treatment documents and forms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Treatment Plan", type: "Treatment", date: "Jan 15, 2024", status: "Current" },
                    { name: "Informed Consent - MAT", type: "Consent", date: "Dec 15, 2023", status: "Signed" },
                    { name: "HIPAA Authorization", type: "Consent", date: "Dec 15, 2023", status: "Signed" },
                    { name: "Take-Home Agreement", type: "Agreement", date: "Feb 1, 2024", status: "Active" },
                    { name: "Medication Schedule", type: "Schedule", date: "Jan 1, 2024", status: "Current" },
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • {doc.date} • {doc.status}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lab Results & Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Urine Drug Screen", date: "Jan 10, 2024", result: "Negative", status: "Normal" },
                    { name: "Monthly Progress Report", date: "Jan 1, 2024", result: "Stable", status: "Good" },
                    { name: "Medication Levels", date: "Dec 28, 2023", result: "Therapeutic", status: "Normal" },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.date} • Result: {report.result}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={report.status === "Normal" || report.status === "Good" ? "default" : "secondary"}
                        >
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Counseling Session</p>
                        <p className="text-sm text-muted-foreground">January 18, 2024 at 10:00 AM</p>
                        <p className="text-sm text-muted-foreground">with Dr. Smith</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Join Video
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Available Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: "Coping Strategies Guide",
                      type: "Educational",
                      description: "Learn healthy ways to manage stress and cravings",
                    },
                    {
                      name: "Meditation & Mindfulness",
                      type: "Wellness",
                      description: "Guided meditation sessions for recovery",
                    },
                    {
                      name: "Support Group Directory",
                      type: "Community",
                      description: "Connect with others in recovery",
                    },
                    { name: "Nutrition Guidelines", type: "Health", description: "Healthy eating during recovery" },
                    { name: "Exercise Programs", type: "Fitness", description: "Safe exercise routines for recovery" },
                    { name: "Financial Assistance Info", type: "Support", description: "Resources for financial help" },
                  ].map((resource, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <Button size="sm" className="mt-2">
                        Access Resource
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Request Resources
                  </CardTitle>
                  <CardDescription>Need something specific? Let us know!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resource Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="housing">Housing Assistance</SelectItem>
                        <SelectItem value="employment">Employment Support</SelectItem>
                        <SelectItem value="transportation">Transportation Help</SelectItem>
                        <SelectItem value="childcare">Childcare Resources</SelectItem>
                        <SelectItem value="legal">Legal Aid</SelectItem>
                        <SelectItem value="financial">Financial Assistance</SelectItem>
                        <SelectItem value="education">Educational Programs</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority Level</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent - Need ASAP</SelectItem>
                        <SelectItem value="high">High - Within a week</SelectItem>
                        <SelectItem value="medium">Medium - Within a month</SelectItem>
                        <SelectItem value="low">Low - When available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Details</label>
                    <Textarea placeholder="Please describe what you need and any specific requirements..." rows={4} />
                  </div>
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mind-games" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-primary" />
                      Recovery Mind Games
                      {currentGame && (
                        <Badge variant="default" className="ml-2">
                          Score: {gameScore}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Keep your mind active with fun, recovery-focused games and activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-full">
                    {!currentGame ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        {[
                          {
                            name: "Memory Match",
                            description: "Match recovery-themed cards to improve memory",
                            difficulty: "Easy",
                            icon: <Brain className="h-8 w-8" />,
                            color: "bg-blue-500",
                          },
                          {
                            name: "Word Puzzle",
                            description: "Find positive words hidden in the grid",
                            difficulty: "Medium",
                            icon: <Target className="h-8 w-8" />,
                            color: "bg-green-500",
                          },
                          {
                            name: "Mindfulness Maze",
                            description: "Navigate through calming maze challenges",
                            difficulty: "Easy",
                            icon: <Heart className="h-8 w-8" />,
                            color: "bg-purple-500",
                          },
                          {
                            name: "Trivia Challenge",
                            description: "Test your knowledge about health and wellness",
                            difficulty: "Hard",
                            icon: <Star className="h-8 w-8" />,
                            color: "bg-orange-500",
                          },
                        ].map((game, index) => (
                          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 text-center">
                              <div
                                className={`${game.color} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
                              >
                                {game.icon}
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{game.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                              <Badge variant="outline" className="mb-4">
                                {game.difficulty}
                              </Badge>
                              <Button
                                className="w-full"
                                onClick={() => {
                                  setCurrentGame(game.name)
                                  setGameScore(0)
                                }}
                              >
                                Play Now
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">Playing: {currentGame}</h3>
                          <Button variant="outline" onClick={() => setCurrentGame(null)}>
                            Back to Games
                          </Button>
                        </div>
                        <div className="flex-1 bg-muted/20 rounded-lg p-8 flex items-center justify-center">
                          <div className="text-center">
                            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">Game Loading...</p>
                            <p className="text-muted-foreground">This is where the {currentGame} would be displayed</p>
                            <Button className="mt-4" onClick={() => setGameScore((prev) => prev + 10)}>
                              <Zap className="mr-2 h-4 w-4" />
                              Simulate Score +10
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "First Game", description: "Played your first mind game", earned: true },
                      { name: "Memory Master", description: "Complete 5 memory games", earned: true },
                      { name: "Daily Player", description: "Play games 7 days in a row", earned: false },
                      { name: "High Score", description: "Achieve a score over 100", earned: false },
                    ].map((achievement, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? "bg-yellow-50 border border-yellow-200" : "bg-muted/50"}`}
                      >
                        <Trophy
                          className={`h-5 w-5 ${achievement.earned ? "text-yellow-500" : "text-muted-foreground"}`}
                        />
                        <div>
                          <p
                            className={`font-medium ${achievement.earned ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium mb-1">Word of the Day</p>
                      <p className="text-2xl font-bold text-primary mb-2">RESILIENCE</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        The ability to recover from difficulties and adapt to challenges
                      </p>
                      <Button size="sm" className="w-full">
                        Complete Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Games Played</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best Score</span>
                      <span className="font-medium">87</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Streak</span>
                      <span className="font-medium">5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Achievements</span>
                      <span className="font-medium">2/4</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recovery Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">30 Days Clean</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">90 Days Clean</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">6 Months Clean</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">1 Year Clean (Coming Soon!)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Treatment Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Attend all appointments</span>
                      <span className="text-sm text-green-600">95%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Complete daily check-ins</span>
                      <span className="text-sm text-blue-600">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Treatment Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-3 border border-border rounded-lg">
                    <Avatar>
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Dr. Smith</p>
                      <p className="text-sm text-muted-foreground">Primary Counselor</p>
                      <p className="text-sm text-muted-foreground">{patientInfo.counselorPhone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="Type your message to your treatment team..." />
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
