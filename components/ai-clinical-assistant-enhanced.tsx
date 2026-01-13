"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  AlertTriangle,
  Lightbulb,
  Pill,
  Activity,
  FileText,
  Target,
  GraduationCap,
  Plus,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Sparkles,
  Printer,
  Shield,
  FileCheck,
  MessageCircle,
  Clipboard,
} from "lucide-react";
import type {
  AIRecommendation,
  RiskAlert,
  ClinicalRecommendation,
  LabOrder,
  Diagnosis,
  PreventiveGap,
} from "@/types/ai-assistant";
import { useRequestAIAnalysis } from "@/hooks/use-ai-assistant";
import type { Patient } from "@/types/patient";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import AIClinicalAssistantChat from "@/components/ai-clinical-assistant-chat";
import { usePredictiveInsights } from "@/hooks/use-predictive-insights";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

export interface AIClinicalAssistantProps {
  /** Patient ID to analyze (if provided, patient selector is hidden) */
  patientId?: string;
  /** Specialty ID for context */
  specialtyId: string;
  /** Optional list of patients for selection (if patientId not provided) */
  patients?: Patient[];
  /** Callback when a recommendation is selected/acted upon */
  onRecommendationSelect?: (type: string, data: any) => void;
  /** Whether to show patient selector */
  showPatientSelector?: boolean;
  /** Encounter type for context */
  encounterType?:
    | "new_patient"
    | "follow_up"
    | "annual_wellness"
    | "sick_visit"
    | "procedure";
  /** Chief complaint for focused analysis */
  chiefComplaint?: string;
}

/**
 * Enhanced AI Clinical Assistant Component
 * Extends the base AI assistant to include compliance alerts, copy-to-clipboard and chat features.
 */
