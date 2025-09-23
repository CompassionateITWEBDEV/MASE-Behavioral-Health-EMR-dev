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
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Calendar,
  Award,
  FileText,
} from "lucide-react"

interface ProviderCredential {
  id: string
  providerId: string
  providerName: string
  credentialType: string
  credentialNumber?: string
  issuingOrganization: string
  issueDate?: string
  expirationDate?: string
  verificationStatus: "pending" | "verified" | "expired" | "suspended" | "revoked"
  verificationDate?: string
  verificationSource: string
  renewalRequiredBy?: string
  cmeRequirements?: string
  specialtyBoard?: string
  boardCertified: boolean
  maintenanceRequirements?: string
  lastVerificationAttempt?: string
  nextVerificationDue?: string
  autoVerifyEnabled: boolean
  attachments?: string[]
  notes?: string
}

const mockCredentials: ProviderCredential[] = [
  {
    id: "1",
    providerId: "prov001",
    providerName: "Dr. Sarah Johnson",
    credentialType: "Board Certification",
    credentialNumber: "BC123456",
    issuingOrganization: "American Board of Family Medicine",
    issueDate: "2018-06-15",
    expirationDate: "2028-06-15",
    verificationStatus: "verified",
    verificationDate: "2024-12-01",
    verificationSource: "ABFM Registry",
    renewalRequiredBy: "2027-12-31",
    cmeRequirements: "150 hours over 3 years",
    specialtyBoard: "Family Medicine",
    boardCertified: true,
    maintenanceRequirements: "MOC activities annually",
    nextVerificationDue: "2025-06-01",
    autoVerifyEnabled: true,
    notes: "Board certified family physician",
  },
  {
    id: "2",
    providerId: "prov002",
    providerName: "Dr. Michael Chen",
    credentialType: "Board Certification",
    credentialNumber: "BC789012",
    issuingOrganization: "American Board of Psychiatry and Neurology",
    issueDate: "2015-08-20",
    expirationDate: "2025-08-20",
    verificationStatus: "verified",
    verificationDate: "2024-11-28",
    verificationSource: "ABPN Registry",
    renewalRequiredBy: "2025-06-20",
    cmeRequirements: "200 hours over 4 years",
    specialtyBoard: "Psychiatry",
    boardCertified: true,
    maintenanceRequirements: "MOC Part IV due 2025",
    nextVerificationDue: "2025-05-28",
    autoVerifyEnabled: true,
    notes: "Board certified psychiatrist with addiction medicine subspecialty",
  },
  {
    id: "3",
    providerId: "prov003",
    providerName: "Dr. Emily Rodriguez",
    credentialType: "DEA Registration",
    credentialNumber: "BR1234567",
    issuingOrganization: "Drug Enforcement Administration",
    issueDate: "2022-03-10",
    expirationDate: "2025-03-10",
    verificationStatus: "verified",
    verificationDate: "2024-11-15",
    verificationSource: "DEA Registry",
    renewalRequiredBy: "2025-01-10",
    boardCertified: false,
    nextVerificationDue: "2025-02-10",
    autoVerifyEnabled: true,
    notes: "DEA registration for controlled substances",
  },
  {
    id: "4",
    providerId: "prov005",
    providerName: "Sarah Williams, NP",
    credentialType: "Certification",
    credentialNumber: "PMHNP12345",
    issuingOrganization: "American Nurses Credentialing Center",
    issueDate: "2019-09-12",
    expirationDate: "2024-12-31",
    verificationStatus: "expired",
    verificationDate: "2024-11-15",
    verificationSource: "ANCC Registry",
    renewalRequiredBy: "2024-10-31",
    cmeRequirements: "75 hours over 5 years",
    specialtyBoard: "Psychiatric Mental Health Nurse Practitioner",
    boardCertified: true,
    lastVerificationAttempt: "2024-12-01",
    autoVerifyEnabled: true,
    notes: "PMHNP certification expired, renewal in progress",
  },
]

const CREDENTIAL_TYPES = [
  "Board Certification",
  "DEA Registration",
  "State Controlled Substance License",
  "Certification",
  "Fellowship",
  "Subspecialty Certification",
  "Hospital Privileges",
  "Malpractice Insurance",
  "Other",
]

