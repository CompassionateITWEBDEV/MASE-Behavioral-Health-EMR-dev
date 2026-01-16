"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Calendar, User, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { ASAMDimensions } from "@/types/clinical"

interface ASAMAssessmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assessment: {
    id: string
    patient_id?: string
    provider_id?: string
    assessment_type: string
    risk_assessment?: {
      asam_dimensions?: ASAMDimensions
      recommended_level?: string
      suggested_level?: string | null
      suggestion_overridden?: boolean
    } | null
    chief_complaint?: string | null
    created_at: string
    updated_at?: string | null
  } | null
  providerName?: string
}

// Dimension metadata for display
const DIMENSION_INFO = {
  dimension1: {
    title: "Dimension 1: Acute Intoxication & Withdrawal Potential",
    color: "bg-blue-500",
    severityLabels: {
      0: "No withdrawal risk",
      1: "Minimal withdrawal risk",
      2: "Moderate withdrawal risk",
      3: "Severe withdrawal risk requiring medical supervision",
    },
  },
  dimension2: {
    title: "Dimension 2: Biomedical Conditions & Complications",
    color: "bg-green-500",
    severityLabels: {
      0: "No biomedical issues",
      1: "Stable chronic conditions",
      2: "Requires monitoring",
      3: "Requires intensive medical management",
    },
  },
  dimension3: {
    title: "Dimension 3: Emotional/Behavioral/Cognitive Conditions",
    color: "bg-purple-500",
    severityLabels: {
      0: "No emotional/behavioral issues",
      1: "Stable mental health condition",
      2: "Co-occurring disorder requiring treatment",
      3: "Severe psychiatric condition",
    },
  },
  dimension4: {
    title: "Dimension 4: Readiness to Change",
    color: "bg-orange-500",
    stageLabels: {
      precontemplation: "Precontemplation - Not ready for change",
      contemplation: "Contemplation - Considering change",
      preparation: "Preparation - Ready to change",
      action: "Action - Actively changing",
      maintenance: "Maintenance - Sustaining change",
    },
  },
  dimension5: {
    title: "Dimension 5: Relapse/Continued Use Potential",
    color: "bg-red-500",
    severityLabels: {
      0: "Low relapse risk",
      1: "Moderate relapse risk",
      2: "High risk without structure",
      3: "Unable to control use without intensive support",
    },
  },
  dimension6: {
    title: "Dimension 6: Recovery/Living Environment",
    color: "bg-pink-500",
    severityLabels: {
      0: "Supportive environment",
      1: "Minimal support",
      2: "High-risk environment",
      3: "Dangerous/unsafe environment",
    },
  },
}

// ASAM Level descriptions
const LEVEL_INFO: Record<string, { label: string; badge: string; variant: "default" | "secondary" | "destructive" }> = {
  "0.5": { label: "Level 0.5 - Early Intervention", badge: "Early Intervention", variant: "secondary" },
  "1.0": { label: "Level 1.0 - Outpatient Services", badge: "OTP MAT Program Eligible", variant: "secondary" },
  "2.1": { label: "Level 2.1 - Intensive Outpatient (IOP)", badge: "IOP + MAT Recommended", variant: "default" },
  "2.5": { label: "Level 2.5 - Partial Hospitalization (PHP)", badge: "Partial Hospitalization", variant: "default" },
  "3.1": { label: "Level 3.1 - Clinically Managed Low-Intensity Residential", badge: "Residential Treatment", variant: "default" },
  "3.3": { label: "Level 3.3 - Clinically Managed High-Intensity Residential", badge: "Residential Treatment", variant: "default" },
  "3.5": { label: "Level 3.5 - Clinically Managed High-Intensity Residential", badge: "Residential Treatment", variant: "default" },
  "3.7": { label: "Level 3.7 - Medically Monitored Intensive Inpatient", badge: "Inpatient/Detox Referral", variant: "destructive" },
  "4.0": { label: "Level 4.0 - Medically Managed Intensive Inpatient", badge: "Inpatient/Detox Referral", variant: "destructive" },
}