export function AIClinicalAssistantEnhanced({
  patientId: initialPatientId,
  specialtyId,
  patients = [],
  onRecommendationSelect,
  showPatientSelector = true,
  encounterType,
  chiefComplaint,
}: AIClinicalAssistantProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || ""
  );
  const [patientsList, setPatientsList] = useState<Patient[]>(patients);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [feedbackStates, setFeedbackStates] = useState<
    Record<string, "helpful" | "not_helpful" | null>
  >({});
  const [showChat, setShowChat] = useState(false);

  // Fetch patients if not provided
  useEffect(() => {
    if (patients.length === 0 && showPatientSelector) {
      fetch("/api/patients?limit=100")
        .then((res) => res.json())
        .then((data) => setPatientsList(data.patients || []))
        .catch(() => setPatientsList([]));
    } else {
      setPatientsList(patients);
    }
  }, [patients, showPatientSelector]);

  // AI Analysis mutation hook
  const {
    mutate: requestAIAnalysis,
    isPending: aiAnalysisLoading,
    data: aiMutationData,
  } = useRequestAIAnalysis();

  // Extract recommendations and compliance from API response
  const responseData = aiMutationData as any;
  const aiRecommendations: AIRecommendation | null =
    responseData?.recommendations || responseData?.data || null;
  const complianceData = responseData?.compliance || null;

  // Feature flag check for predictive insights
  const predictiveInsightsEnabled = useFeatureFlag("predictive-insights");
  // Load predictive insights when feature is enabled and a patient is selected
  const {
    data: predictiveInsightsData,
    isLoading: predictiveLoading,
    error: predictiveError,
  } = usePredictiveInsights(initialPatientId || selectedPatientId, predictiveInsightsEnabled);

  // Handler for AI analysis
  const analyzePatientChart = (patientId: string) => {
    requestAIAnalysis({
      patientId,
      specialtyId,
      encounterType: encounterType || "follow_up",
      chiefComplaint,
      includeLabReview: true,
      includeMedicationReview: true,
    } as any);
  };

  const handleAnalyze = () => {
    const patientToAnalyze = initialPatientId || selectedPatientId;
    if (patientToAnalyze) {
      analyzePatientChart(patientToAnalyze);
    }
  };

  const handleGenerateTreatmentPlan = async () => {
    const patientToAnalyze = initialPatientId || selectedPatientId;
    if (!patientToAnalyze || !aiRecommendations) {
      return;
    }
    setIsGeneratingPlan(true);
    try {
      const response = await fetch("/api/ai-assistant/treatment-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientToAnalyze,
          specialtyId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate treatment plan");
      }
      const data = await response.json();
      onRecommendationSelect?.("treatment_plan", data.treatmentPlan);
    } catch (error) {
      console.error("Error generating treatment plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleFeedback = async (
    recommendationId: string,
    helpful: boolean
  ) => {
    setFeedbackStates((prev) => ({
      ...prev,
      [recommendationId]: helpful ? "helpful" : "not_helpful",
    }));
    try {
      await fetch("/api/ai-assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId, helpful }),
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // Copy clinical summary to clipboard
  const copySummaryToClipboard = () => {
    if (aiRecommendations?.summary) {
      navigator.clipboard
        .writeText(aiRecommendations.summary)
        .then(() => {
          // Optionally notify user (e.g., toast) if integrated
        })
        .catch((err) => {
          console.error("Failed to copy summary:", err);
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      {showPatientSelector && !initialPatientId && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient for Analysis</CardTitle>
            <CardDescription>
              AI will analyze the complete patient chart and provide
              recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {patientsList.length > 0 ? (
                <Select
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientsList.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                        {patient.date_of_birth
                          ? ` - DOB: ${new Date(
                              patient.date_of_birth
                            ).toLocaleDateString()}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  disabled
                  placeholder="No patients available"
                  className="bg-muted"
                />
              )}
              <Button
                onClick={handleAnalyze}
                disabled={!selectedPatientId || aiAnalysisLoading}
              >
                {aiAnalysisLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Chart
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Auto-analyze if patientId is provided */}
      {initialPatientId && !aiRecommendations && !aiAnalysisLoading && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleAnalyze} disabled={aiAnalysisLoading}>
              {aiAnalysisLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start AI Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Loading State */}
      {aiAnalysisLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">
                Analyzing patient chart...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* AI Recommendations Display */}
      {aiRecommendations && (
        <>
          {/* Chat Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Chat with AI
            </Button>
          </div>
          {/* Chat Modal */}
          {showChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white w-full max-w-md mx-4 p-4 rounded-lg shadow-xl relative">
                <AIClinicalAssistantChat
                  patientId={initialPatientId || selectedPatientId}
                  specialtyId={specialtyId}
                  onClose={() => setShowChat(false)}
                />
              </div>
            </div>
          )}
          {/* Treatment Plan Generation Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerateTreatmentPlan}
                disabled={isGeneratingPlan}
                className="w-full"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Treatment Plan...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate Treatment Plan Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          {/* Clinical Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI-Generated Clinical Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-sm text-muted-foreground">
                  Based on comprehensive chart review including medical history,
                  medications, lab results, vital signs, and recent encounters.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg relative">
                  <p>{aiRecommendations.summary}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={copySummaryToClipboard}
                    title="Copy summary to clipboard"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Risk Alerts */}
          {aiRecommendations.riskAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Alerts & Clinical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.riskAlerts.map((alert: RiskAlert, index: number) => {
                    const alertVariant =
                      alert.type === "destructive" ? "destructive" : "default";
                    return (
                      <Alert key={index} variant={alertVariant as any}>
                        {alert.type === "destructive" && (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {alert.type === "warning" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {alert.type === "info" && <Info className="h-4 w-4" />} 
                        <AlertDescription>
                          <p
                            dangerouslySetInnerHTML={{ __html: alert.message }}
                          />
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Compliance Alerts */}
          {complianceData && complianceData.checks && complianceData.checks.some((check: any) => !check.compliant) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" /> Compliance & Documentation Alerts
                </CardTitle>
                <CardDescription>{complianceData.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.checks.map((check: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                      <p className="font-medium capitalize">
                        {check.category} compliance
                      </p>
                      {check.issues.length > 0 && (
                        <div className="mt-1">
                          <p className="text-sm font-semibold">Issues:</p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {check.issues.map((issue: string, i: number) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {check.requiredActions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold">Required Actions:</p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {check.requiredActions.map((action: string, i: number) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predictive Insights */}
          {predictiveInsightsEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" /> Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictiveLoading && (
                  <div className="flex items-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p className="text-sm text-muted-foreground">
                      Generating insights...
                    </p>
                  </div>
                )}
                {!predictiveLoading && predictiveInsightsData?.insights?.length > 0 && (
                  <div className="space-y-4">
                    {predictiveInsightsData.insights.map((insight: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg bg-gray-50"
                      >
                        <p className="font-medium">
                          {insight.category}
                          {insight.level && (
                            <span className="ml-2 inline-block px-2 py-1 text-xs rounded-full bg-blue-100">
                              {insight.level}
                            </span>
                          )}
                        </p>
                        {insight.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        )}
                        {insight.recommendedActions &&
                          insight.recommendedActions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold">
                                Recommended actions:
                              </p>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {insight.recommendedActions.map(
                                  (act: string, idx2: number) => (
                                    <li key={idx2}>{act}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                {!predictiveLoading &&
                  predictiveInsightsData?.insights?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No significant risks identified.
                    </p>
                  )}
                {predictiveError && (
                  <p className="text-sm text-red-600">
                    Error loading predictive insights.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {/* Treatment Recommendations */}
          {aiRecommendations.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Evidence-Based Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiRecommendations.recommendations.map(
                    (rec: ClinicalRecommendation, index: number) => {
                      const recId = `rec-${index}`;
                      const feedback = feedbackStates[recId];
                      return (
                        <div
                          key={index}
                          className={`border-l-4 ${rec.color} pl-4 pr-4`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{rec.category}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {rec.text}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleFeedback(recId, true)}
                                disabled={feedback === "helpful"}
                              >
                                <ThumbsUp
                                  className={`h-4 w-4 ${
                                    feedback === "helpful"
                                      ? "text-green-600"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleFeedback(recId, false)}
                                disabled={feedback === "not_helpful"}
                              >
                                <ThumbsDown
                                  className={`h-4 w-4 ${
                                    feedback === "not_helpful"
                                      ? "text-red-600"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Drug Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-orange-500" /> Drug Interaction Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg ${
                    aiRecommendations.drugInteractions.status === "no_major"
                      ? "bg-green-50"
                      : "bg-red-50"
                  }`}
                >
                  {aiRecommendations.drugInteractions.status === "no_major" ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        aiRecommendations.drugInteractions.status === "no_major"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {aiRecommendations.drugInteractions.status === "no_major"
                        ? "No major interactions detected"
                        : "Interactions Detected"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aiRecommendations.drugInteractions.message}
                    </p>
                  </div>
                </div>
                {aiRecommendations.drugInteractions.interactions &&
                  aiRecommendations.drugInteractions.interactions.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {aiRecommendations.drugInteractions.interactions.map(
                        (interaction: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 border rounded-lg bg-yellow-50"
                          >
                            <p className="font-medium text-sm">
                              {interaction.drug1} + {interaction.drug2}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {interaction.description}
                            </p>
                            {interaction.action && (
                              <p className="text-xs font-medium text-orange-700 mt-1">
                                Action: {interaction.action}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
          {/* Lab Order Suggestions */}
          {aiRecommendations.labOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" /> Recommended Lab Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.labOrders.map(
                    (lab: LabOrder, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{lab.test}</p>
                          <p className="text-sm text-muted-foreground">
                            {lab.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{lab.urgency}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRecommendationSelect?.("lab_order", lab)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Differential Diagnosis */}
          {aiRecommendations.differentialDiagnosis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Differential Diagnosis Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="space-y-2">
                    {aiRecommendations.differentialDiagnosis.map(
                      (dd: Diagnosis, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 border rounded ${
                            dd.type === "destructive"
                              ? "bg-red-50 border-red-200"
                              : dd.type === "default"
                              ? "bg-blue-50 border-blue-200"
                              : dd.type === "outline"
                              ? "bg-gray-50 border-gray-200"
                              : ""
                          }`}
                        >
                          <span className="font-medium">{dd.diagnosis}</span>
                          <Badge
                            variant={
                              dd.type === "destructive"
                                ? "destructive"
                                : dd.type === "default"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {dd.probability}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Preventive Care Gaps */}
          {aiRecommendations.preventiveGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-500" /> Quality Measures & Preventive Care Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiRecommendations.preventiveGaps.map(
                    (item: PreventiveGap, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          item.status === "overdue"
                            ? "bg-red-50"
                            : item.status === "due"
                            ? "bg-yellow-50"
                            : "bg-green-50"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{item.measure}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.action}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.status === "overdue"
                              ? "destructive"
                              : item.status === "due"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.status}
                          {item.days !== null && ` (${item.days}d)`}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Patient Education */}
          {aiRecommendations.educationTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-pink-500" /> Patient Education Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiRecommendations.educationTopics.map((topic: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{topic}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRecommendationSelect?.("education", topic)}
                      >
                        <Printer className="h-3 w-3 mr-1" /> Print
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}