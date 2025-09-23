"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  ExternalLink,
} from "lucide-react"

interface NPIVerification {
  id: string
  providerId: string
  providerName: string
  npiNumber: string
  npiType: 1 | 2
  verificationStatus: "pending" | "verified" | "invalid" | "expired"
  verificationDate?: string
  verificationSource: string
  providerNameOnNPI?: string
  taxonomyCode?: string
  taxonomyDescription?: string
  practiceAddress?: string
  phoneNumber?: string
  lastUpdatedNPI?: string
  deactivationDate?: string
  reactivationDate?: string
  notes?: string
}

const mockNPIVerifications: NPIVerification[] = [
  {
    id: "1",
    providerId: "prov001",
    providerName: "Dr. Sarah Johnson",
    npiNumber: "1234567890",
    npiType: 1,
    verificationStatus: "verified",
    verificationDate: "2024-12-01",
    verificationSource: "NPPES Registry",
    providerNameOnNPI: "SARAH JOHNSON",
    taxonomyCode: "207Q00000X",
    taxonomyDescription: "Family Medicine",
    practiceAddress: "123 Medical Center Dr, Detroit, MI 48201",
    phoneNumber: "(313) 555-0123",
    lastUpdatedNPI: "2024-11-15",
    notes: "Primary care physician, verified through NPPES",
  },
  {
    id: "2",
    providerId: "prov002",
    providerName: "Dr. Michael Chen",
    npiNumber: "2345678901",
    npiType: 1,
    verificationStatus: "verified",
    verificationDate: "2024-11-28",
    verificationSource: "NPPES Registry",
    providerNameOnNPI: "MICHAEL CHEN",
    taxonomyCode: "2084P0800X",
    taxonomyDescription: "Psychiatry & Neurology - Psychiatry",
    practiceAddress: "456 Healthcare Blvd, Ann Arbor, MI 48104",
    phoneNumber: "(734) 555-0456",
    lastUpdatedNPI: "2024-10-20",
    notes: "Psychiatrist specializing in addiction medicine",
  },
  {
    id: "3",
    providerId: "prov003",
    providerName: "Dr. Emily Rodriguez",
    npiNumber: "3456789012",
    npiType: 1,
    verificationStatus: "pending",
    verificationSource: "Manual Entry",
    notes: "New provider, NPI verification in progress",
  },
  {
    id: "4",
    providerId: "prov004",
    providerName: "MASE Behavioral Health Center",
    npiNumber: "4567890123",
    npiType: 2,
    verificationStatus: "verified",
    verificationDate: "2024-12-05",
    verificationSource: "NPPES Registry",
    providerNameOnNPI: "MASE BEHAVIORAL HEALTH CENTER",
    taxonomyCode: "261QM0850X",
    taxonomyDescription: "Clinic/Center - Adult Mental Health",
    practiceAddress: "789 Treatment Way, Grand Rapids, MI 49503",
    phoneNumber: "(616) 555-0789",
    lastUpdatedNPI: "2024-11-30",
    notes: "Organizational NPI for facility billing",
  },
]

