"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Document {
  id: string
  document_type: "assessment" | "progress_note"
  patient_name: string
  provider_name: string
  created_at: string
  assessment_type?: string
  note_type?: string
  chief_complaint?: string
  history_present_illness?: string
  mental_status_exam?: any
  risk_assessment?: any
  diagnosis_codes?: string[]
  treatment_plan?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
}

interface ViewDocumentDialogProps {
  children: React.ReactNode
  document: Document
}

export function ViewDocumentDialog({ children, document }: ViewDocumentDialogProps) {
  const [open, setOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!max-w-[98vw] !w-[98vw] sm:!max-w-[98vw] lg:!max-w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document.document_type === "assessment" ? "Clinical Assessment" : "Progress Note"}
            <Badge variant="outline">
              {document.document_type === "assessment" ? document.assessment_type : document.note_type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Patient: {document.patient_name} • Provider: {document.provider_name} • {formatDate(document.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {document.document_type === "assessment" ? (
            <>
              {document.chief_complaint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chief Complaint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.chief_complaint}</p>
                  </CardContent>
                </Card>
              )}

              {document.history_present_illness && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">History of Present Illness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.history_present_illness}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.mental_status_exam && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mental Status Exam</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                        {JSON.stringify(document.mental_status_exam, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {document.risk_assessment && (() => {
                  // Check if this is an ASAM assessment
                  const isASAM = document.risk_assessment?.asam_dimensions || 
                                 document.assessment_type?.toLowerCase().includes("asam");
                  
                  if (isASAM && document.risk_assessment.asam_dimensions) {
                    const dimensions = document.risk_assessment.asam_dimensions;
                    const recommendedLevel = document.risk_assessment.recommended_level;
                    const suggestedLevel = document.risk_assessment.suggested_level;
                    
                    const dimensionLabels: Record<string, string> = {
                      dimension1: "Dimension 1: Acute Intoxication & Withdrawal Potential",
                      dimension2: "Dimension 2: Biomedical Conditions & Complications",
                      dimension3: "Dimension 3: Emotional/Behavioral Conditions",
                      dimension4: "Dimension 4: Treatment Acceptance/Resistance",
                      dimension5: "Dimension 5: Relapse/Continued Use Potential",
                      dimension6: "Dimension 6: Recovery Environment",
                    };
                    
                    const getSeverityLabel = (value: number | string, dim: string) => {
                      if (dim === "dimension4") {
                        const labels: Record<string, string> = {
                          "precontemplation": "Precontemplation",
                          "contemplation": "Contemplation",
                          "preparation": "Preparation",
                          "action": "Action",
                          "maintenance": "Maintenance",
                        };
                        return labels[String(value)] || String(value);
                      }
                      const numValue = typeof value === "number" ? value : parseInt(String(value));
                      const labels: Record<number, string> = {
                        0: "No risk",
                        1: "Low risk",
                        2: "Moderate risk",
                        3: "High risk",
                        4: "Very high risk",
                      };
                      return labels[numValue] || `Level ${numValue}`;
                    };
                    
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">ASAM 6-Dimension Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(dimensions).map(([key, value]) => (
                              <div key={key} className="border rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {dimensionLabels[key] || key}
                                </p>
                                <Badge variant={
                                  (typeof value === "number" && value >= 3) ? "destructive" :
                                  (typeof value === "number" && value >= 2) ? "default" :
                                  (typeof value === "number" && value >= 1) ? "secondary" :
                                  "outline"
                                }>
                                  {getSeverityLabel(value, key)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          
                          {(recommendedLevel || suggestedLevel) && (
                            <div className="border-t pt-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                {recommendedLevel && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Recommended Level of Care
                                    </p>
                                    <Badge variant="default" className="text-base px-3 py-1">
                                      Level {recommendedLevel}
                                    </Badge>
                                  </div>
                                )}
                                {suggestedLevel && suggestedLevel !== recommendedLevel && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Suggested Level
                                    </p>
                                    <Badge variant="secondary" className="text-base px-3 py-1">
                                      Level {suggestedLevel}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  // For non-ASAM risk assessments, show as JSON
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                          {JSON.stringify(document.risk_assessment, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>

              {document.diagnosis_codes && document.diagnosis_codes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnosis Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {document.diagnosis_codes.map((code, index) => (
                        <Badge key={index} variant="secondary">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {document.treatment_plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.treatment_plan}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              {document.subjective && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subjective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.subjective}</p>
                  </CardContent>
                </Card>
              )}

              {document.objective && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Objective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.objective}</p>
                  </CardContent>
                </Card>
              )}

              {document.assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.assessment}</p>
                  </CardContent>
                </Card>
              )}

              {document.plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{document.plan}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