export function ASAMAssessmentDetailsDialog({
  open,
  onOpenChange,
  assessment,
  providerName,
}: ASAMAssessmentDetailsDialogProps) {
  if (!assessment) return null

  const riskAssessment = assessment.risk_assessment
  const dimensions = riskAssessment?.asam_dimensions
  const recommendedLevel = riskAssessment?.recommended_level
  const suggestedLevel = riskAssessment?.suggested_level
  const suggestionOverridden = riskAssessment?.suggestion_overridden

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getSeverityBadgeVariant = (value: number): "default" | "secondary" | "destructive" | "outline" => {
    if (value === 0) return "outline"
    if (value === 1) return "secondary"
    if (value === 2) return "default"
    return "destructive"
  }

  const renderDimension = (
    key: keyof typeof DIMENSION_INFO,
    value: number | string | null | undefined
  ) => {
    const info = DIMENSION_INFO[key]
    if (value === null || value === undefined) {
      return (
        <div key={key} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${info.color} opacity-50`} />
          <div className="flex-1 pl-3">
            <p className="font-semibold text-sm text-gray-800 mb-1">{info.title}</p>
            <Badge variant="outline" className="mt-2">
              Not assessed
            </Badge>
          </div>
        </div>
      )
    }

    // Handle Dimension 4 (stages of change)
    if (key === "dimension4") {
      const dim4Info = DIMENSION_INFO.dimension4
      const stageLabel = dim4Info.stageLabels[value as keyof typeof dim4Info.stageLabels] || value
      const stageColors: Record<string, string> = {
        precontemplation: "bg-gray-100 text-gray-700 border-gray-300",
        contemplation: "bg-blue-100 text-blue-700 border-blue-300",
        preparation: "bg-yellow-100 text-yellow-700 border-yellow-300",
        action: "bg-green-100 text-green-700 border-green-300",
        maintenance: "bg-emerald-100 text-emerald-700 border-emerald-300",
      }
      const stageColor = stageColors[String(value)] || "bg-gray-100 text-gray-700 border-gray-300"
      
      return (
        <div key={key} className="group relative overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm hover:shadow-md transition-all">
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${info.color}`} />
          <div className="flex-1 pl-4">
            <p className="font-semibold text-sm text-gray-800 mb-2">{info.title}</p>
            <Badge className={`mt-1 ${stageColor} border font-medium`}>
              {stageLabel}
            </Badge>
          </div>
        </div>
      )
    }

    // Handle numeric dimensions
    const numValue = typeof value === "number" ? value : parseInt(value as string, 10)
    const severityLabels = "severityLabels" in info ? info.severityLabels : null
    const severityLabel = severityLabels?.[numValue as keyof typeof severityLabels] || `Level ${numValue}`
    
    const badgeVariant = getSeverityBadgeVariant(numValue)
    const badgeColors = {
      outline: "bg-gray-50 text-gray-700 border-gray-300",
      secondary: "bg-blue-50 text-blue-700 border-blue-300",
      default: "bg-yellow-50 text-yellow-700 border-yellow-300",
      destructive: "bg-red-50 text-red-700 border-red-300",
    }
    const badgeColor = badgeColors[badgeVariant] || badgeColors.outline

    return (
      <div key={key} className="group relative overflow-hidden rounded-xl border-2 bg-white p-4 shadow-sm hover:shadow-md transition-all" style={{
        borderColor: badgeVariant === "destructive" ? "#fecaca" : 
                    badgeVariant === "default" ? "#fef3c7" :
                    badgeVariant === "secondary" ? "#dbeafe" : "#e5e7eb",
        background: badgeVariant === "destructive" ? "linear-gradient(to bottom right, #fef2f2, #fee2e2)" :
                    badgeVariant === "default" ? "linear-gradient(to bottom right, #fffbeb, #fef3c7)" :
                    badgeVariant === "secondary" ? "linear-gradient(to bottom right, #eff6ff, #dbeafe)" : 
                    "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
      }}>
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${info.color}`} />
        <div className="flex-1 pl-4">
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-sm text-gray-800 leading-tight pr-2">{info.title}</p>
            <Badge className={`${badgeColor} border font-bold text-base min-w-[2rem] justify-center`}>
              {numValue}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 font-medium">{severityLabel}</p>
        </div>
      </div>
    )
  }

  const levelInfo = recommendedLevel ? LEVEL_INFO[recommendedLevel] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[98vw] !w-[98vw] sm:!max-w-[98vw] lg:!max-w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-lg bg-blue-100">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            ASAM 6-Dimension Assessment
          </DialogTitle>
          <DialogDescription className="pt-2">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(assessment.created_at)}</span>
              </div>
              {providerName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{providerName}</span>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Recommended Level - Enhanced */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Recommended Level of Care</h3>
              {suggestionOverridden && suggestedLevel && (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 border-amber-300">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span className="text-amber-700">Override from Level {suggestedLevel}</span>
                </Badge>
              )}
            </div>
            {levelInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-blue-700">Level {recommendedLevel}</div>
                  <Badge variant={levelInfo.variant} className="text-base px-4 py-1.5">
                    {levelInfo.badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{levelInfo.label}</p>
              </div>
            ) : recommendedLevel ? (
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-blue-700">Level {recommendedLevel}</div>
              </div>
            ) : (
              <p className="text-muted-foreground">No level recommended</p>
            )}
          </div>

          {/* Dimensions - Enhanced */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <h3 className="text-lg font-bold text-gray-900 px-3">ASAM 6-Dimension Assessment</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            {dimensions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderDimension("dimension1", dimensions.dimension1)}
                {renderDimension("dimension2", dimensions.dimension2)}
                {renderDimension("dimension3", dimensions.dimension3)}
                {renderDimension("dimension4", dimensions.dimension4)}
                {renderDimension("dimension5", dimensions.dimension5)}
                {renderDimension("dimension6", dimensions.dimension6)}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No dimension data available</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {assessment.chief_complaint && (
            <>
              <Separator className="my-6" />
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-900">Clinical Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {assessment.chief_complaint}
                </p>
              </div>
            </>
          )}

          {/* Validation status */}
          <div className="flex items-center justify-center gap-2 text-sm pt-4 pb-2 border-t">
            {dimensions &&
            dimensions.dimension1 !== null &&
            dimensions.dimension2 !== null &&
            dimensions.dimension3 !== null &&
            dimensions.dimension4 !== null &&
            dimensions.dimension5 !== null &&
            dimensions.dimension6 !== null ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">Complete assessment</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-700">Partial assessment</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
