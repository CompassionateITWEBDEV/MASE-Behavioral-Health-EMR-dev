"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Package, DollarSign, AlertTriangle } from "lucide-react"

export function OTPBundleCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [medicationType, setMedicationType] = useState("")
  const [patientType, setPatientType] = useState("")
  const [facilityType, setFacilityType] = useState("")
  const [recommendation, setRecommendation] = useState<any>(null)

  const qualifyingServices = [
    { id: "individual-counseling", label: "Individual Counseling", qualifying: true },
    { id: "group-counseling", label: "Group Counseling", qualifying: true },
    { id: "medication-admin", label: "Medication Administration/Observation", qualifying: true },
    { id: "medication-mgmt", label: "Medication Management", qualifying: true },
    { id: "brief-treatment", label: "Brief Treatment", qualifying: true },
    { id: "toxicology", label: "Presumptive Toxicology Testing", qualifying: true },
  ]

  const nonQualifyingServices = [
    { id: "admission-assessment", label: "Admission Assessment", qualifying: false },
    { id: "periodic-assessment", label: "Periodic Assessment", qualifying: false },
    { id: "psychiatric-eval", label: "Psychiatric Evaluation", qualifying: false },
    { id: "peer-services", label: "Peer Services", qualifying: false },
    { id: "smoking-cessation", label: "Smoking Cessation", qualifying: false },
    { id: "medical-visit", label: "Unrelated Medical Visit", qualifying: false },
  ]

  const calculateRecommendation = () => {
    const hasQualifyingServices = selectedServices.some((service) => qualifyingServices.find((qs) => qs.id === service))
    const hasNonQualifyingServices = selectedServices.some((service) =>
      nonQualifyingServices.find((nqs) => nqs.id === service),
    )
    const hasMedicationAdmin = selectedServices.includes("medication-admin")

    let billingMethod = ""
    let rateCodes: string[] = []
    let procedureCodes: string[] = []
    let estimatedReimbursement = 0
    const notes: string[] = []

    // Determine billing method based on OASAS guidelines
    if (hasQualifyingServices) {
      if (hasMedicationAdmin && selectedServices.length === 1) {
        // Only medication administration - can use bundle or APG
        billingMethod = "Full Bundle (Recommended)"
        if (medicationType === "methadone") {
          rateCodes = facilityType === "freestanding" ? ["7969"] : ["7973"]
          procedureCodes = ["G2067"]
          estimatedReimbursement = 247.5
        } else if (medicationType === "buprenorphine") {
          rateCodes = facilityType === "freestanding" ? ["7971"] : ["7975"]
          procedureCodes = ["G2068"]
          estimatedReimbursement = 235.75
        }
      } else if (hasQualifyingServices && !hasMedicationAdmin) {
        // Take-home scenario
        billingMethod = "Take-Home Bundle"
        if (medicationType === "methadone") {
          rateCodes = facilityType === "freestanding" ? ["7970"] : ["7974"]
          procedureCodes = ["G2078"]
          estimatedReimbursement = 89.25
        } else if (medicationType === "buprenorphine") {
          rateCodes = facilityType === "freestanding" ? ["7972"] : ["7976"]
          procedureCodes = ["G2079"]
          estimatedReimbursement = 85.5
        }
      } else {
        // Full bundle with multiple services
        billingMethod = "Full Bundle"
        if (medicationType === "methadone") {
          rateCodes = facilityType === "freestanding" ? ["7969"] : ["7973"]
          procedureCodes = ["G2067"]
          estimatedReimbursement = 247.5
        } else if (medicationType === "buprenorphine") {
          rateCodes = facilityType === "freestanding" ? ["7971"] : ["7975"]
          procedureCodes = ["G2068"]
          estimatedReimbursement = 235.75
        }
      }

      if (hasNonQualifyingServices) {
        billingMethod += " + APG for Non-Qualifying Services"
        notes.push("Submit separate APG claim for non-qualifying services")
        estimatedReimbursement += hasNonQualifyingServices ? 45.25 : 0
      }
    } else if (hasNonQualifyingServices && !hasQualifyingServices) {
      billingMethod = "APG Only"
      rateCodes = ["APG"]
      estimatedReimbursement = 45.25 * selectedServices.length
      notes.push("No qualifying services for bundle billing")
    }

    // Special cases
    if (patientType === "dual-eligible") {
      notes.push("Dual Eligible: Submit to Medicare first, then crossover to Medicaid")
      notes.push("Use Medicare G codes, then Medicaid bundle rate codes")
    }

    if (patientType === "guest-dosing") {
      billingMethod = "APG Only (Guest Dosing)"
      notes.push("Guest dosing cannot use bundle billing per OASAS guidelines")
    }

    if (facilityType === "fqhc") {
      notes.push("FQHC: Cannot bill 1671 rate code and bundle in same week")
    }

    if (facilityType === "ccbhc") {
      notes.push("CCBHC: Medication administration carved out of 1147 rate")
    }

    setRecommendation({
      billingMethod,
      rateCodes,
      procedureCodes,
      estimatedReimbursement,
      notes,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            OTP Bundle vs APG Calculator
          </CardTitle>
          <CardDescription>OASAS-compliant billing decision support tool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient and Facility Information */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Medication Type</label>
              <Select value={medicationType} onValueChange={setMedicationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="methadone">Methadone</SelectItem>
                  <SelectItem value="buprenorphine">Buprenorphine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Patient Type</label>
              <Select value={patientType} onValueChange={setPatientType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicaid-only">Medicaid Only</SelectItem>
                  <SelectItem value="dual-eligible">Dual Eligible (Medicare/Medicaid)</SelectItem>
                  <SelectItem value="guest-dosing">Guest Dosing</SelectItem>
                  <SelectItem value="nursing-home">Skilled Nursing Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Type</label>
              <Select value={facilityType} onValueChange={setFacilityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freestanding">Freestanding OTP</SelectItem>
                  <SelectItem value="hospital-based">Hospital-Based OTP</SelectItem>
                  <SelectItem value="fqhc">FQHC</SelectItem>
                  <SelectItem value="ccbhc">CCBHC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-green-600">Qualifying Services (Bundle Eligible)</h3>
              <div className="space-y-3">
                {qualifyingServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedServices([...selectedServices, service.id])
                        } else {
                          setSelectedServices(selectedServices.filter((s) => s !== service.id))
                        }
                      }}
                    />
                    <label htmlFor={service.id} className="text-sm">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-blue-600">Non-Qualifying Services (APG Required)</h3>
              <div className="space-y-3">
                {nonQualifyingServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedServices([...selectedServices, service.id])
                        } else {
                          setSelectedServices(selectedServices.filter((s) => s !== service.id))
                        }
                      }}
                    />
                    <label htmlFor={service.id} className="text-sm">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={calculateRecommendation}
            className="w-full"
            disabled={selectedServices.length === 0 || !medicationType || !patientType || !facilityType}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Billing Recommendation
          </Button>
        </CardContent>
      </Card>

      {/* Recommendation Results */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Billing Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Recommended Billing Method:</label>
                  <p className="text-lg font-semibold text-primary">{recommendation.billingMethod}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Rate Codes:</label>
                  <div className="flex gap-2 mt-1">
                    {recommendation.rateCodes.map((code: string) => (
                      <Badge key={code} variant="default">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Procedure Codes:</label>
                  <div className="flex gap-2 mt-1">
                    {recommendation.procedureCodes.map((code: string) => (
                      <Badge key={code} variant="secondary">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <label className="text-sm font-medium">Estimated Reimbursement:</label>
                    <p className="text-2xl font-bold text-green-600">
                      ${recommendation.estimatedReimbursement.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {recommendation.notes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Important Notes:
                </label>
                <ul className="space-y-1">
                  {recommendation.notes.map((note: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
