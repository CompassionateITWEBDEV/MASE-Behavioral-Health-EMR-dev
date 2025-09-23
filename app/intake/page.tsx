"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  User,
  FileText,
  Camera,
  Smartphone,
  Shield,
  Heart,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Phone,
  Mail,
  CreditCard,
  Stethoscope,
} from "lucide-react"

export default function PatientIntake() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orientationProgress, setOrientationProgress] = useState(0)
  const [completedItems, setCompletedItems] = useState<number[]>([])

  const orientationChecklist = [
    {
      id: 1,
      title: "Introduction and Welcome",
      description: "Greet patient and provide program overview",
      icon: Users,
    },
    {
      id: 2,
      title: "Program Overview",
      description: "Explain services, treatment phases, and expectations",
      icon: FileText,
    },
    { id: 3, title: "Facility Tour", description: "Show key areas and emergency exits", icon: MapPin },
    { id: 4, title: "Patient ID Card", description: "Issue identification card with photo", icon: Camera },
    {
      id: 5,
      title: "Rights and Responsibilities",
      description: "Review HIPAA rights and patient responsibilities",
      icon: Shield,
    },
    { id: 6, title: "Grievance Procedure", description: "Explain complaint process and HHN filing", icon: AlertCircle },
    {
      id: 7,
      title: "HHN Orientation",
      description: "Set up HomeHealthNotify app and demonstrate features",
      icon: Smartphone,
    },
    {
      id: 8,
      title: "Medication Education",
      description: "Discuss MAT options, benefits, and safety",
      icon: Stethoscope,
    },
    { id: 9, title: "Drug Screening Policy", description: "Review testing procedures and protocols", icon: Heart },
    {
      id: 10,
      title: "Treatment Schedule",
      description: "Provide appointment schedule and attendance policy",
      icon: Calendar,
    },
    { id: 11, title: "Safety Procedures", description: "Review emergency protocols and EAP codes", icon: Shield },
    { id: 12, title: "Support Services", description: "Explain case management and peer support", icon: Users },
    { id: 13, title: "Confidentiality Forms", description: "Review and sign consent forms", icon: FileText },
    { id: 14, title: "Educational Programs", description: "Discuss available workshops and training", icon: FileText },
    {
      id: 15,
      title: "Financial Information",
      description: "Review payment arrangements and insurance",
      icon: CreditCard,
    },
    { id: 16, title: "Patient Handbook", description: "Provide handbook and review key sections", icon: FileText },
    { id: 17, title: "Telehealth Options", description: "Explain remote appointment availability", icon: Phone },
    {
      id: 18,
      title: "Take-Home Monitoring",
      description: "Review eligibility and HHN video requirements",
      icon: Smartphone,
    },
    { id: 19, title: "Contact Information", description: "Provide key contacts and after-hours support", icon: Mail },
    {
      id: 20,
      title: "Follow-Up Planning",
      description: "Schedule next appointments and confirm understanding",
      icon: Calendar,
    },
  ]

  const handleItemComplete = (itemId: number) => {
    if (!completedItems.includes(itemId)) {
      const newCompleted = [...completedItems, itemId]
      setCompletedItems(newCompleted)
      setOrientationProgress((newCompleted.length / orientationChecklist.length) * 100)
    }
  }

  const patientData = {
    name: "Sarah Johnson",
    dob: "1985-03-15",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    address: "123 Main St, Detroit, MI 48201",
    emergencyContact: "Michael Johnson - (555) 987-6543",
    insurance: "Blue Cross Blue Shield",
    referralSource: "Detroit Medical Center",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pl-64">
        <div className="border-b bg-card/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Patient Intake & Orientation</h1>
                <p className="text-muted-foreground">Comprehensive intake process with patient orientation checklist</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Clock className="mr-1 h-3 w-3" />
                  Est. 45-60 minutes
                </Badge>
                <Button variant="outline" size="sm">
                  Save Progress
                </Button>
                <Button size="sm">Complete Intake</Button>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{patientData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm">{patientData.dob}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{patientData.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{patientData.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Insurance</Label>
                    <p className="text-sm">{patientData.insurance}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Referral Source</Label>
                    <p className="text-sm">{patientData.referralSource}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orientation Progress</CardTitle>
                  <CardDescription>
                    {completedItems.length} of {orientationChecklist.length} items completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={orientationProgress} className="mb-4" />
                  <div className="text-sm text-muted-foreground">{Math.round(orientationProgress)}% Complete</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="orientation" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orientation">Patient Orientation</TabsTrigger>
                  <TabsTrigger value="assessment">Clinical Assessment</TabsTrigger>
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="orientation" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Orientation Checklist</CardTitle>
                      <CardDescription>
                        Complete all 20 orientation items to ensure comprehensive patient onboarding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orientationChecklist.map((item) => {
                          const Icon = item.icon
                          const isCompleted = completedItems.includes(item.id)

                          return (
                            <div
                              key={item.id}
                              className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                                isCompleted ? "bg-green-50 border-green-200" : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`p-2 rounded-full ${
                                    isCompleted ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-medium ${isCompleted ? "text-green-800" : ""}`}>
                                    {item.id}. {item.title}
                                  </h4>
                                  <Checkbox checked={isCompleted} onCheckedChange={() => handleItemComplete(item.id)} />
                                </div>
                                <p
                                  className={`text-sm mt-1 ${isCompleted ? "text-green-700" : "text-muted-foreground"}`}
                                >
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Assessment</CardTitle>
                      <CardDescription>Initial clinical evaluation and treatment planning</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="substance-history">Primary Substance</Label>
                          <Input id="substance-history" placeholder="e.g., Heroin, Fentanyl" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration of Use</Label>
                          <Input id="duration" placeholder="e.g., 5 years" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medical-history">Medical History</Label>
                        <Textarea
                          id="medical-history"
                          placeholder="Document relevant medical conditions, medications, allergies..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mental-health">Mental Health Screening</Label>
                        <Textarea
                          id="mental-health"
                          placeholder="PHQ-9, GAD-7 results, psychiatric history..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="social-determinants">Social Determinants</Label>
                        <Textarea
                          id="social-determinants"
                          placeholder="Housing status, employment, support system, transportation..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documentation" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Required Documentation</CardTitle>
                      <CardDescription>Ensure all necessary forms and consents are completed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Consent for Treatment</span>
                            <Badge variant="default">Signed</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>HIPAA Authorization</span>
                            <Badge variant="default">Signed</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Financial Agreement</span>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Emergency Contact Form</span>
                            <Badge variant="default">Complete</Badge>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Photo ID Verification</span>
                            <Badge variant="default">Verified</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Insurance Card Copy</span>
                            <Badge variant="default">Uploaded</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>HHN Enrollment</span>
                            <Badge variant="secondary">In Progress</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <span>Patient Handbook Receipt</span>
                            <Badge variant="outline">Not Started</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Signatures</CardTitle>
                      <CardDescription>Required signatures for intake completion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Patient Signature</Label>
                          <div className="p-3 border rounded bg-muted/50">
                            <p className="text-sm text-muted-foreground">Digital signature required</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Staff Signature</Label>
                          <div className="p-3 border rounded bg-muted/50">
                            <p className="text-sm text-muted-foreground">Staff member completing intake</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