export function ProviderCredentialManagement() {
  const [credentials, setCredentials] = useState<ProviderCredential[]>(mockCredentials)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [newCredential, setNewCredential] = useState({
    providerName: "",
    credentialType: "",
    credentialNumber: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    renewalRequiredBy: "",
    cmeRequirements: "",
    specialtyBoard: "",
    boardCertified: false,
    maintenanceRequirements: "",
    autoVerifyEnabled: true,
    notes: "",
  })

  const filteredCredentials = credentials.filter(
    (credential) =>
      credential.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.credentialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.issuingOrganization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.specialtyBoard?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        return <UserCheck className="h-4 w-4 text-gray-500" />
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

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const today = new Date()
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0
  }

  const handleVerifyCredential = async (credentialId: string) => {
    setIsVerifying(credentialId)

    // Simulate credential verification API call
    setTimeout(() => {
      setCredentials((prev) =>
        prev.map((credential) =>
          credential.id === credentialId
            ? {
                ...credential,
                verificationStatus: "verified" as const,
                verificationDate: new Date().toISOString().split("T")[0],
                verificationSource: `${credential.issuingOrganization} Registry`,
                lastVerificationAttempt: new Date().toISOString().split("T")[0],
                nextVerificationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              }
            : credential,
        ),
      )
      setIsVerifying(null)
    }, 2000)
  }

  const handleAddCredential = () => {
    const newCredentialEntry: ProviderCredential = {
      id: Date.now().toString(),
      providerId: `prov${Date.now()}`,
      providerName: newCredential.providerName,
      credentialType: newCredential.credentialType,
      credentialNumber: newCredential.credentialNumber,
      issuingOrganization: newCredential.issuingOrganization,
      issueDate: newCredential.issueDate,
      expirationDate: newCredential.expirationDate,
      verificationStatus: "pending",
      verificationSource: "Manual Entry",
      renewalRequiredBy: newCredential.renewalRequiredBy,
      cmeRequirements: newCredential.cmeRequirements,
      specialtyBoard: newCredential.specialtyBoard,
      boardCertified: newCredential.boardCertified,
      maintenanceRequirements: newCredential.maintenanceRequirements,
      autoVerifyEnabled: newCredential.autoVerifyEnabled,
      notes: newCredential.notes,
    }

    setCredentials([...credentials, newCredentialEntry])
    setNewCredential({
      providerName: "",
      credentialType: "",
      credentialNumber: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      renewalRequiredBy: "",
      cmeRequirements: "",
      specialtyBoard: "",
      boardCertified: false,
      maintenanceRequirements: "",
      autoVerifyEnabled: true,
      notes: "",
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Provider Credential Management</h2>
          <p className="text-muted-foreground">
            Manage provider certifications, board credentials, and professional licenses
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider name, credential type, organization, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Credential Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Provider Credential</CardTitle>
            <CardDescription>Enter provider credential information for tracking and verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="providerName">Provider Name *</Label>
                <Input
                  id="providerName"
                  value={newCredential.providerName}
                  onChange={(e) => setNewCredential({ ...newCredential, providerName: e.target.value })}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <Label htmlFor="credentialType">Credential Type *</Label>
                <Select
                  value={newCredential.credentialType}
                  onValueChange={(value) => setNewCredential({ ...newCredential, credentialType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDENTIAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="credentialNumber">Credential Number</Label>
                <Input
                  id="credentialNumber"
                  value={newCredential.credentialNumber}
                  onChange={(e) => setNewCredential({ ...newCredential, credentialNumber: e.target.value })}
                  placeholder="BC123456"
                />
              </div>
              <div>
                <Label htmlFor="issuingOrganization">Issuing Organization *</Label>
                <Input
                  id="issuingOrganization"
                  value={newCredential.issuingOrganization}
                  onChange={(e) => setNewCredential({ ...newCredential, issuingOrganization: e.target.value })}
                  placeholder="American Board of Family Medicine"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={newCredential.issueDate}
                  onChange={(e) => setNewCredential({ ...newCredential, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={newCredential.expirationDate}
                  onChange={(e) => setNewCredential({ ...newCredential, expirationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="specialtyBoard">Specialty Board</Label>
                <Input
                  id="specialtyBoard"
                  value={newCredential.specialtyBoard}
                  onChange={(e) => setNewCredential({ ...newCredential, specialtyBoard: e.target.value })}
                  placeholder="Family Medicine"
                />
              </div>
              <div>
                <Label htmlFor="renewalRequiredBy">Renewal Required By</Label>
                <Input
                  id="renewalRequiredBy"
                  type="date"
                  value={newCredential.renewalRequiredBy}
                  onChange={(e) => setNewCredential({ ...newCredential, renewalRequiredBy: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cmeRequirements">CME Requirements</Label>
                <Input
                  id="cmeRequirements"
                  value={newCredential.cmeRequirements}
                  onChange={(e) => setNewCredential({ ...newCredential, cmeRequirements: e.target.value })}
                  placeholder="e.g., 150 hours over 3 years"
                />
              </div>
              <div>
                <Label htmlFor="maintenanceRequirements">Maintenance Requirements</Label>
                <Input
                  id="maintenanceRequirements"
                  value={newCredential.maintenanceRequirements}
                  onChange={(e) => setNewCredential({ ...newCredential, maintenanceRequirements: e.target.value })}
                  placeholder="e.g., MOC activities annually"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="boardCertified"
                  checked={newCredential.boardCertified}
                  onCheckedChange={(checked) => setNewCredential({ ...newCredential, boardCertified: checked })}
                />
                <Label htmlFor="boardCertified">Board Certified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoVerifyEnabled"
                  checked={newCredential.autoVerifyEnabled}
                  onCheckedChange={(checked) => setNewCredential({ ...newCredential, autoVerifyEnabled: checked })}
                />
                <Label htmlFor="autoVerifyEnabled">Enable Auto-Verification</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCredential.notes}
                onChange={(e) => setNewCredential({ ...newCredential, notes: e.target.value })}
                placeholder="Additional notes about this credential..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddCredential} className="bg-primary hover:bg-primary/90">
                Add Credential
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials List */}
      <div className="grid gap-4">
        {filteredCredentials.map((credential) => (
          <Card key={credential.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{credential.providerName}</h3>
                    <Badge variant="outline">{credential.credentialType}</Badge>
                    {credential.credentialNumber && <Badge variant="outline">{credential.credentialNumber}</Badge>}
                    <div className="flex items-center gap-1">
                      {getStatusIcon(credential.verificationStatus)}
                      <Badge variant={getStatusColor(credential.verificationStatus)}>
                        {credential.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                    {credential.boardCertified && (
                      <Badge variant="default">
                        <Award className="h-3 w-3 mr-1" />
                        Board Certified
                      </Badge>
                    )}
                    {credential.expirationDate && isExpiringSoon(credential.expirationDate) && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="font-medium">Issuing Organization:</span> {credential.issuingOrganization}
                  </div>

                  {credential.specialtyBoard && (
                    <div className="mb-2">
                      <span className="font-medium">Specialty Board:</span> {credential.specialtyBoard}
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-3 text-sm mb-3">
                    {credential.issueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Issued: {credential.issueDate}</span>
                      </div>
                    )}
                    {credential.expirationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Expires: {credential.expirationDate}</span>
                      </div>
                    )}
                    {credential.verificationDate && (
                      <div>
                        <span className="font-medium">Verified:</span> {credential.verificationDate}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 text-sm mb-3">
                    <div>
                      <span className="font-medium">Source:</span> {credential.verificationSource}
                    </div>
                    {credential.renewalRequiredBy && (
                      <div>
                        <span className="font-medium">Renewal Due:</span> {credential.renewalRequiredBy}
                      </div>
                    )}
                    {credential.cmeRequirements && (
                      <div>
                        <span className="font-medium">CME:</span> {credential.cmeRequirements}
                      </div>
                    )}
                    {credential.maintenanceRequirements && (
                      <div>
                        <span className="font-medium">Maintenance:</span> {credential.maintenanceRequirements}
                      </div>
                    )}
                  </div>

                  {credential.notes && (
                    <div className="text-sm mb-3">
                      <span className="font-medium">Notes:</span> {credential.notes}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {credential.autoVerifyEnabled && <Badge variant="outline">Auto-Verify Enabled</Badge>}
                    {credential.attachments && credential.attachments.length > 0 && (
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {credential.attachments.length} Attachments
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {credential.verificationStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyCredential(credential.id)}
                      disabled={isVerifying === credential.id}
                    >
                      {isVerifying === credential.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No credentials found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Add your first provider credential to get started."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credential Types Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Credential Types & Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Board Certifications</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Specialty board certifications (ABFM, ABPN, etc.)</li>
                <li>• Subspecialty certifications</li>
                <li>• Maintenance of Certification (MOC) requirements</li>
                <li>• CME and practice assessment requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Professional Licenses</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• DEA registrations for controlled substances</li>
                <li>• State controlled substance licenses</li>
                <li>• Professional certifications (ANCC, etc.)</li>
                <li>• Hospital privileges and credentialing</li>
              </ul>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              All credentials are verified against official registries and databases. Automated verification checks help
              ensure compliance and track renewal requirements for continuous provider credentialing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
