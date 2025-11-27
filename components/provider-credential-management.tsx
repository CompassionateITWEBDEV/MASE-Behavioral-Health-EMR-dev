"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  FileCheck,
  Shield,
} from "lucide-react"

interface ProviderCredentialManagementProps {
  licenses: any[]
  npiRecords: any[]
  providers: any[]
  isLoading: boolean
  onRefresh: () => void
}

export function ProviderCredentialManagement({
  licenses,
  npiRecords,
  providers,
  isLoading,
  onRefresh,
}: ProviderCredentialManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Combine licenses and NPI records into credentials list
  const allCredentials = [
    ...licenses.map((l) => ({
      id: l.id,
      type: "License",
      providerName: l.providerName,
      credentialNumber: l.license_number,
      credentialType: l.license_type,
      issuingOrganization: `${l.issuing_state} State Board`,
      expirationDate: l.expiration_date,
      verificationStatus: l.verification_status,
      verificationDate: l.verification_date,
      notes: l.notes,
    })),
    ...npiRecords.map((n) => ({
      id: n.id,
      type: "NPI",
      providerName: n.providerName,
      credentialNumber: n.npi_number,
      credentialType: "NPI",
      issuingOrganization: "CMS/NPPES",
      expirationDate: null,
      verificationStatus: n.verification_status,
      verificationDate: n.verification_date,
      notes: n.notes,
    })),
  ]

  const filteredCredentials = allCredentials.filter(
    (credential) =>
      credential.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.credentialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.credentialType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.issuingOrganization?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
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
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by provider name, credential type, organization, or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCredentials.length}</div>
            <p className="text-xs text-muted-foreground">
              {licenses.length} licenses, {npiRecords.length} NPI records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allCredentials.filter((c) => c.verificationStatus === "verified").length}
            </div>
            <p className="text-xs text-muted-foreground">Active and verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allCredentials.filter((c) => c.verificationStatus === "pending" || c.verificationStatus === "expired")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Pending or expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Credentials List */}
      {filteredCredentials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Credentials Found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Add licenses and verify NPI records to see credentials here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCredentials.map((credential) => (
            <Card key={`${credential.type}-${credential.id}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {credential.type === "NPI" ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <FileCheck className="h-5 w-5 text-primary" />
                      )}
                      <h3 className="text-lg font-semibold">{credential.providerName}</h3>
                      <Badge variant="outline">{credential.type}</Badge>
                      <Badge variant="outline">{credential.credentialType}</Badge>
                      {credential.credentialNumber && <Badge variant="outline">{credential.credentialNumber}</Badge>}
                      <div className="flex items-center gap-1">
                        {getStatusIcon(credential.verificationStatus)}
                        <Badge variant={getStatusColor(credential.verificationStatus)}>
                          {credential.verificationStatus?.toUpperCase()}
                        </Badge>
                      </div>
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

                    <div className="grid gap-2 md:grid-cols-3 text-sm mb-3">
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

                    {credential.notes && (
                      <div className="text-sm mb-3">
                        <span className="font-medium">Notes:</span> {credential.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
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
      )}
    </div>
  )
}
