"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, CheckCircle, XCircle, Clock, AlertTriangle, Pill, RefreshCw } from "lucide-react"

interface EligibilityResult {
  status: "active" | "inactive" | "pending" | "expired"
  planName: string
  memberId: string
  groupNumber: string
  copay: string
  deductible: string
  outOfPocketMax: string
  mentalHealthCoverage: boolean
  substanceAbuseCoverage: boolean
  priorAuthRequired: boolean
  effectiveDate: string
  terminationDate?: string
}

export function InsuranceEligibility() {
  const [patientId, setPatientId] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null)
  const [pmpResults, setPmpResults] = useState<any>(null)

  const handleEligibilityCheck = async () => {
    setIsChecking(true)

    // Simulate API call for eligibility check
    setTimeout(() => {
      setEligibilityResult({
        status: "active",
        planName: "Blue Cross Blue Shield Michigan",
        memberId: "BCM123456789",
        groupNumber: "GRP001234",
        copay: "$25",
        deductible: "$500 / $1,500 remaining",
        outOfPocketMax: "$3,000 / $2,200 remaining",
        mentalHealthCoverage: true,
        substanceAbuseCoverage: true,
        priorAuthRequired: false,
        effectiveDate: "2024-01-01",
      })

      // Simulate PMP check during eligibility verification
      setPmpResults({
        hasActiveRx: true,
        controlledSubstances: ["Suboxone 8mg", "Lorazepam 1mg"],
        lastFilled: "2024-12-08",
        prescribingProvider: "Dr. Sarah Johnson, MD",
        riskScore: "Medium",
      })

      setIsChecking(false)
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "inactive":
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Insurance Eligibility Verification
          </CardTitle>
          <CardDescription>
            Verify patient insurance coverage and benefits. PMP monitoring is automatically included.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="patientId">Patient ID or Member ID</Label>
              <Input
                id="patientId"
                placeholder="Enter patient or member ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleEligibilityCheck}
                disabled={!patientId || isChecking}
                className="bg-primary hover:bg-primary/90"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Coverage
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {eligibilityResult && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(eligibilityResult.status)}
                Coverage Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={eligibilityResult.status === "active" ? "default" : "destructive"}>
                    {eligibilityResult.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Plan:</span>
                  <span className="text-sm">{eligibilityResult.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Member ID:</span>
                  <span className="text-sm font-mono">{eligibilityResult.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Group:</span>
                  <span className="text-sm font-mono">{eligibilityResult.groupNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Effective Date:</span>
                  <span className="text-sm">{eligibilityResult.effectiveDate}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Coverage Details</h4>
                <div className="flex justify-between">
                  <span className="text-sm">Copay:</span>
                  <span className="text-sm font-medium">{eligibilityResult.copay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Deductible:</span>
                  <span className="text-sm">{eligibilityResult.deductible}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Out-of-Pocket Max:</span>
                  <span className="text-sm">{eligibilityResult.outOfPocketMax}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Behavioral Health Coverage</h4>
                <div className="flex justify-between">
                  <span className="text-sm">Mental Health:</span>
                  <Badge variant={eligibilityResult.mentalHealthCoverage ? "default" : "secondary"}>
                    {eligibilityResult.mentalHealthCoverage ? "Covered" : "Not Covered"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Substance Abuse:</span>
                  <Badge variant={eligibilityResult.substanceAbuseCoverage ? "default" : "secondary"}>
                    {eligibilityResult.substanceAbuseCoverage ? "Covered" : "Not Covered"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Prior Auth Required:</span>
                  <Badge variant={eligibilityResult.priorAuthRequired ? "destructive" : "default"}>
                    {eligibilityResult.priorAuthRequired ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {pmpResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  PMP Aware Monitoring
                  <Badge variant="outline" className="ml-auto">
                    Michigan MAPS
                  </Badge>
                </CardTitle>
                <CardDescription>Prescription monitoring data from michigan.pmpaware.net</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Active Prescriptions:</span>
                    <Badge variant={pmpResults.hasActiveRx ? "destructive" : "default"}>
                      {pmpResults.hasActiveRx ? "Yes" : "None"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Risk Score:</span>
                    <Badge
                      variant={
                        pmpResults.riskScore === "High"
                          ? "destructive"
                          : pmpResults.riskScore === "Medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {pmpResults.riskScore}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Filled:</span>
                    <span className="text-sm">{pmpResults.lastFilled}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Current Controlled Substances</h4>
                  {pmpResults.controlledSubstances.map((med: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Pill className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{med}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Prescribing Provider:</span>
                    <span className="text-sm">{pmpResults.prescribingProvider}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Pill className="mr-2 h-4 w-4" />
                    View Full PMP Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
