"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  Brain,
  MessageSquare,
  Lightbulb,
  Target,
  BookOpen,
  Award,
  Clock,
  Send,
  FileCheck,
  Users,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  ClipboardCheck,
  Loader2,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AICoachingPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [qaDocumentType, setQaDocumentType] = useState("soap_note")
  const [qaContent, setQaContent] = useState("")
  const [qaResult, setQaResult] = useState<any>(null)
  const [isQaLoading, setIsQaLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")

  // Fetch staff education data
  const {
    data: educationData,
    error: educationError,
    isLoading: educationLoading,
  } = useSWR("/api/staff-education", fetcher)

  // AI Chat setup
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-coaching/chat" }),
  })

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && status !== "in_progress") {
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const handleQaReview = async () => {
    setIsQaLoading(true)
    try {
      const response = await fetch("/api/ai-coaching/qa-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: qaDocumentType,
          documentContent: qaContent,
        }),
      })
      const result = await response.json()
      setQaResult(result)
    } catch (error) {
      console.error("QA Review failed:", error)
    } finally {
      setIsQaLoading(false)
    }
  }

  const getComplianceBadge = (level: string) => {
    switch (level) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "needs_improvement":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Clinical Coaching</h1>
              <p className="text-muted-foreground mt-2">
                AI-powered coaching for documentation, training, and Joint Commission compliance
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{educationData?.stats?.averageCompletion || 0}%</p>
                    <p className="text-xs text-muted-foreground">Training Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 md:h-8 w-6 md:w-8 text-green-500" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{educationData?.stats?.totalStaff || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 md:h-8 w-6 md:w-8 text-blue-500" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{educationData?.stats?.fullyCompliant || 0}</p>
                    <p className="text-xs text-muted-foreground">Fully Compliant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-6 md:h-8 w-6 md:w-8 text-red-500" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{educationData?.stats?.overdueCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Overdue Training</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">AI Coach</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Staff Education</span>
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Documentation QA</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI Clinical Coach
                      </CardTitle>
                      <CardDescription>
                        Ask about documentation, Joint Commission standards, or get clinical guidance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ScrollArea className="flex-1 pr-4 mb-4">
                        <div className="space-y-4">
                          {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              <Brain className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                              <p className="font-medium">Welcome to AI Clinical Coaching</p>
                              <p className="text-sm mt-2">Ask me about:</p>
                              <ul className="text-sm mt-2 space-y-1">
                                <li>- Documentation best practices</li>
                                <li>- Joint Commission standards</li>
                                <li>- Staff training requirements</li>
                                <li>- Clinical compliance questions</li>
                              </ul>
                            </div>
                          )}
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                {message.parts.map((part, index) => {
                                  if (part.type === "text") {
                                    return (
                                      <p key={index} className="text-sm whitespace-pre-wrap">
                                        {part.text}
                                      </p>
                                    )
                                  }
                                  if (part.type === "tool-documentationReview" && part.state === "output-available") {
                                    return (
                                      <div key={index} className="mt-2 p-2 bg-background rounded border">
                                        <p className="text-xs font-medium">Documentation Review Results:</p>
                                        <p className="text-xs">Score: {part.output.complianceScore}%</p>
                                      </div>
                                    )
                                  }
                                  return null
                                })}
                              </div>
                            </div>
                          ))}
                          {status === "in_progress" && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-lg p-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask your AI coach..."
                          disabled={status === "in_progress"}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        "How do I write a compliant SOAP note?",
                        "What are the Joint Commission documentation requirements?",
                        "Review my treatment plan for compliance",
                        "What training is required for new staff?",
                        "Explain PC.01.01.01 Patient Rights standard",
                      ].map((topic, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 bg-transparent"
                          onClick={() => {
                            setInputValue(topic)
                          }}
                        >
                          <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{topic}</span>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Staff Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Training Modules</CardTitle>
                      <CardDescription>Required training for Joint Commission compliance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {educationLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : educationError ? (
                        <div className="text-center text-red-500 py-8">Failed to load training data</div>
                      ) : (
                        <div className="space-y-4">
                          {educationData?.modules?.map((module: any) => (
                            <div key={module.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <h4 className="font-medium">{module.name}</h4>
                                    {module.required && (
                                      <Badge variant="outline" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {module.duration}
                                    </span>
                                    <span>Frequency: {module.frequency}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {module.category}
                                    </Badge>
                                  </div>
                                </div>
                                <Button size="sm">Start</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Staff Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {educationLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      ) : (
                        <div className="space-y-3">
                          {educationData?.staff?.slice(0, 5).map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={member.completionRate} className="w-16 h-2" />
                                <span className="text-xs font-medium">{member.completionRate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Overdue Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {educationData?.staff?.filter((s: any) => s.overdue > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No overdue training</p>
                      ) : (
                        <div className="space-y-2">
                          {educationData?.staff
                            ?.filter((s: any) => s.overdue > 0)
                            .slice(0, 5)
                            .map((member: any) => (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                <span className="text-sm">
                                  {member.first_name} {member.last_name}
                                </span>
                                <Badge variant="destructive" className="text-xs">
                                  {member.overdue} overdue
                                </Badge>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Documentation QA Tab */}
            <TabsContent value="qa" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5" />
                      Documentation Review
                    </CardTitle>
                    <CardDescription>Submit documentation for Joint Commission compliance review</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Type</label>
                      <Select value={qaDocumentType} onValueChange={setQaDocumentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soap_note">SOAP Note</SelectItem>
                          <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="progress_note">Progress Note</SelectItem>
                          <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Content</label>
                      <Textarea
                        value={qaContent}
                        onChange={(e) => setQaContent(e.target.value)}
                        placeholder="Paste your documentation here for compliance review..."
                        className="min-h-[200px]"
                      />
                    </div>

                    <Button onClick={handleQaReview} disabled={isQaLoading} className="w-full">
                      {isQaLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Review Documentation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>QA Results</CardTitle>
                    <CardDescription>Joint Commission compliance assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!qaResult ? (
                      <div className="text-center text-muted-foreground py-12">
                        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>Submit documentation for review</p>
                        <p className="text-sm mt-1">Results will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-3xl font-bold">{qaResult.overallScore}%</p>
                          </div>
                          {getComplianceBadge(qaResult.complianceLevel)}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Findings</h4>
                          {qaResult.findings?.map((finding: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 border rounded">
                              {getSeverityIcon(finding.severity)}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{finding.category}</p>
                                <p className="text-xs text-muted-foreground">{finding.issue}</p>
                                <p className="text-xs text-blue-600 mt-1">{finding.recommendation}</p>
                                {finding.jointCommissionStandard && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {finding.jointCommissionStandard}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {qaResult.actionItems?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Action Items</h4>
                            <ul className="space-y-1">
                              {qaResult.actionItems.map((item: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <Target className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="p-3 bg-muted rounded">
                          <p className="text-sm">{qaResult.summary}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
