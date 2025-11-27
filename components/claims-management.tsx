"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileCheck,
  Search,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Plus,
  Package,
  Send,
  AlertTriangle,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Claim {
  id: string
  claimNumber: string
  patientName: string
  patientId: string
  payerName: string
  payerId: string
  providerName: string
  providerId: string
  serviceDate: string
  submissionDate: string
  totalCharges: number
  allowedAmount?: number
  paidAmount?: number
  patientResponsibility?: number
  status: string
  claimType: string
  denialReason?: string
  appealStatus?: string
  appealDate?: string
  notes?: string
}

interface Batch {
  id: string
  batchNumber: string
  batchType: string
  batchStatus: string
  totalClaims: number
  totalCharges: number
  submittedAt?: string
  createdAt: string
  notes?: string
}

export function ClaimsManagement() {
  const { data, isLoading, mutate } = useSWR("/api/claims", fetcher)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [payerFilter, setPayerFilter] = useState<string>("all")
  const [showNewClaimDialog, setShowNewClaimDialog] = useState(false)
  const [showNewBatchDialog, setShowNewBatchDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [selectedClaimsForBatch, setSelectedClaimsForBatch] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New claim form state
  const [newClaim, setNewClaim] = useState({
    patientId: "",
    payerId: "",
    providerId: "",
    serviceDate: new Date().toISOString().split("T")[0],
    totalCharges: "",
    claimType: "professional",
    notes: "",
  })

  // New batch form state
  const [newBatch, setNewBatch] = useState({
    batchType: "837P",
    notes: "",
  })

  const claims: Claim[] = data?.claims || []
  const batches: Batch[] = data?.batches || []
  const patients = data?.patients || []
  const payers = data?.payers || []
  const providers = data?.providers || []
  const summary = data?.summary || {}

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.payerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || claim.status === statusFilter
    const matchesPayer = payerFilter === "all" || claim.payerName === payerFilter

    return matchesSearch && matchesStatus && matchesPayer
  })

  const uniquePayers = Array.from(new Set(claims.map((claim) => claim.payerName)))

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

  const handleCreateClaim = async () => {
    if (!newClaim.patientId || !newClaim.payerId || !newClaim.totalCharges) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "claim",
          ...newClaim,
          totalCharges: Number.parseFloat(newClaim.totalCharges),
        }),
      })

      if (res.ok) {
        setShowNewClaimDialog(false)
        setNewClaim({
          patientId: "",
          payerId: "",
          providerId: "",
          serviceDate: new Date().toISOString().split("T")[0],
          totalCharges: "",
          claimType: "professional",
          notes: "",
        })
        mutate()
      }
    } catch (error) {
      console.error("Error creating claim:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBatch = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "batch",
          ...newBatch,
          claimIds: selectedClaimsForBatch,
        }),
      })

      if (res.ok) {
        setShowNewBatchDialog(false)
        setNewBatch({ batchType: "837P", notes: "" })
        setSelectedClaimsForBatch([])
        mutate()
      }
    } catch (error) {
      console.error("Error creating batch:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAppeal = async (claimId: string) => {
    try {
      await fetch("/api/claims", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: claimId, action: "appeal" }),
      })
      mutate()
    } catch (error) {
      console.error("Error appealing claim:", error)
    }
  }

  const handleSubmitBatch = async (batchId: string) => {
    try {
      await fetch("/api/claims", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: batchId, action: "submit_batch" }),
      })
      mutate()
    } catch (error) {
      console.error("Error submitting batch:", error)
    }
  }

  const toggleClaimSelection = (claimId: string) => {
    setSelectedClaimsForBatch((prev) =>
      prev.includes(claimId) ? prev.filter((id) => id !== claimId) : [...prev, claimId],
    )
  }

  const pendingClaims = claims.filter((c) => c.status === "pending")

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
          <Dialog open={showNewBatchDialog} onOpenChange={setShowNewBatchDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Claim Batch</DialogTitle>
                <DialogDescription>Create a batch of claims for submission to the clearinghouse</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch Type</Label>
                    <Select
                      value={newBatch.batchType}
                      onValueChange={(v) => setNewBatch({ ...newBatch, batchType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="837P">837P - Professional</SelectItem>
                        <SelectItem value="837I">837I - Institutional</SelectItem>
                        <SelectItem value="837D">837D - Dental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Selected Claims</Label>
                    <div className="text-sm text-muted-foreground p-2 border rounded">
                      {selectedClaimsForBatch.length} claims selected
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Pending Claims to Include</Label>
                  <div className="border rounded max-h-48 overflow-y-auto">
                    {pendingClaims.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No pending claims available</div>
                    ) : (
                      pendingClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="flex items-center gap-3 p-2 border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedClaimsForBatch.includes(claim.id)}
                            onCheckedChange={() => toggleClaimSelection(claim.id)}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{claim.patientName}</span>
                            <span className="text-muted-foreground ml-2">- {claim.claimNumber}</span>
                          </div>
                          <span className="text-sm">${claim.totalCharges.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newBatch.notes}
                    onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                    placeholder="Optional batch notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewBatchDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBatch} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Batch"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewClaimDialog} onOpenChange={setShowNewClaimDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Manual Claim Entry</DialogTitle>
                <DialogDescription>Enter claim details manually for submission</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select
                      value={newClaim.patientId}
                      onValueChange={(v) => setNewClaim({ ...newClaim, patientId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Payer *</Label>
                    <Select value={newClaim.payerId} onValueChange={(v) => setNewClaim({ ...newClaim, payerId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {payers.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.payer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rendering Provider</Label>
                    <Select
                      value={newClaim.providerId}
                      onValueChange={(v) => setNewClaim({ ...newClaim, providerId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Date *</Label>
                    <Input
                      type="date"
                      value={newClaim.serviceDate}
                      onChange={(e) => setNewClaim({ ...newClaim, serviceDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Charges *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newClaim.totalCharges}
                      onChange={(e) => setNewClaim({ ...newClaim, totalCharges: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Claim Type</Label>
                    <Select
                      value={newClaim.claimType}
                      onValueChange={(v) => setNewClaim({ ...newClaim, claimType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional (CMS-1500)</SelectItem>
                        <SelectItem value="institutional">Institutional (UB-04)</SelectItem>
                        <SelectItem value="bundle">OTP Bundle</SelectItem>
                        <SelectItem value="apg">APG Claim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newClaim.notes}
                    onChange={(e) => setNewClaim({ ...newClaim, notes: e.target.value })}
                    placeholder="Service description, diagnosis codes, procedure codes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewClaimDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClaim}
                  disabled={isSubmitting || !newClaim.patientId || !newClaim.payerId || !newClaim.totalCharges}
                >
                  {isSubmitting ? "Creating..." : "Create Claim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Claims
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Batches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${(summary.totalCharges || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{summary.totalCount || 0} claims</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${(summary.totalPaid || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{summary.paidCount || 0} paid claims</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${(summary.pendingAmount || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{summary.pendingCount || 0} awaiting payment</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{summary.collectionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {Number(summary.collectionRate) >= 90 ? "Above target" : "Below target"}
                    </p>
                  </>
                )}
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

                <Button variant="outline" size="sm" onClick={() => mutate()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Claims List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No claims found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || payerFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Click 'New Claim' to create a manual claim entry."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                            <span>Submitted: {claim.submissionDate || "Not submitted"}</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {claim.status === "denied" && (
                          <Button variant="outline" size="sm" onClick={() => handleAppeal(claim.id)}>
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
          )}
        </TabsContent>

        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Batches</CardTitle>
              <CardDescription>View and manage claim batches for clearinghouse submission</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No batches found</h3>
                  <p className="text-muted-foreground">
                    Click &quot;New Batch&quot; to create a claim batch for submission.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium">{batch.batchNumber}</span>
                          <Badge variant="outline">{batch.batchType}</Badge>
                          <Badge
                            variant={
                              batch.batchStatus === "submitted"
                                ? "default"
                                : batch.batchStatus === "accepted"
                                  ? "default"
                                  : batch.batchStatus === "rejected"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {batch.batchStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {batch.totalClaims} claims | ${batch.totalCharges.toLocaleString()} total
                          {batch.submittedAt && ` | Submitted: ${new Date(batch.submittedAt).toLocaleDateString()}`}
                        </div>
                        {batch.notes && <div className="text-sm mt-1">{batch.notes}</div>}
                      </div>
                      <div className="flex gap-2">
                        {batch.batchStatus === "pending" && (
                          <Button size="sm" onClick={() => handleSubmitBatch(batch.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Claim Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Claim Number</Label>
                  <p className="font-medium">{selectedClaim.claimNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={getStatusColor(selectedClaim.status)}>{selectedClaim.status.toUpperCase()}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{selectedClaim.patientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payer</Label>
                  <p className="font-medium">{selectedClaim.payerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service Date</Label>
                  <p className="font-medium">{selectedClaim.serviceDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submission Date</Label>
                  <p className="font-medium">{selectedClaim.submissionDate || "Not submitted"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Charges</Label>
                  <p className="font-medium">${selectedClaim.totalCharges.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount Paid</Label>
                  <p className="font-medium">
                    {selectedClaim.paidAmount ? `$${selectedClaim.paidAmount.toFixed(2)}` : "Pending"}
                  </p>
                </div>
              </div>
              {selectedClaim.denialReason && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Denial Reason</span>
                  </div>
                  <p className="text-sm">{selectedClaim.denialReason}</p>
                </div>
              )}
              {selectedClaim.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedClaim.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
