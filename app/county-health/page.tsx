"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Baby,
  Syringe,
  Heart,
  Activity,
  Building2,
  AlertTriangle,
  FileText,
  Shield,
  Home,
  Stethoscope,
  TestTube,
  Bot,
  Send,
  Loader2,
  GraduationCap,
  BookOpen,
  Video,
} from "lucide-react"

export default function CountyHealthPage() {
  const [countyData, setCountyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [educationResources, setEducationResources] = useState<any[]>([])
  const [staffModules, setStaffModules] = useState<any[]>([])

  useEffect(() => {
    fetchCountyData()
    fetchEducationResources()
    fetchStaffModules()
  }, [])

  const fetchCountyData = async () => {
    try {
      const response = await fetch("/api/county-health?countyId=demo-county-id")
      const data = await response.json()
      setCountyData(data)
    } catch (error) {
      console.error("Error fetching county health data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEducationResources = async () => {
    try {
      const response = await fetch("/api/county-health/education")
      const data = await response.json()
      setEducationResources(data.resources || [])
    } catch (error) {
      console.error("[v0] Error fetching education resources:", error)
    }
  }

  const fetchStaffModules = async () => {
    try {
      const response = await fetch("/api/county-health/staff-education")
      const data = await response.json()
      setStaffModules(data.modules || [])
    } catch (error) {
      console.error("[v0] Error fetching staff modules:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage = { id: Date.now(), role: "user", content: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/county-health/ai-coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue, programArea: "general" }),
      })
      const data = await response.json()

      const assistantMessage = { id: Date.now() + 1, role: "assistant", content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">County Health System</h1>
              <p className="text-sm text-slate-600 mt-1">Public Health Services & Population Management</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Oakland County, MI
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Population: 1.2M+
              </Badge>
            </div>
          </div>

          {/* Key Statistics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">WIC Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">1,247</p>
                    <p className="text-xs text-slate-500">Active this month</p>
                  </div>
                  <Baby className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Immunizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">3,842</p>
                    <p className="text-xs text-slate-500">This month</p>
                  </div>
                  <Syringe className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Sexual Health Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">892</p>
                    <p className="text-xs text-slate-500">STD clinic visits</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Disease Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">47</p>
                    <p className="text-xs text-slate-500">This year</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="wic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
              <TabsTrigger value="wic">WIC Program</TabsTrigger>
              <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
              <TabsTrigger value="std">Sexual Health</TabsTrigger>
              <TabsTrigger value="mch">Maternal & Child</TabsTrigger>
              <TabsTrigger value="disease">Disease Tracking</TabsTrigger>
              <TabsTrigger value="tb">TB Management</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
              <TabsTrigger value="education">Family Education</TabsTrigger>
            </TabsList>

            {/* WIC Program Tab */}
            <TabsContent value="wic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Women, Infants & Children (WIC) Program</CardTitle>
                  <CardDescription>
                    Supplemental nutrition program for pregnant women, infants, and children up to age 5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                        <p className="text-sm font-medium text-pink-900">Pregnant Women</p>
                        <p className="text-2xl font-bold text-pink-700 mt-1">342</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">Infants</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">478</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-900">Children (1-5 yrs)</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">427</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">Services Provided</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Supplemental Healthy Foods",
                          "Nutrition Counseling",
                          "Growth & Development Screening",
                          "Breastfeeding Support",
                          "Immunization Referrals",
                          "Healthcare Referrals",
                        ].map((service) => (
                          <div key={service} className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-slate-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Users className="h-4 w-4 mr-2" />
                        Enroll New WIC Participant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Immunizations Tab */}
            <TabsContent value="immunizations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Immunization Clinics</CardTitle>
                  <CardDescription>
                    Walk-in vaccination services for all ages with $7 admin fee (sliding scale available)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-2">North Oakland Health Center</h4>
                        <p className="text-sm text-slate-600">Walk-in Hours:</p>
                        <p className="text-sm text-slate-900 font-medium">Mon-Fri: 8:30 AM - 5:00 PM</p>
                        <Badge className="mt-2 bg-green-500">Open Today</Badge>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-2">South Oakland Health Center</h4>
                        <p className="text-sm text-slate-600">Walk-in Hours:</p>
                        <p className="text-sm text-slate-900 font-medium">Mon-Fri: 8:30 AM - 5:00 PM</p>
                        <Badge className="mt-2 bg-green-500">Open Today</Badge>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">Available Vaccines</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[
                          "COVID-19",
                          "Influenza",
                          "MMR",
                          "Varicella",
                          "Hepatitis A",
                          "Hepatitis B",
                          "HPV",
                          "Tdap",
                          "Meningococcal",
                          "Pneumococcal",
                        ].map((vaccine) => (
                          <Badge key={vaccine} variant="outline" className="justify-center">
                            {vaccine}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Syringe className="h-4 w-4 mr-2" />
                        Record Vaccination
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sexual Health Tab */}
            <TabsContent value="std" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sexual Health Services</CardTitle>
                  <CardDescription>
                    HIV/AIDS, PrEP, nPEP, and STI testing & treatment ($5 clinic visit fee)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-900">HIV Tests This Month</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">234</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-sm font-medium text-purple-900">STI Screenings</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">658</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">PrEP Patients</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">112</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">Services Available</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { name: "HIV Testing & Counseling", icon: TestTube },
                          { name: "PrEP (Pre-Exposure Prophylaxis)", icon: Shield },
                          { name: "nPEP (Post-Exposure Prophylaxis)", icon: AlertTriangle },
                          { name: "STI Testing (Gonorrhea, Chlamydia, Syphilis)", icon: Activity },
                          { name: "Treatment Services", icon: Stethoscope },
                          { name: "Partner Notification Services", icon: Users },
                        ].map((service) => (
                          <div
                            key={service.name}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50"
                          >
                            <service.icon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-slate-700">{service.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Heart className="h-4 w-4 mr-2" />
                        New STD Clinic Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maternal & Child Health Tab */}
            <TabsContent value="mch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maternal & Child Health Programs</CardTitle>
                  <CardDescription>
                    Home visiting, prenatal care, well-child services, and family support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                        <p className="text-sm font-medium text-pink-900">Prenatal Cases</p>
                        <p className="text-2xl font-bold text-pink-700 mt-1">87</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">Well-Child Visits</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">234</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-900">Home Visits</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">156</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-sm font-medium text-purple-900">Family Planning</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">92</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Home className="h-4 w-4 mr-2" />
                        Enroll in MCH Program
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Disease Tracking Tab */}
            <TabsContent value="disease" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Communicable Disease Surveillance</CardTitle>
                  <CardDescription>Reportable disease tracking, investigation, and outbreak management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-900">Active Investigations</p>
                          <p className="text-2xl font-bold text-orange-700 mt-1">12</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">Recent Reports</h4>
                      <div className="space-y-2">
                        {[
                          { disease: "COVID-19", count: 18, status: "confirmed" },
                          { disease: "Influenza", count: 12, status: "confirmed" },
                          { disease: "Salmonella", count: 4, status: "probable" },
                          { disease: "Hepatitis A", count: 2, status: "confirmed" },
                          { disease: "Measles", count: 1, status: "suspected" },
                        ].map((report) => (
                          <div key={report.disease} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              <span className="text-sm font-medium text-slate-900">{report.disease}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{report.count} cases</Badge>
                              <Badge
                                className={
                                  report.status === "confirmed"
                                    ? "bg-red-500"
                                    : report.status === "probable"
                                      ? "bg-orange-500"
                                      : "bg-yellow-500"
                                }
                              >
                                {report.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <FileText className="h-4 w-4 mr-2" />
                        Report Communicable Disease
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TB Management Tab */}
            <TabsContent value="tb" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tuberculosis (TB) Program</CardTitle>
                  <CardDescription>
                    TB case management, DOT (Directly Observed Therapy), and contact tracing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-900">Active TB Cases</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">8</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-900">Latent TB</p>
                        <p className="text-2xl font-bold text-yellow-700 mt-1">23</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-900">DOT Patients</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">6</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">TB Services</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "TB Skin Testing (TST)",
                          "Chest X-Ray Coordination",
                          "Sputum Collection",
                          "DOT (Directly Observed Therapy)",
                          "Contact Investigation",
                          "Treatment Completion Monitoring",
                        ].map((service) => (
                          <div key={service} className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-slate-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Activity className="h-4 w-4 mr-2" />
                        Add TB Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Environmental Health Tab */}
            <TabsContent value="environmental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Health Services</CardTitle>
                  <CardDescription>
                    Food safety, water quality, septic inspections, and public health protection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">Food Inspections</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">142</p>
                      </div>
                      <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                        <p className="text-sm font-medium text-cyan-900">Pool/Spa Permits</p>
                        <p className="text-2xl font-bold text-cyan-700 mt-1">78</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-900">Septic Systems</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">56</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-sm font-medium text-purple-900">Water Tests</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">34</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button className="w-full md:w-auto">
                        <Building2 className="h-4 w-4 mr-2" />
                        Schedule Inspection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-coach" className="space-y-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    County Health AI Coach
                  </CardTitle>
                  <CardDescription>
                    Ask questions about WIC, immunizations, STI services, maternal health, TB management, and more
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 text-blue-600" />
                          <p className="text-lg font-medium">Welcome to County Health AI Coach</p>
                          <p className="text-sm mt-2">Click a quick start option or type your question:</p>
                          <div className="grid grid-cols-2 gap-2 mt-4 max-w-2xl mx-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("How do I determine WIC eligibility?")}
                            >
                              WIC Eligibility
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("What's the catch-up vaccine schedule?")}
                            >
                              Vaccine Catch-Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("How do I manage STI partner notification?")}
                            >
                              Partner Notification
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("Explain postpartum depression screening")}
                            >
                              EPDS Screening
                            </Button>
                          </div>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user" ? "bg-blue-600 text-white" : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {message.role === "assistant" ? (
                                  <Bot className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Users className="h-4 w-4" />
                                )}
                                <span className="text-xs font-medium">
                                  {message.role === "assistant" ? "AI Coach" : "You"}
                                </span>
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about WIC, immunizations, STI services, home visiting..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Family Education Resources
                  </CardTitle>
                  <CardDescription>
                    Patient and family education materials in multiple languages for county health programs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {educationResources.length > 0 ? (
                      educationResources.map((resource: any) => (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {resource.resource_type === "video" ? (
                                  <Video className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <FileText className="h-5 w-5 text-green-600" />
                                )}
                                <CardTitle className="text-sm">{resource.title}</CardTitle>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {resource.program_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {resource.resource_type}
                              </Badge>
                              {resource.languages_available?.includes("Spanish") && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  Español
                                </Badge>
                              )}
                              {resource.languages_available?.includes("Arabic") && (
                                <Badge variant="outline" className="text-xs bg-purple-50">
                                  عربي
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                            <Button size="sm" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Resource
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No education resources available. Run SQL scripts to load county health data.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    County Staff Training Modules
                  </CardTitle>
                  <CardDescription>
                    Required and recommended training for WIC counselors, nurses, and public health staff
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffModules.length > 0 ? (
                      staffModules.slice(0, 6).map((module: any) => (
                        <Card key={module.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-sm">{module.module_name}</CardTitle>
                              {module.is_required && <Badge className="bg-red-500 text-xs">Required</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {module.ceu_hours} CEU
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {module.duration_minutes} min
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {module.regulatory_source}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                            <Button size="sm" className="w-full bg-transparent" variant="outline">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Start Training
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No training modules available. Run SQL scripts to load county staff education.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
