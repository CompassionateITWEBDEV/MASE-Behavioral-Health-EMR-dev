"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  FileCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Calendar,
  ExternalLink,
} from "lucide-react"

interface LicenseVerification {
  id: string
  providerId: string
  providerName: string
  licenseNumber: string
  licenseType: string
  issuingState: string
  issueDate?: string
  expirationDate: string
  verificationStatus: "pending" | "verified" | "expired" | "suspended" | "revoked"
  verificationDate?: string
  verificationSource: string
  disciplinaryActions?: string
  restrictions?: string
  renewalRequiredBy?: string
  cmeRequirements?: string
  lastVerificationAttempt?: string
  nextVerificationDue?: string
  autoVerifyEnabled: boolean
  notes?: string
}

const mockLicenseVerifications: LicenseVerification[] = [
  {
    id: "1",
    providerId: "prov001",
    providerName: "Dr. Sarah Johnson",
    licenseNumber: "MD123456",
    licenseType: "MD",
    issuingState: "MI",
    issueDate: "2018-06-15",
    expirationDate: "2025-06-15",
    verificationStatus: "verified",
    verificationDate: "2024-12-01",
    verificationSource: "Michigan Board of Medicine",
    renewalRequiredBy: "2025-04-15",
    cmeRequirements: "150 hours over 3 years",
    nextVerificationDue: "2025-03-01",
    autoVerifyEnabled: true,
    notes: "Primary care physician license in good standing",
  },
  {
    id: "2",
    providerId: "prov002",
    providerName: "Dr. Michael Chen",
    licenseNumber: "MD789012",
    licenseType: "MD",
    issuingState: "MI",
    issueDate: "2015-08-20",
    expirationDate: "2025-08-20",
    verificationStatus: "verified",
    verificationDate: "2024-11-28",
    verificationSource: "Michigan Board of Medicine",
    renewalRequiredBy: "2025-06-20",
    cmeRequirements: "150 hours over 3 years",
    nextVerificationDue: "2025-05-28",
    autoVerifyEnabled: true,
    notes: "Psychiatrist with addiction medicine certification",
  },
  {
    id: "3",
    providerId: "prov003",
    providerName: "Dr. Emily Rodriguez",
    licenseNumber: "MD345678",
    licenseType: "MD",
    issuingState: "OH",
    issueDate: "2020-03-10",
    expirationDate: "2025-03-10",
    verificationStatus: "pending",
    verificationSource: "Manual Entry",
    renewalRequiredBy: "2025-01-10",
    nextVerificationDue: "2024-12-15",
    autoVerifyEnabled: false,
    notes: "New provider, license verification in progress",
  },
  {
    id: "4",
    providerId: "prov005",
    providerName: "Sarah Williams, NP",
    licenseNumber: "NP567890",
    licenseType: "NP",
    issuingState: "MI",
    issueDate: "2019-09-12",
    expirationDate: "2024-12-31",
    verificationStatus: "expired",
    verificationDate: "2024-11-15",
    verificationSource: "Michigan Board of Nursing",
    renewalRequiredBy: "2024-10-31",
    cmeRequirements: "25 hours annually",
    lastVerificationAttempt: "2024-12-01",
    autoVerifyEnabled: true,
    notes: "License expired, renewal in progress",
  },
]

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const LICENSE_TYPES = ["MD", "DO", "NP", "PA", "RN", "LPN", "LCSW", "LPC", "LMFT", "LCDC", "PharmD", "DDS", "DVM"]