export function NPIVerificationDashboard() {
  const [npiVerifications, setNPIVerifications] = useState<NPIVerification[]>(mockNPIVerifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [newNPI, setNewNPI] = useState({
    providerName: "",
    npiNumber: "",
    npiType: 1 as 1 | 2,
    notes: "",
  })

  const filteredVerifications = npiVerifications.filter(
    (verification) =>
      verification.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.npiNumber.includes(searchTerm) ||
      verification.taxonomyDescription?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default"
      case "invalid":
        return "destructive"
      case "pending":
        return "secondary"
      case "expired":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleVerifyNPI = async (npiId: string) => {
    setIsVerifying(npiId)

    // Simulate NPI verification API call
    setTimeout(() => {
      setNPIVerifications((prev) =>
        prev.map((npi) =>
          npi.id === npiId
            ? {
                ...npi,
                verificationStatus: "verified" as const,
                verificationDate: new Date().toISOString().split("T")[0],
                verificationSource: "NPPES Registry",
                lastUpdatedNPI: new Date().toISOString().split("T")[0],
              }
            : npi,
        ),
      )
      setIsVerifying(null)
    }, 2000)
  }

  const handleAddNPI = () => {
    const newVerification: NPIVerification = {
      id: Date.now().toString(),
      providerId: `prov${Date.now()}`,
      providerName: newNPI.providerName,
      npiNumber: newNPI.npiNumber,
      npiType: newNPI.npiType,
      verificationStatus: "pending",
      verificationSource: "Manual Entry",
      notes: newNPI.notes,
    }

    setNPIVerifications([...npiVerifications, newVerification])
    setNewNPI({
      providerName: "",
      npiNumber: "",
      npiType: 1,
      notes: "",
    })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">NPI Verification System</h2>
          <p className="text-muted-foreground">Verify and manage National Provider Identifier (NPI) numbers</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add NPI
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider name, NPI number, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add NPI Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New NPI Verification</CardTitle>
            <CardDescription>Enter provider information for NPI verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="providerName">Provider Name *</Label>
                <Input
                  id="providerName"
                  value={newNPI.providerName}
                  onChange={(e) => setNewNPI({ ...newNPI, providerName: e.target.value })}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <Label htmlFor="npiNumber">NPI Number *</Label>
                <Input
                  id="npiNumber"
                  value={newNPI.npiNumber}
                  onChange={(e) => setNewNPI({ ...newNPI, npiNumber: e.target.value })}
                  placeholder="1234567890"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="npiType">NPI Type</Label>
              <Select
                value={newNPI.npiType.toString()}
                onValueChange={(value) => setNewNPI({ ...newNPI, npiType: Number.parseInt(value) as 1 | 2 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Type 1 - Individual Provider</SelectItem>
                  <SelectItem value="2">Type 2 - Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newNPI.notes}
                onChange={(e) => setNewNPI({ ...newNPI, notes: e.target.value })}
                placeholder="Additional notes about this provider..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddNPI} className="bg-primary hover:bg-primary/90">
                Add NPI
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NPI Verification List */}
      <div className="grid gap-4">
        {filteredVerifications.map((verification) => (
          <Card key={verification.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{verification.providerName}</h3>
                    <Badge variant="outline">NPI: {verification.npiNumber}</Badge>
                    <Badge variant="outline">Type {verification.npiType}</Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(verification.verificationStatus)}
                      <Badge variant={getStatusColor(verification.verificationStatus)}>
                        {verification.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {verification.taxonomyDescription && (
                    <div className="mb-2">
                      <Badge variant="secondary">{verification.taxonomyDescription}</Badge>
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-2 text-sm mb-3">
                    {verification.verificationDate && (
                      <div>
                        <span className="font-medium">Verified:</span> {verification.verificationDate}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Source:</span> {verification.verificationSource}
                    </div>
                    {verification.taxonomyCode && (
                      <div>
                        <span className="font-medium">Taxonomy:</span> {verification.taxonomyCode}
                      </div>
                    )}
                    {verification.lastUpdatedNPI && (
                      <div>
                        <span className="font-medium">Last Updated:</span> {verification.lastUpdatedNPI}
                      </div>
                    )}
                  </div>

                  {verification.practiceAddress && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Practice Address:</span> {verification.practiceAddress}
                    </div>
                  )}

                  {verification.phoneNumber && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Phone:</span> {verification.phoneNumber}
                    </div>
                  )}

                  {verification.notes && (
                    <div className="text-sm mb-3">
                      <span className="font-medium">Notes:</span> {verification.notes}
                    </div>
                  )}

                  {verification.deactivationDate && (
                    <div className="text-sm text-red-600 mb-2">
                      <span className="font-medium">Deactivated:</span> {verification.deactivationDate}
                    </div>
                  )}

                  {verification.reactivationDate && (
                    <div className="text-sm text-green-600 mb-2">
                      <span className="font-medium">Reactivated:</span> {verification.reactivationDate}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {verification.verificationStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyNPI(verification.id)}
                      disabled={isVerifying === verification.id}
                    >
                      {isVerifying === verification.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verify NPI
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
                    NPPES
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
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No NPI verifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "Add your first NPI verification to get started."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NPI Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            About NPI Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">NPI Type 1 (Individual)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Individual healthcare providers</li>
                <li>• Physicians, nurses, therapists</li>
                <li>• Must be a person, not an organization</li>
                <li>• Used for individual billing and identification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">NPI Type 2 (Organization)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Healthcare organizations and facilities</li>
                <li>• Hospitals, clinics, group practices</li>
                <li>• Suppliers and other healthcare entities</li>
                <li>• Used for organizational billing</li>
              </ul>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              All NPI numbers are verified against the National Plan and Provider Enumeration System (NPPES) registry
              maintained by CMS. Verification includes checking provider information, taxonomy codes, and practice
              locations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
