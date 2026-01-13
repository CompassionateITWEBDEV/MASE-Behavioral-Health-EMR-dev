"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Heart,
  Shield,
  Users,
  BookOpen,
  Phone,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Home,
  Clock,
  MapPin,
  AlertTriangle,
  Send,
  UserPlus,
  Search,
  Download,
  PhoneCall,
  Lock,
  HelpCircle,
  FileText,
  Stethoscope,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ConsentForm {
  id: string
  title: string
  description: string
  category: "treatment" | "testing" | "privacy"
  required: boolean
  content: string
  acknowledgments: string[]
}

export default function MASEAccessPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [screeningStep, setScreeningStep] = useState(1)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  const [consentStep, setConsentStep] = useState(1)
  const [signedConsents, setSignedConsents] = useState<Record<string, boolean>>({})
  const [consentSignature, setConsentSignature] = useState("")
  const [consentDate, setConsentDate] = useState("")
  const [patientInitials, setPatientInitials] = useState("")

  const consentForms: ConsentForm[] = [
    {
      id: "consent-to-treat",
      title: "Consent to Treatment",
      description: "Authorization to receive medication-assisted treatment (MAT) services",
      category: "treatment",
      required: true,
      content: `CONSENT TO TREATMENT FOR OPIOID USE DISORDER

I, the undersigned patient, hereby voluntarily consent to receive treatment for Opioid Use Disorder at this facility. I understand and agree to the following:

1. NATURE OF TREATMENT
I understand that I will be receiving Medication-Assisted Treatment (MAT), which may include medications such as Methadone, Buprenorphine (Suboxone/Subutex), or Naltrexone (Vivitrol), along with counseling and behavioral therapies.

2. BENEFITS AND RISKS
I understand that MAT has been shown to:
• Reduce illicit opioid use
• Decrease risk of overdose death
• Reduce criminal activity
• Improve social functioning
• Support long-term recovery

I also understand that treatment may involve certain risks including:
• Side effects from medications
• Physical dependence on treatment medications
• Risk of overdose if medications are misused
• Potential drug interactions

3. ALTERNATIVES
I have been informed of alternative treatment options including:
• Medication-free recovery programs
• Residential treatment programs
• Intensive outpatient programs
• Support groups (NA, AA, SMART Recovery)

4. PATIENT RESPONSIBILITIES
I agree to:
• Attend all scheduled appointments
• Take medications only as prescribed
• Participate in required counseling sessions
• Submit to drug screening as required
• Inform staff of any changes in my health or medications
• Not use illicit substances during treatment
• Follow all program rules and policies

5. CONFIDENTIALITY
I understand that my treatment records are protected under federal law (42 CFR Part 2) and cannot be disclosed without my written consent, except in limited circumstances permitted by law.

6. VOLUNTARY PARTICIPATION
I understand that my participation in treatment is voluntary and that I may withdraw from treatment at any time. However, I understand the risks of abrupt discontinuation and agree to discuss any concerns with my treatment team.`,
      acknowledgments: [
        "I have read and understand the information above",
        "I have had the opportunity to ask questions",
        "I voluntarily consent to treatment",
        "I understand the risks and benefits of treatment",
        "I agree to follow program rules and policies",
      ],
    },
    {
      id: "uds-consent",
      title: "Urine Drug Screen (UDS) Consent",
      description: "Authorization for drug testing during treatment",
      category: "testing",
      required: true,
      content: `CONSENT FOR URINE DRUG SCREENING

I, the undersigned patient, hereby consent to submit to urine drug screening (UDS) as part of my treatment program. I understand and agree to the following:

1. PURPOSE OF TESTING
Drug screening is an essential part of medication-assisted treatment. Testing helps:
• Monitor treatment progress and medication compliance
• Ensure patient safety
• Identify potential substance use issues early
• Adjust treatment plans as needed
• Meet regulatory requirements

2. TESTING PROCEDURES
I understand that:
• I may be asked to provide a urine sample at any scheduled or random appointment
• Collection may be directly observed to ensure sample integrity
• Samples will be tested for opioids, amphetamines, benzodiazepines, cocaine, THC, and other substances
• Positive results may require confirmation testing at an outside laboratory
• I must disclose all prescription and over-the-counter medications before testing

3. USE OF RESULTS
I understand that drug screen results:
• Will be documented in my medical record
• Will be reviewed by my treatment team
• May affect my treatment plan, including take-home medication privileges
• Will NOT be shared with law enforcement without my consent or court order
• Are protected under 42 CFR Part 2 confidentiality regulations`,
      acknowledgments: [
        "I consent to random and scheduled urine drug screening",
        "I understand testing may be directly observed",
        "I will disclose all medications before testing",
        "I understand how results will be used",
        "I understand the consequences of positive results or refusal",
      ],
    },
  ]

  // Anonymous screening form state
  const [screeningData, setScreeningData] = useState({
    readinessLevel: "",
    primaryConcern: "",
    substanceHistory: [] as string[],
    treatmentGoals: [] as string[],
    specialNeeds: [] as string[],
    contactRequested: false,
    contactMethod: "",
    contactInfo: "",
    preferredTime: "",
    additionalNotes: "",
  })

  const handleScreeningSubmit = async () => {
    try {
      const response = await fetch("/api/community-outreach/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screening_type: "general",
          responses: screeningData,
          total_score: 0,
          severity_level: "moderate",
          recommendations: [],
          resources_provided: [],
          follow_up_requested: screeningData.contactRequested,
          follow_up_email: screeningData.contactMethod === "email" ? screeningData.contactInfo : undefined,
          follow_up_phone: screeningData.contactMethod === "phone" ? screeningData.contactInfo : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit screening")

      toast.success("Screening submitted successfully. If you requested contact, our team will reach out within 24 hours.")
      setScreeningStep(1)
      setScreeningData({
        readinessLevel: "",
        primaryConcern: "",
        substanceHistory: [],
        treatmentGoals: [],
        specialNeeds: [],
        contactRequested: false,
        contactMethod: "",
        contactInfo: "",
        preferredTime: "",
        additionalNotes: "",
      })
      setActiveTab("home")
    } catch (error: any) {
      console.error("[MASE Access] Error submitting screening:", error)
      toast.error("Failed to submit screening. Please try again.")
    }
  }

  const getConsentProgress = () => {
    const requiredForms = consentForms.filter((f) => f.required)
    const signedRequired = requiredForms.filter((f) => signedConsents[f.id])
    if (requiredForms.length === 0) return 100
    return Math.round((signedRequired.length / requiredForms.length) * 100)
  }

  const allRequiredSigned = () => {
    return consentForms.filter((f) => f.required).every((f) => signedConsents[f.id])
  }

  // Admin Dashboard View
  if (showAdminDashboard) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button variant="ghost" onClick={() => setShowAdminDashboard(false)} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Public View
              </Button>
              <h1 className="text-2xl font-bold text-foreground">MASE Access - Outreach Dashboard</h1>
              <p className="text-muted-foreground">Manage incoming outreach leads and referrals</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Outreach Management</CardTitle>
              <CardDescription>View and manage referrals and screenings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/outreach">View Outreach Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/referral">View Referral Gateway</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/screening">View Screening Tools</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Public-Facing View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-600">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MASE Access</h1>
                <p className="text-sm text-muted-foreground">Community Outreach & Recovery Gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="tel:18007326837">
                  <Phone className="h-4 w-4 mr-2" />
                  1-800-RECOVERY
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdminDashboard(true)}>
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="home">
              <Home className="h-4 w-4 mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger value="screening">
              <HelpCircle className="h-4 w-4 mr-2" />
              Screening
            </TabsTrigger>
            <TabsTrigger value="referral">
              <Send className="h-4 w-4 mr-2" />
              Referral
            </TabsTrigger>
            <TabsTrigger value="consent">
              <FileText className="h-4 w-4 mr-2" />
              Consent Forms
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-teal-600" />
                    Welcome to MASE Access
                  </CardTitle>
                  <CardDescription>Your gateway to recovery and community support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    MASE Access provides a safe, confidential way to explore treatment options, complete screenings,
                    and connect with care. All services are HIPAA-compliant and protected under 42 CFR Part 2.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button asChild variant="outline" className="h-auto flex-col py-6">
                      <Link href="/screening">
                        <HelpCircle className="h-6 w-6 mb-2" />
                        <span className="font-medium">Free Screening</span>
                        <span className="text-xs text-muted-foreground mt-1">Anonymous mental health assessment</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto flex-col py-6">
                      <Link href="/referral">
                        <Send className="h-6 w-6 mb-2" />
                        <span className="font-medium">Request Referral</span>
                        <span className="text-xs text-muted-foreground mt-1">Connect with care professionals</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto flex-col py-6">
                      <a href="tel:988">
                        <Phone className="h-6 w-6 mb-2" />
                        <span className="font-medium">Crisis Support</span>
                        <span className="text-xs text-muted-foreground mt-1">988 Suicide & Crisis Lifeline</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/screening">Public Screening Tools</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/referral">Referral Gateway</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/community-outreach">Community Resources</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Immediate Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Emergency Services</p>
                        <a href="tel:911" className="text-sm text-muted-foreground hover:underline">
                          Call 911
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="font-medium">Crisis Line</p>
                        <a href="tel:988" className="text-sm text-muted-foreground hover:underline">
                          Call or Text 988
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Substance Abuse Hotline</p>
                        <a href="tel:18006624357" className="text-sm text-muted-foreground hover:underline">
                          1-800-662-HELP
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Screening Tab */}
          <TabsContent value="screening">
            <Card>
              <CardHeader>
                <CardTitle>Anonymous Screening</CardTitle>
                <CardDescription>
                  Complete a confidential assessment to better understand your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {screeningStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>How ready are you to start treatment?</Label>
                      <Select
                        value={screeningData.readinessLevel}
                        onValueChange={(value) => setScreeningData({ ...screeningData, readinessLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your readiness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready">Ready to start now</SelectItem>
                          <SelectItem value="considering">Considering treatment</SelectItem>
                          <SelectItem value="exploring">Just exploring options</SelectItem>
                          <SelectItem value="not-ready">Not ready yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Concern</Label>
                      <Textarea
                        placeholder="What brings you here today?"
                        value={screeningData.primaryConcern}
                        onChange={(e) => setScreeningData({ ...screeningData, primaryConcern: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Would you like us to contact you?</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contact-request"
                          checked={screeningData.contactRequested}
                          onCheckedChange={(checked) =>
                            setScreeningData({ ...screeningData, contactRequested: checked as boolean })
                          }
                        />
                        <Label htmlFor="contact-request" className="text-sm font-normal">
                          Yes, I would like to be contacted
                        </Label>
                      </div>
                    </div>
                    {screeningData.contactRequested && (
                      <div className="space-y-2">
                        <Label>Preferred Contact Method</Label>
                        <Select
                          value={screeningData.contactMethod}
                          onValueChange={(value) => setScreeningData({ ...screeningData, contactMethod: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder={screeningData.contactMethod === "phone" ? "Phone number" : "Email address"}
                          value={screeningData.contactInfo}
                          onChange={(e) => setScreeningData({ ...screeningData, contactInfo: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleScreeningSubmit} className="bg-teal-600 hover:bg-teal-700">
                        Submit Screening
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral">
            <Card>
              <CardHeader>
                <CardTitle>Request a Referral</CardTitle>
                <CardDescription>Connect with our care team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Use our referral gateway to connect with care. You can refer yourself, a family member, or as a
                    professional.
                  </p>
                  <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                    <Link href="/referral">
                      Go to Referral Gateway
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent Forms Tab */}
          <TabsContent value="consent">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consent Forms</CardTitle>
                  <CardDescription>Review and acknowledge required consent forms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{getConsentProgress()}%</span>
                    </div>
                    <Progress value={getConsentProgress()} className="h-2" />
                  </div>
                  <div className="space-y-4">
                    {consentForms.map((form) => (
                      <Card key={form.id} className={signedConsents[form.id] ? "border-green-500" : ""}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{form.title}</CardTitle>
                              <CardDescription>{form.description}</CardDescription>
                            </div>
                            {signedConsents[form.id] && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Signed
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="max-h-60 overflow-y-auto rounded-lg border p-4 text-sm">
                              <pre className="whitespace-pre-wrap font-sans">{form.content}</pre>
                            </div>
                            {!signedConsents[form.id] && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Patient Initials</Label>
                                  <Input
                                    value={patientInitials}
                                    onChange={(e) => setPatientInitials(e.target.value)}
                                    placeholder="Enter your initials"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Signature Date</Label>
                                  <Input
                                    type="date"
                                    value={consentDate}
                                    onChange={(e) => setConsentDate(e.target.value)}
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    if (!patientInitials || !consentDate) {
                                      toast.error("Please complete all required fields")
                                      return
                                    }
                                    setSignedConsents({ ...signedConsents, [form.id]: true })
                                    toast.success("Consent form signed")
                                  }}
                                  className="w-full bg-teal-600 hover:bg-teal-700"
                                >
                                  Sign Consent Form
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
