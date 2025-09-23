"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileCheck, Search, Eye, RefreshCw, Download, Filter, Calendar, DollarSign } from "lucide-react"

interface Claim {
  id: string
  claimNumber: string
  patientName: string
  payerName: string
  serviceDate: string
  submissionDate: string
  totalCharges: number
  allowedAmount?: number
  paidAmount?: number
  patientResponsibility?: number
  status: "pending" | "submitted" | "paid" | "denied" | "appealed"
  denialReason?: string
  notes?: string
}

const mockClaims: Claim[] = [
  {
    id: "1",
    claimNumber: "BC2024001",
    patientName: "Sarah Johnson",
    payerName: "Blue Cross Blue Shield",
    serviceDate: "2024-12-01",
    submissionDate: "2024-12-02",
    totalCharges: 1247.5,
    allowedAmount: 1247.5,
    paidAmount: 1247.5,
    patientResponsibility: 25.0,
    status: "paid",
    notes: "IOP services - 4 weeks",
  },
  {
    id: "2",
    claimNumber: "AET2024089",
    patientName: "Michael Chen",
    payerName: "Aetna",
    serviceDate: "2024-12-03",
    submissionDate: "2024-12-04",
    totalCharges: 892.0,
    status: "submitted",
    notes: "MAT services - weekly visit",
  },
  {
    id: "3",
    claimNumber: "UHC2024156",
    patientName: "Emily Rodriguez",
    payerName: "UnitedHealthcare",
    serviceDate: "2024-11-28",
    submissionDate: "2024-11-29",
    totalCharges: 345.0,
    status: "denied",
    denialReason: "Prior authorization required",
    notes: "Group therapy session",
  },
  {
    id: "4",
    claimNumber: "CIG2024078",
    patientName: "Robert Kim",
    payerName: "Cigna",
    serviceDate: "2024-12-05",
    submissionDate: "2024-12-06",
    totalCharges: 450.0,
    allowedAmount: 450.0,
    paidAmount: 450.0,
    patientResponsibility: 30.0,
    status: "paid",
    notes: "Psychiatric evaluation",
  },
  {
    id: "5",
    claimNumber: "MED2024234",
    patientName: "Lisa Wang",
    payerName: "Medicaid",
    serviceDate: "2024-12-07",
    submissionDate: "2024-12-08",
    totalCharges: 180.0,
    status: "pending",
    notes: "Individual counseling session",
  },
]

export function ClaimsManagement() {
  const [claims, setClaims] = useState<Claim[]>(mockClaims)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [payerFilter, setPayerFilter] = useState<string>("all")

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.payerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || claim.status === statusFilter
    const matchesPayer = payerFilter === "all" || claim.payerName === payerFilter

    return matchesSearch && matchesStatus && matchesPayer
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "submitted":
      case "pending":
        return "secondary"
      case "denied":
        return "destructive"
      case "appealed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const uniquePayers = Array.from(new Set(claims.map((claim) => claim.payerName)))

  const totalCharges = filteredClaims.reduce((sum, claim) => sum + claim.totalCharges, 0)
  const totalPaid = filteredClaims.reduce((sum, claim) => sum + (claim.paidAmount || 0), 0)
  const pendingAmount = filteredClaims
    .filter((claim) => claim.status === "pending" || claim.status === "submitted")
    .reduce((sum, claim) => sum + claim.totalCharges, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Claims Management</h2>
          <p className="text-muted-foreground">Track and manage insurance claims</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Claims
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileCheck className="mr-2 h-4 w-4" />
            Submit Batch
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCharges.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredClaims.length} claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{((totalPaid / totalCharges) * 100).toFixed(1)}% of charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims by number, patient, or payer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={payerFilter} onValueChange={setPayerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payers</SelectItem>
                  {uniquePayers.map((payer) => (
                    <SelectItem key={payer} value={payer}>
                      {payer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <div className="grid gap-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{claim.patientName}</h3>
                    <Badge variant="outline">{claim.claimNumber}</Badge>
                    <Badge variant={getStatusColor(claim.status)}>{claim.status.toUpperCase()}</Badge>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3 text-sm mb-3">
                    <div>
                      <span className="font-medium">Payer:</span> {claim.payerName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Service: {claim.serviceDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Submitted: {claim.submissionDate}</span>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Charges:</span> ${claim.totalCharges.toFixed(2)}
                    </div>
                    {claim.allowedAmount && (
                      <div>
                        <span className="font-medium">Allowed:</span> ${claim.allowedAmount.toFixed(2)}
                      </div>
                    )}
                    {claim.paidAmount && (
                      <div>
                        <span className="font-medium">Paid:</span> ${claim.paidAmount.toFixed(2)}
                      </div>
                    )}
                    {claim.patientResponsibility && (
                      <div>
                        <span className="font-medium">Patient:</span> ${claim.patientResponsibility.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {claim.denialReason && (
                    <div className="text-sm text-red-600 mb-2">
                      <span className="font-medium">Denial Reason:</span> {claim.denialReason}
                    </div>
                  )}

                  {claim.notes && (
                    <div className="text-sm mb-3">
                      <span className="font-medium">Notes:</span> {claim.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {claim.status === "denied" && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Appeal
                    </Button>
                  )}
                  {(claim.status === "pending" || claim.status === "submitted") && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClaims.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No claims found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || payerFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Claims will appear here once submitted."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
