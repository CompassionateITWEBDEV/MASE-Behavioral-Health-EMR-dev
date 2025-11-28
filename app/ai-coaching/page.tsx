"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  BookOpen,
  Award,
  Clock,
  FileCheck,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  ClipboardCheck,
  Loader2,
  Play,
  Shield,
  Building2,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Printer,
  User,
  Send,
  Bot,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface TrainingModule {
  id: string
  module_code?: string
  name: string
  description: string
  ceu_hours: number
  duration_minutes: number
  is_required: boolean
  frequency: string
  category: string
  regulatory_source?: string
  passing_score?: number
  content?: any[]
  quiz_questions?: any[]
  completed?: boolean
  completedDate?: string
  certificateNumber?: string
  certificateExpiresAt?: string
  ceuHoursEarned?: number
  quizScore?: number
  progress?: number
  dueDate?: string
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  role: string
  department: string
  email: string
  training: TrainingModule[]
  completionRate: number
  completedModules: number
  totalModules: number
  totalCeuEarned: number
  totalCeuRequired: number
  overdue: number
  certificates: any[]
}

interface RegulatoryUpdate {
  id: string
  source: string
  update_type: string
  title: string
  summary: string
  effective_date: string
  compliance_deadline: string
  priority: string
  requires_training: boolean
  acknowledgment_required: boolean
}

const defaultTrainingModules: TrainingModule[] = [
  {
    id: "hipaa",
    module_code: "HIPAA-001",
    name: "HIPAA Privacy & Security",
    description:
      "Comprehensive training on privacy and security of protected health information under HIPAA regulations.",
    ceu_hours: 2.0,
    duration_minutes: 120,
    is_required: true,
    frequency: "annual",
    category: "compliance",
    regulatory_source: "HHS/OCR",
    passing_score: 80,
  },
  {
    id: "42cfr",
    module_code: "42CFR-001",
    name: "42 CFR Part 2 Confidentiality",
    description:
      "Federal regulations protecting substance use disorder patient records and confidentiality requirements.",
    ceu_hours: 3.0,
    duration_minutes: 180,
    is_required: true,
    frequency: "annual",
    category: "compliance",
    regulatory_source: "42 CFR Part 2",
    passing_score: 85,
  },
  {
    id: "joint-commission",
    module_code: "JC-001",
    name: "Joint Commission Standards",
    description: "Accreditation standards, survey preparation, and continuous quality improvement requirements.",
    ceu_hours: 4.0,
    duration_minutes: 240,
    is_required: true,
    frequency: "annual",
    category: "compliance",
    regulatory_source: "Joint Commission",
    passing_score: 80,
  },
  {
    id: "samhsa",
    module_code: "SAMHSA-001",
    name: "SAMHSA OTP Guidelines",
    description:
      "SAMHSA guidelines for Opioid Treatment Programs including patient care standards and regulatory requirements.",
    ceu_hours: 4.0,
    duration_minutes: 240,
    is_required: true,
    frequency: "annual",
    category: "clinical",
    regulatory_source: "SAMHSA",
    passing_score: 85,
  },
  {
    id: "michigan",
    module_code: "MI-001",
    name: "Michigan State OTP Regulations",
    description: "State of Michigan LARA requirements for substance abuse treatment facilities and OTP licensing.",
    ceu_hours: 2.5,
    duration_minutes: 150,
    is_required: true,
    frequency: "annual",
    category: "policy",
    regulatory_source: "Michigan LARA",
    passing_score: 80,
  },
  {
    id: "dea",
    module_code: "DEA-001",
    name: "DEA Controlled Substance Regulations",
    description: "DEA requirements for controlled substances handling, documentation, and security in OTP settings.",
    ceu_hours: 3.0,
    duration_minutes: 180,
    is_required: true,
    frequency: "annual",
    category: "compliance",
    regulatory_source: "DEA",
    passing_score: 85,
  },
  {
    id: "suicide-prevention",
    module_code: "SP-001",
    name: "Suicide Risk Assessment",
    description:
      "Columbia Suicide Severity Rating Scale (C-SSRS) and suicide prevention protocols in behavioral health.",
    ceu_hours: 2.0,
    duration_minutes: 120,
    is_required: true,
    frequency: "annual",
    category: "clinical",
    regulatory_source: "Joint Commission",
    passing_score: 85,
  },
  {
    id: "emergency-response",
    module_code: "ER-001",
    name: "Overdose Response & Naloxone",
    description: "Emergency response protocols and Narcan/naloxone administration for opioid overdose situations.",
    ceu_hours: 1.5,
    duration_minutes: 90,
    is_required: true,
    frequency: "biannual",
    category: "safety",
    regulatory_source: "SAMHSA",
    passing_score: 90,
  },
]