export function LicenseVerificationDashboard() {
  const [licenseVerifications, setLicenseVerifications] = useState<LicenseVerification[]>(mockLicenseVerifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [newLicense, setNewLicense] = useState({
    providerName: "",
    licenseNumber: "",
    licenseType: "",
    issuingState: "",
    issueDate: "",
    expirationDate: "",
    renewalRequiredBy: "",
    cmeRequirements: "",
    autoVerifyEnabled: true,
    notes: "",
  })

  const filteredVerifications = licenseVerifications.filter(
    (verification) =>
      verification.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.licenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.issuingState.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expired":
      case "suspended":
      case "revoked":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default"
      case "expired":
      case "suspended":
      case "revoked":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0
  }

  const handleVerifyLicense = async (licenseId: string) => {
    setIsVerifying(licenseId)

    // Simulate license verification API call
    setTimeout(() => {
      setLicenseVerifications((prev) =>
        prev.map((license) =>
          license.id === licenseId
            ? {
                ...license,
                verificationStatus: "verified" as const,
                verificationDate: new Date().toISOString().split("T")[0],
                verificationSource: `${license.issuingState} State Board`,
                lastVerificationAttempt: new Date().toISOString().split("T")[0],
                nextVerificationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              }
            : license,
        ),
      )
      setIsVerifying(null)
    }, 2000)
  }

  const handleAddLicense = () => {
    const newVerification: LicenseVerification = {
      id: Date.now().toString(),
      providerId: `prov${Date.now()}`,
      providerName: newLicense.providerName,
      licenseNumber: newLicense.licenseNumber,
      licenseType: newLicense.licenseType,
      issuingState: newLicense.issuingState,
      issueDate: newLicense.issueDate,
      expirationDate: newLicense.expirationDate,
      verificationStatus: "pending",
      verificationSource: "Manual Entry",
      renewalRequiredBy: newLicense.renewalRequiredBy,
      cmeRequirements: newLicense.cmeRequirements,
      autoVerifyEnabled: newLicense.autoVerifyEnabled,
      notes: newLicense.notes,
    }

    setLicenseVerifications([...licenseVerifications, newVerification])
    setNewLicense({
      providerName: "",
      licenseNumber: "",
      licenseType: "",
      issuingState: "",
      issueDate: "",
      expirationDate: "",
      renewalRequiredBy: "",
      cmeRequirements: "",
      autoVerifyEnabled: true,
      notes: "",
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">License Verification & Tracking</h2>
          <p className="text-muted-foreground">Monitor provider licenses and ensure compliance</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add License
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider name, license number, type, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add License Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New License Verification</CardTitle>
            <CardDescription>Enter provider license information for tracking and verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="providerName">Provider Name *</Label>
                <Input
                  id="providerName"
                  value={newLicense.providerName}
                  onChange={(e) => setNewLicense({ ...newLicense, providerName: e.target.value })}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={newLicense.licenseNumber}
                  onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                  placeholder="MD123456"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="licenseType">License Type *</Label>
                <Select
                  value={newLicense.licenseType}
                  onValueChange={(value) => setNewLicense({ ...newLicense, licenseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issuingState">Issuing State *</Label>
                <Select
                  value={newLicense.issuingState}
                  onValueChange={(value) => setNewLicense({ ...newLicense, issuingState: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newLicense.issueDate}
                  onChange={(e) => setNewLicense({ ...newLicense, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date *</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={newLicense.expirationDate}
                  onChange={(e) => setNewLicense({ ...newLicense, expirationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="renewalRequiredBy">Renewal Required By</Label>
                <Input
                  id="renewalRequiredBy"
                  type="date"
                  value={newLicense.renewalRequiredBy}
                  onChange={(e) => setNewLicense({ ...newLicense, renewalRequiredBy: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="autoVerifyEnabled"
                  checked={newLicense.autoVerifyEnabled}
                  onCheckedChange={(checked) => setNewLicense({ ...newLicense, autoVerifyEnabled: checked })}
                />
                <Label htmlFor="autoVerifyEnabled">Enable Auto-Verification</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="cmeRequirements">CME Requirements</Label>
              <Input
                id="cmeRequirements"
                value={newLicense.cmeRequirements}
                onChange={(e) => setNewLicense({ ...newLicense, cmeRequirements: e.target.value })}
                placeholder="e.g., 150 hours over 3 years"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLicense.notes}
                onChange={(e) => setNewLicense({ ...newLicense, notes: e.target.value })}
                placeholder="Additional notes about this license..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddLicense} className="bg-primary hover:bg-primary/90">
                Add License
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* License Verification List */}
      <div className="grid gap-4">
        {filteredVerifications.map((verification) => (
          <Card key={verification.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{verification.providerName}</h3>
                    <Badge variant="outline">
                      {verification.licenseType} - {verification.issuingState}
                    </Badge>
                    <Badge variant="outline">{verification.licenseNumber}</Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(verification.verificationStatus)}
                      <Badge variant={getStatusColor(verification.verificationStatus)}>
                        {verification.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                    {isExpiringSoon(verification.expirationDate) && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-3 text-sm mb-3">
                    {verification.issueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Issued: {verification.issueDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Expires: {verification.expirationDate}</span>
                    </div>
                    {verification.verificationDate && (
                      <div>
                        <span className="font-medium">Verified:</span> {verification.verificationDate}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm mb-3">
                    <div>
                      <span className="font-medium">Source:</span> {verification.verificationSource}
                    </div>
                    {verification.renewalRequiredBy && (
                      <div>
                        <span className="font-medium">Renewal Due:</span> {verification.renewalRequiredBy}
                      </div>
                    )}
                    {verification.cmeRequirements && (
                      <div>
                        <span className="font-medium">CME:</span> {verification.cmeRequirements}
                      </div>
                    )}
                    {verification.nextVerificationDue && (
                      <div>
                        <span className="font-medium">Next Check:</span> {verification.nextVerificationDue}
                      </div>
                    )}
                  </div>

                  {verification.disciplinaryActions && (
                    <div className="text-sm text-red-600 mb-2">
                      <span className="font-medium">Disciplinary Actions:</span> {verification.disciplinaryActions}
                    </div>
                  )}

                  {verification.restrictions && (
                    <div className="text-sm text-orange-600 mb-2">
                      <span className="font-medium">Restrictions:</span> {verification.restrictions}
                    </div>
                  )}

                  {verification.notes && (
                    <div className="text-sm mb-3">
                      <span className="font-medium">Notes:</span> {verification.notes}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {verification.autoVerifyEnabled && <Badge variant="outline">Auto-Verify Enabled</Badge>}
                  </div>
                </div>

                <div className="flex gap-2">
                  {verification.verificationStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyLicense(verification.id)}
                      disabled={isVerifying === verification.id}
                    >
                      {isVerifying === verification.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FileCheck className="mr-2 h-4 w-4" />
                          Verify License
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    State Board
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVerifications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No license verifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Add your first license verification to get started."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