export default function AICoachingPage() {
  const [activeTab, setActiveTab] = useState("education")
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [qaDocumentType, setQaDocumentType] = useState("soap_note")
  const [qaContent, setQaContent] = useState("")
  const [qaResult, setQaResult] = useState<any>(null)
  const [isQaLoading, setIsQaLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Training module state
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [quizMode, setQuizMode] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  // Certificate dialog
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  // Fetch staff education data
  const {
    data: educationData,
    error: educationError,
    isLoading: educationLoading,
    mutate: mutateEducation,
  } = useSWR("/api/staff-education", fetcher)

  const selectedStaff = educationData?.staff?.find((s: StaffMember) => s.id === selectedStaffId)

  const trainingModules = selectedStaff?.training || educationData?.modules || defaultTrainingModules

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto-select first staff member
  useEffect(() => {
    if (educationData?.staff?.length > 0 && !selectedStaffId) {
      setSelectedStaffId(educationData.staff[0].id)
    }
  }, [educationData, selectedStaffId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-coaching/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2))
                assistantContent += text
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)),
                )
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      toast.error("Failed to get AI response")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQaReview = async () => {
    if (!qaContent.trim()) {
      toast.error("Please enter document content to review")
      return
    }

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
      toast.success("QA Review completed")
    } catch (error) {
      console.error("QA Review failed:", error)
      toast.error("QA Review failed")
    } finally {
      setIsQaLoading(false)
    }
  }

  const handleStartTraining = (module: TrainingModule) => {
    setSelectedModule(module)
    setCurrentStep(0)
    setQuizMode(false)
    setQuizAnswers([])
    setQuizSubmitted(false)
    setQuizScore(0)
    setTrainingDialogOpen(true)

    // Log training start
    if (selectedStaffId) {
      fetch("/api/staff-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_training",
          staffId: selectedStaffId,
          moduleId: module.id || module.module_code,
        }),
      }).catch(console.error)
    }
  }

  const getModuleContent = (moduleId: string) => {
    const contentMap: Record<
      string,
      { content: string[]; quiz: { question: string; options: string[]; correct: number }[] }
    > = {
      hipaa: {
        content: [
          "HIPAA Overview: The Health Insurance Portability and Accountability Act establishes national standards for protecting sensitive patient health information. PHI includes any information that can identify a patient.",
          "Privacy Rule: Governs use and disclosure of PHI. Covered entities must obtain patient authorization before disclosing PHI except for treatment, payment, or healthcare operations.",
          "Security Rule: Requires administrative, physical, and technical safeguards to protect electronic PHI. This includes access controls, encryption, and audit trails.",
          "Breach Notification: Organizations must notify affected individuals within 60 days of discovering a breach. HHS must be notified for breaches affecting 500+ individuals.",
          "Patient Rights: Patients have the right to access their records, request amendments, and receive an accounting of disclosures. OTPs must accommodate these requests.",
          "Minimum Necessary: Only access or disclose the minimum PHI necessary to accomplish the intended purpose. Avoid casual conversations about patients.",
        ],
        quiz: [
          {
            question: "What does PHI stand for?",
            options: [
              "Personal Health Insurance",
              "Protected Health Information",
              "Private Hospital Information",
              "Patient Health Index",
            ],
            correct: 1,
          },
          {
            question: "How soon must patients be notified of a breach?",
            options: ["30 days", "60 days", "90 days", "1 year"],
            correct: 1,
          },
          {
            question: "Which is NOT a patient right under HIPAA?",
            options: ["Access records", "Request amendments", "Free healthcare", "Accounting of disclosures"],
            correct: 2,
          },
        ],
      },
      "42cfr": {
        content: [
          "42 CFR Part 2 Overview: Federal regulations providing additional confidentiality protections for patients receiving substance use disorder treatment. More restrictive than HIPAA.",
          "Patient Consent Requirements: Written consent is required before disclosing any information that would identify a patient as receiving SUD treatment. Consent must be specific and time-limited.",
          "Prohibited Re-Disclosure Notice: All disclosures must include a notice that recipients cannot further disclose the information without additional patient consent.",
          "Exceptions to Consent: Medical emergencies, crimes on program premises, child abuse reporting, qualified service organization agreements, and certain research activities.",
          "Audit and Evaluation: Certain governmental agencies may access records for audit purposes but cannot re-disclose patient identifying information.",
          "Court Orders: Unlike HIPAA, a court order is required for disclosure in legal proceedings. Subpoenas alone are insufficient.",
        ],
        quiz: [
          {
            question: "42 CFR Part 2 protects patients receiving treatment for:",
            options: ["All medical conditions", "Mental health only", "Substance use disorders", "Infectious diseases"],
            correct: 2,
          },
          {
            question: "What must accompany every 42 CFR Part 2 disclosure?",
            options: ["Payment", "Re-disclosure notice", "Court order", "HIPAA form"],
            correct: 1,
          },
          {
            question: "Which alone is NOT sufficient for disclosure under 42 CFR Part 2?",
            options: ["Patient consent", "Medical emergency", "Subpoena", "Court order"],
            correct: 2,
          },
        ],
      },
      "joint-commission": {
        content: [
          "Joint Commission Overview: The Joint Commission accredits and certifies healthcare organizations. OTPs must meet behavioral health standards for accreditation.",
          "Patient Safety Goals: Include proper patient identification, medication safety, infection prevention, and suicide risk assessment for behavioral health settings.",
          "Environment of Care: Facilities must maintain a safe physical environment, emergency procedures, and hazardous materials management.",
          "Documentation Standards: Clinical records must be complete, accurate, and timely. Treatment plans, progress notes, and discharge summaries have specific requirements.",
          "Performance Improvement: Organizations must have ongoing quality improvement programs with measurable outcomes and action plans.",
          "Survey Readiness: Maintain continuous compliance. Tracers follow patient care processes to verify standards are consistently met.",
        ],
        quiz: [
          {
            question: "How often should treatment plans be reviewed according to Joint Commission?",
            options: ["Weekly", "Monthly", "Based on patient needs", "Annually"],
            correct: 2,
          },
          {
            question: "What is a 'tracer' in Joint Commission surveys?",
            options: ["Medication tracking", "Following patient care process", "Staff monitoring", "Financial audit"],
            correct: 1,
          },
          {
            question: "Which is a National Patient Safety Goal for behavioral health?",
            options: ["Cost reduction", "Suicide risk assessment", "Staff scheduling", "Marketing compliance"],
            correct: 1,
          },
        ],
      },
      samhsa: {
        content: [
          "SAMHSA OTP Certification: OTPs must be certified by SAMHSA and registered with DEA to dispense opioid agonist medications for opioid use disorder treatment.",
          "Admission Criteria: Patients must have been addicted to opioids for at least one year, with exceptions for pregnant women, recently incarcerated, and prior patients.",
          "Treatment Requirements: Comprehensive services must include medical, counseling, vocational, educational, and other assessment and treatment services.",
          "Take-Home Medications: Criteria based on time in treatment, absence of recent drug use, regular clinic attendance, no behavioral problems, and stable home environment.",
          "Dosing Requirements: Initial doses should not exceed 30mg on day one unless documentation supports higher dose. Dose increases should be gradual.",
          "Diversion Control: Programs must have policies to prevent diversion including supervised dosing, random callbacks, and bottle counts.",
        ],
        quiz: [
          {
            question: "What is the minimum addiction period for OTP admission?",
            options: ["6 months", "1 year", "2 years", "No minimum"],
            correct: 1,
          },
          {
            question: "What is the maximum initial methadone dose on day one?",
            options: ["20mg", "30mg", "40mg", "No limit"],
            correct: 1,
          },
          {
            question: "Who is exempt from the one-year addiction requirement?",
            options: ["Veterans", "Pregnant women", "Seniors", "First-time patients"],
            correct: 1,
          },
        ],
      },
      michigan: {
        content: [
          "Michigan LARA Licensing: Michigan LARA (Licensing and Regulatory Affairs) oversees substance abuse treatment facility licensing in Michigan.",
          "Staff Requirements: Licensed facilities must maintain appropriate staff-to-patient ratios and ensure staff have proper credentials and training.",
          "Treatment Standards: Michigan requires individualized treatment planning, regular assessments, and documented progress toward treatment goals.",
          "Patient Rights: Michigan law provides specific protections including informed consent, grievance procedures, and protection from abuse and neglect.",
          "Reporting Requirements: Facilities must report certain incidents to LARA including deaths, serious injuries, and abuse allegations.",
          "Quality Assurance: Licensed programs must have quality assurance programs with peer review, utilization review, and outcome measurement.",
        ],
        quiz: [
          {
            question: "What agency oversees Michigan substance abuse licensing?",
            options: ["SAMHSA", "DEA", "LARA", "CDC"],
            correct: 2,
          },
          {
            question: "What must be reported to LARA?",
            options: ["All patient admissions", "Staff vacations", "Serious incidents and deaths", "Daily census"],
            correct: 2,
          },
          {
            question: "Michigan requires treatment plans to be:",
            options: ["Standardized", "Individualized", "Optional", "Verbal only"],
            correct: 1,
          },
        ],
      },
      dea: {
        content: [
          "DEA Registration: OTPs must have DEA registration to handle controlled substances. Each registered location requires separate registration.",
          "Schedule II Substances: Methadone is Schedule II. Requires strict inventory controls, secure storage, and detailed recordkeeping.",
          "Record Keeping: DEA requires perpetual inventory with records of all receipts and dispensing. Records must be maintained for two years.",
          "Security Requirements: Controlled substances must be stored in substantially constructed, securely locked cabinets or safes.",
          "Ordering and Receiving: Schedule II substances require DEA Form 222 or electronic equivalent (CSOS) for ordering.",
          "Theft and Loss Reporting: Any theft or significant loss must be reported to DEA within one business day using DEA Form 106.",
        ],
        quiz: [
          {
            question: "What DEA schedule is methadone?",
            options: ["Schedule I", "Schedule II", "Schedule III", "Schedule IV"],
            correct: 1,
          },
          {
            question: "How long must DEA records be maintained?",
            options: ["1 year", "2 years", "5 years", "10 years"],
            correct: 1,
          },
          {
            question: "What form is required for Schedule II ordering?",
            options: ["DEA 106", "DEA 222", "DEA 41", "DEA 224"],
            correct: 1,
          },
        ],
      },
      "suicide-prevention": {
        content: [
          "Columbia Protocol (C-SSRS): Standardized suicide risk assessment tool that evaluates suicidal ideation, intensity, and behavior.",
          "Risk Factors: Previous attempts, substance use, hopelessness, access to lethal means, recent losses, isolation, and psychiatric diagnosis.",
          "Protective Factors: Strong social support, problem-solving skills, treatment engagement, reasons for living, and restricted access to lethal means.",
          "Assessment Frequency: Screen at intake, when risk indicators present, during crisis, and at care transitions.",
          "Documentation Requirements: Document risk level, protective factors, interventions, and safety planning. Update as status changes.",
          "Safety Planning: Collaborative development of warning signs, coping strategies, support contacts, and means restriction with the patient.",
        ],
        quiz: [
          {
            question: "What does C-SSRS assess?",
            options: ["Depression only", "Anxiety levels", "Suicidal ideation and behavior", "Substance use"],
            correct: 2,
          },
          {
            question: "Which is a protective factor against suicide?",
            options: ["Isolation", "Previous attempts", "Strong social support", "Access to means"],
            correct: 2,
          },
          {
            question: "When should suicide screening occur?",
            options: ["Only at intake", "Only during crisis", "At multiple points in care", "Only at discharge"],
            correct: 2,
          },
        ],
      },
      "emergency-response": {
        content: [
          "Recognizing Opioid Overdose: Signs include unresponsive to stimuli, slow/shallow/no breathing, blue or grayish skin (especially lips and fingertips), pinpoint pupils.",
          "Initial Response Steps: 1. Check responsiveness (sternal rub). 2. Call 911. 3. Administer naloxone. 4. Provide rescue breathing if needed. 5. Place in recovery position.",
          "Naloxone Administration: Intranasal: 4mg spray in one nostril. IM: 0.4-2mg in shoulder or thigh. May repeat every 2-3 minutes if no response.",
          "Post-Naloxone Care: Monitor for re-sedation as naloxone wears off faster than opioids. Patient may experience withdrawal symptoms. Do not leave patient alone.",
          "Documentation Requirements: Document time of discovery, symptoms observed, interventions provided, naloxone doses given, patient response, and disposition.",
          "Good Samaritan Laws: Michigan has Good Samaritan protections for individuals who call 911 for overdoses.",
        ],
        quiz: [
          { question: "What is the dose of intranasal naloxone?", options: ["2mg", "4mg", "8mg", "0.4mg"], correct: 1 },
          {
            question: "How soon can you repeat a naloxone dose?",
            options: ["Every 30 seconds", "Every 2-3 minutes", "Every 10 minutes", "Only once"],
            correct: 1,
          },
          {
            question: "Why monitor patients after naloxone administration?",
            options: [
              "Allergic reactions",
              "Re-sedation as naloxone wears off",
              "Infection risk",
              "Legal requirements only",
            ],
            correct: 1,
          },
        ],
      },
    }

    const key = moduleId.toLowerCase().replace(/-001$/, "").replace("42cfr", "42cfr")
    return contentMap[key] || { content: ["Training content not available."], quiz: [] }
  }

  const handleNextStep = () => {
    const moduleContent = getModuleContent(selectedModule?.module_code || selectedModule?.id || "")

    if (!quizMode && currentStep < moduleContent.content.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else if (!quizMode && currentStep === moduleContent.content.length - 1) {
      setQuizMode(true)
      setCurrentStep(0)
    } else if (quizMode && currentStep < moduleContent.quiz.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    } else if (quizMode) {
      const moduleContent = getModuleContent(selectedModule?.module_code || selectedModule?.id || "")
      setQuizMode(false)
      setCurrentStep(moduleContent.content.length - 1)
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers]
    newAnswers[currentStep] = answerIndex
    setQuizAnswers(newAnswers)
  }

  const handleSubmitQuiz = async () => {
    const moduleContent = getModuleContent(selectedModule?.module_code || selectedModule?.id || "")
    let correct = 0
    moduleContent.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++
    })
    const score = Math.round((correct / moduleContent.quiz.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    if (selectedStaffId && selectedModule) {
      try {
        const response = await fetch("/api/staff-education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_training",
            staffId: selectedStaffId,
            moduleId: selectedModule.id || selectedModule.module_code,
            quizScore: score,
          }),
        })
        const result = await response.json()

        if (result.passed) {
          toast.success(`Congratulations! You passed with ${score}%. Certificate: ${result.certificateNumber}`)
        } else {
          toast.error(`Score: ${score}%. Required: ${selectedModule.passing_score || 80}%. Please retake the training.`)
        }
        mutateEducation()
      } catch (error) {
        toast.error("Failed to save completion")
      }
    }
  }

  const handleViewCertificate = (cert: any) => {
    setSelectedCertificate(cert)
    setCertificateDialogOpen(true)
  }

  const handlePrintCertificate = () => {
    window.print()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "compliance":
        return <Shield className="h-4 w-4" />
      case "clinical":
        return <FileCheck className="h-4 w-4" />
      case "safety":
        return <AlertTriangle className="h-4 w-4" />
      case "policy":
        return <Building2 className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      SAMHSA: "bg-blue-100 text-blue-800",
      "Joint Commission": "bg-purple-100 text-purple-800",
      DEA: "bg-red-100 text-red-800",
      "Michigan LARA": "bg-green-100 text-green-800",
      "42 CFR Part 2": "bg-orange-100 text-orange-800",
      "HHS/OCR": "bg-indigo-100 text-indigo-800",
    }
    return <Badge className={colors[source] || "bg-gray-100 text-gray-800"}>{source}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High Priority</Badge>
      case "normal":
        return <Badge variant="secondary">Normal</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Coaching & Staff Education</h1>
              <p className="text-muted-foreground mt-2">
                AI-powered coaching, regulatory compliance training, and CEU certification
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Staff Member" />
                </SelectTrigger>
                <SelectContent>
                  {educationData?.staff?.map((s: StaffMember) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {s.first_name} {s.last_name} - {s.role}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Overview */}
          {educationLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : selectedStaff ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{selectedStaff.completionRate}%</p>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{selectedStaff.totalCeuEarned?.toFixed(1) || 0}</p>
                      <p className="text-xs text-muted-foreground">CEU Hours Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{selectedStaff.certificates?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Certificates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {selectedStaff.completedModules}/{selectedStaff.totalModules}
                      </p>
                      <p className="text-xs text-muted-foreground">Modules Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{selectedStaff.overdue || 0}</p>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{trainingModules.length}</p>
                      <p className="text-xs text-muted-foreground">Training Modules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {trainingModules.reduce((sum: number, m: TrainingModule) => sum + m.ceu_hours, 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total CEU Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {trainingModules.filter((m: TrainingModule) => m.is_required).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Required Modules</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-xs text-muted-foreground">Regulatory Sources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">AI</p>
                      <p className="text-xs text-muted-foreground">Coaching Ready</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Tabs - Added AI Coaching tab */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="coaching" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI Coach</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="regulatory" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Updates</span>
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Doc QA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coaching" className="space-y-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Clinical Coach
                  </CardTitle>
                  <CardDescription>
                    Ask questions about OTP regulations, clinical protocols, documentation, SAMHSA guidelines, Joint
                    Commission standards, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Welcome to AI Clinical Coach</p>
                          <p className="text-sm mt-2">Ask me about:</p>
                          <div className="grid grid-cols-2 gap-2 mt-4 max-w-md mx-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setInputValue("What are the take-home medication criteria under SAMHSA guidelines?")
                              }
                            >
                              Take-home criteria
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("Explain 42 CFR Part 2 consent requirements")}
                            >
                              42 CFR Part 2
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("What are Joint Commission documentation standards?")}
                            >
                              JC Standards
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputValue("How do I properly document a COWS assessment?")}
                            >
                              COWS Documentation
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
                                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {message.role === "assistant" ? (
                                  <Bot className="h-4 w-4" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                                <span className="text-xs font-medium">
                                  {message.role === "assistant" ? "AI Coach" : "You"}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
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
                      placeholder="Ask about regulations, protocols, documentation..."
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

            {/* Training Modules Tab - Now uses trainingModules variable with fallback */}
            <TabsContent value="education" className="space-y-4">
              {educationLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : trainingModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainingModules.map((module: TrainingModule) => (
                    <Card
                      key={module.id || module.module_code}
                      className={module.completed ? "border-green-200 bg-green-50/50" : ""}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(module.category)}
                            <CardTitle className="text-base">{module.name}</CardTitle>
                          </div>
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : module.dueDate && new Date(module.dueDate) < new Date() ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {getSourceBadge(module.regulatory_source || "")}
                          <Badge variant="outline">{module.ceu_hours} CEU</Badge>
                          <Badge variant="outline">{module.duration_minutes} min</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

                        {module.completed ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Completed:</span>
                              <span>
                                {module.completedDate ? new Date(module.completedDate).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Score:</span>
                              <span className="font-medium">{module.quizScore}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">CEU Earned:</span>
                              <span className="font-medium">{module.ceuHoursEarned} hours</span>
                            </div>
                            {module.certificateNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 bg-transparent"
                                onClick={() =>
                                  handleViewCertificate({
                                    moduleName: module.name,
                                    certificateNumber: module.certificateNumber,
                                    issuedAt: module.completedDate,
                                    expiresAt: module.certificateExpiresAt,
                                    ceuHours: module.ceuHoursEarned,
                                  })
                                }
                              >
                                <Award className="h-4 w-4 mr-2" />
                                View Certificate
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {module.progress && module.progress > 0 ? (
                              <>
                                <Progress value={module.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">{module.progress}% complete</p>
                              </>
                            ) : null}
                            <Button className="w-full" onClick={() => handleStartTraining(module)}>
                              <Play className="h-4 w-4 mr-2" />
                              {module.progress && module.progress > 0 ? "Continue" : "Start"} Training
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No Training Modules Available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please contact your administrator to set up training modules.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-4">
              {selectedStaff?.certificates?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStaff.certificates.map((cert: any, idx: number) => (
                    <Card key={idx} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{cert.moduleName}</h3>
                            <p className="text-sm text-muted-foreground">Certificate: {cert.certificateNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              Issued: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires: {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString() : "N/A"}
                            </p>
                            <p className="text-sm font-medium mt-2">CEU Hours: {cert.ceuHours}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewCertificate(cert)}>
                            <Printer className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No Certificates Yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete training modules with a passing score to earn certificates.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Regulatory Updates Tab */}
            <TabsContent value="regulatory" className="space-y-4">
              {educationData?.regulatoryUpdates?.length > 0 ? (
                <div className="space-y-4">
                  {educationData.regulatoryUpdates.map((update: RegulatoryUpdate) => (
                    <Card key={update.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{update.title}</CardTitle>
                            <CardDescription>
                              {update.source} - {update.update_type}
                            </CardDescription>
                          </div>
                          {getPriorityBadge(update.priority)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{update.summary}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {update.effective_date && (
                            <div>
                              <span className="text-muted-foreground">Effective: </span>
                              <span>{new Date(update.effective_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {update.compliance_deadline && (
                            <div>
                              <span className="text-muted-foreground">Deadline: </span>
                              <span className="text-red-600 font-medium">
                                {new Date(update.compliance_deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          {update.requires_training && (
                            <Badge className="bg-blue-100 text-blue-800">Training Required</Badge>
                          )}
                          {update.acknowledgment_required && (
                            <Badge className="bg-orange-100 text-orange-800">Acknowledgment Required</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No Regulatory Updates</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      New updates from SAMHSA, Joint Commission, DEA, and Michigan LARA will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documentation QA Tab */}
            <TabsContent value="qa" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Review</CardTitle>
                    <CardDescription>
                      Paste clinical documentation for AI-powered quality review against Joint Commission standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={qaDocumentType} onValueChange={setQaDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soap_note">SOAP Note</SelectItem>
                        <SelectItem value="progress_note">Progress Note</SelectItem>
                        <SelectItem value="intake_assessment">Intake Assessment</SelectItem>
                        <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                        <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Paste your clinical documentation here..."
                      className="min-h-[300px]"
                      value={qaContent}
                      onChange={(e) => setQaContent(e.target.value)}
                    />

                    <Button onClick={handleQaReview} disabled={isQaLoading} className="w-full">
                      {isQaLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Reviewing...
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
                    <CardDescription>Compliance findings and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qaResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-primary">{qaResult.overallScore || 85}%</p>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                          </div>
                          <div className="flex-1">
                            <Progress value={qaResult.overallScore || 85} className="h-3" />
                          </div>
                        </div>

                        {qaResult.findings && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Findings:</h4>
                            <ul className="text-sm space-y-1">
                              {qaResult.findings.map((finding: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {qaResult.recommendations && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Recommendations:</h4>
                            <ul className="text-sm space-y-1">
                              {qaResult.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Submit documentation to see QA results</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Training Module Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedModule?.name}</DialogTitle>
            <DialogDescription>
              {quizMode ? "Knowledge Assessment" : "Training Content"} - {selectedModule?.regulatory_source}
            </DialogDescription>
          </DialogHeader>

          {selectedModule && (
            <div className="space-y-4">
              {!quizSubmitted ? (
                <>
                  {!quizMode ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline">
                            Step {currentStep + 1} of{" "}
                            {getModuleContent(selectedModule.module_code || selectedModule.id).content.length}
                          </Badge>
                        </div>
                        <p className="text-base leading-relaxed">
                          {getModuleContent(selectedModule.module_code || selectedModule.id).content[currentStep]}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline">
                            Question {currentStep + 1} of{" "}
                            {getModuleContent(selectedModule.module_code || selectedModule.id).quiz.length}
                          </Badge>
                        </div>
                        <p className="text-lg font-medium mb-4">
                          {
                            getModuleContent(selectedModule.module_code || selectedModule.id).quiz[currentStep]
                              ?.question
                          }
                        </p>
                        <div className="space-y-2">
                          {getModuleContent(selectedModule.module_code || selectedModule.id).quiz[
                            currentStep
                          ]?.options.map((option: string, idx: number) => (
                            <Button
                              key={idx}
                              variant={quizAnswers[currentStep] === idx ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => handleQuizAnswer(idx)}
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0 && !quizMode}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {quizMode &&
                    currentStep ===
                      getModuleContent(selectedModule.module_code || selectedModule.id).quiz.length - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={
                          quizAnswers.length <
                          getModuleContent(selectedModule.module_code || selectedModule.id).quiz.length
                        }
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button onClick={handleNextStep}>
                        {!quizMode &&
                        currentStep ===
                          getModuleContent(selectedModule.module_code || selectedModule.id).content.length - 1
                          ? "Start Quiz"
                          : "Next"}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  {quizScore >= (selectedModule.passing_score || 80) ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-600">Congratulations!</h3>
                      <p className="text-lg mt-2">You scored {quizScore}%</p>
                      <p className="text-muted-foreground mt-2">
                        You have earned {selectedModule.ceu_hours} CEU hours and a completion certificate.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-red-600">Not Passed</h3>
                      <p className="text-lg mt-2">You scored {quizScore}%</p>
                      <p className="text-muted-foreground mt-2">
                        Required score: {selectedModule.passing_score || 80}%. Please retake the training.
                      </p>
                    </>
                  )}
                  <Button className="mt-6" onClick={() => setTrainingDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <div className="border-4 border-double border-primary p-8 text-center print:border-black">
            <Award className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-serif font-bold mb-2">Certificate of Completion</h2>
            <p className="text-lg text-muted-foreground mb-6">This certifies that</p>
            <p className="text-2xl font-semibold mb-6">
              {selectedStaff?.first_name} {selectedStaff?.last_name}
            </p>
            <p className="text-lg text-muted-foreground mb-2">has successfully completed</p>
            <p className="text-xl font-semibold mb-6">{selectedCertificate?.moduleName}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-muted-foreground">Certificate Number</p>
                <p className="font-medium">{selectedCertificate?.certificateNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CEU Hours Earned</p>
                <p className="font-medium">{selectedCertificate?.ceuHours}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issue Date</p>
                <p className="font-medium">
                  {selectedCertificate?.issuedAt ? new Date(selectedCertificate.issuedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Expiration Date</p>
                <p className="font-medium">
                  {selectedCertificate?.expiresAt
                    ? new Date(selectedCertificate.expiresAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setCertificateDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintCertificate}>
              <Printer className="h-4 w-4 mr-2" />
              Print Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
