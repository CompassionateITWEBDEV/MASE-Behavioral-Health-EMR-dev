"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Wrench,
  Zap,
  Heart,
  Eye,
  Download,
  Plus,
  Edit,
  RefreshCw,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Hazard {
  id: number
  name: string
  category: string
  probability: number
  humanImpact: number
  propertyImpact: number
  businessImpact: number
  preparedness: number
  totalScore: number
  riskLevel: string
}

interface Equipment {
  id: number
  name: string
  type: string
  location: string
  lastCheck: string
  nextCheck: string
  status: string
  inspector: string
}

interface TrainingModule {
  id: number
  title: string
  category: string
  completionRate: number
  dueDate: string
  status: string
}

interface FacilityData {
  hazards: Hazard[]
  equipment: Equipment[]
  trainingModules: TrainingModule[]
  stats: {
    highRiskHazards: number
    moderateRiskHazards: number
    lowRiskHazards: number
    totalEquipment: number
    equipmentDueThisWeek: number
    overdueEquipment: number
    equipmentComplianceRate: number
    activeTrainingModules: number
    avgTrainingCompletion: number
    trainingDueThisMonth: number
    trainingComplianceRate: number
    lastUpdated: string
  }
}

export default function FacilityManagement() {
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const [showNewHazardDialog, setShowNewHazardDialog] = useState(false)
  const [showNewEquipmentDialog, setShowNewEquipmentDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<FacilityData>("/api/facility", fetcher)

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "destructive"
      case "Moderate":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "text-green-600"
      case "Needs Restocking":
        return "text-yellow-600"
      case "Low Pressure":
        return "text-orange-600"
      case "Failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const handleAddHazard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      await fetch("/api/facility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hazard",
          data: {
            name: formData.get("hazardName"),
            riskLevel: formData.get("riskLevel"),
            description: formData.get("description"),
            affectedAreas: formData
              .get("affectedAreas")
              ?.toString()
              .split(",")
              .map((a) => a.trim()),
          },
        }),
      })
      mutate()
      setShowNewHazardDialog(false)
    } catch (error) {
      console.error("Failed to add hazard:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddEquipmentCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      await fetch("/api/facility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "equipment_check",
          data: {
            name: formData.get("equipmentName"),
            type: formData.get("equipmentType"),
            location: formData.get("location"),
            status: formData.get("status"),
            inspector: formData.get("inspector"),
          },
        }),
      })
      mutate()
      setShowNewEquipmentDialog(false)
    } catch (error) {
      console.error("Failed to add equipment check:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEquipment =
    data?.equipment?.filter((item) => {
      if (equipmentFilter === "all") return true
      return item.type.toLowerCase() === equipmentFilter
    }) || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="border-b bg-card/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
                <p className="text-muted-foreground">
                  Comprehensive facility safety, equipment, and staff training management
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutate()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reports
                </Button>
                <Dialog open={showNewHazardDialog} onOpenChange={setShowNewHazardDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Hazard Assessment</DialogTitle>
                      <DialogDescription>Create a new hazard vulnerability assessment entry.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddHazard}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="hazardName">Hazard Name</Label>
                          <Input id="hazardName" name="hazardName" placeholder="e.g., Fire/Explosion" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="riskLevel">Risk Level</Label>
                          <Select name="riskLevel" defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="affectedAreas">Affected Areas (comma-separated)</Label>
                          <Input
                            id="affectedAreas"
                            name="affectedAreas"
                            placeholder="e.g., Main Building, Dispensing Room"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" placeholder="Describe the hazard..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowNewHazardDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Adding..." : "Add Hazard"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
              Failed to load facility data. Please try again.
            </div>
          )}

          <Tabs defaultValue="hva" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hva" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Assessment
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Equipment Checks
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff Training
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hva" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-12 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">High Risk Hazards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data?.stats?.highRiskHazards || 0}</div>
                        <p className="text-xs text-muted-foreground">Require immediate attention</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {data?.stats?.moderateRiskHazards || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Monitor and plan</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data?.stats?.lowRiskHazards || 0}</div>
                        <p className="text-xs text-muted-foreground">Routine monitoring</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data?.stats?.lastUpdated || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">Annual review due</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hazard Vulnerability Assessment (HVA)</CardTitle>
                  <CardDescription>Comprehensive risk evaluation for healthcare facility hazards</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : data?.hazards?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hazard assessments found.</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => setShowNewHazardDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Assessment
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hazard</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Probability</TableHead>
                          <TableHead>Human Impact</TableHead>
                          <TableHead>Property Impact</TableHead>
                          <TableHead>Business Impact</TableHead>
                          <TableHead>Preparedness</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.hazards?.map((hazard) => (
                          <TableRow key={hazard.id}>
                            <TableCell className="font-medium">{hazard.name}</TableCell>
                            <TableCell>{hazard.category}</TableCell>
                            <TableCell>{hazard.probability}</TableCell>
                            <TableCell>{hazard.humanImpact}</TableCell>
                            <TableCell>{hazard.propertyImpact}</TableCell>
                            <TableCell>{hazard.businessImpact}</TableCell>
                            <TableCell>{hazard.preparedness}</TableCell>
                            <TableCell className="font-bold">{hazard.totalScore}</TableCell>
                            <TableCell>
                              <Badge
                                variant={getRiskColor(hazard.riskLevel) as "destructive" | "secondary" | "outline"}
                              >
                                {hazard.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-12 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data?.stats?.totalEquipment || 0}</div>
                        <p className="text-xs text-muted-foreground">Items tracked</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {data?.stats?.equipmentDueThisWeek || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Inspections needed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data?.stats?.overdueEquipment || 0}</div>
                        <p className="text-xs text-muted-foreground">Immediate attention</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {data?.stats?.equipmentComplianceRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">On schedule</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Equipment Inspection Schedule</CardTitle>
                      <CardDescription>
                        Track and manage critical equipment maintenance and safety checks
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Equipment</SelectItem>
                          <SelectItem value="safety">Safety Equipment</SelectItem>
                          <SelectItem value="medical">Medical Equipment</SelectItem>
                          <SelectItem value="utility">Utility Systems</SelectItem>
                        </SelectContent>
                      </Select>
                      <Dialog open={showNewEquipmentDialog} onOpenChange={setShowNewEquipmentDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Check
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Equipment Check</DialogTitle>
                            <DialogDescription>Log a new equipment inspection or safety check.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddEquipmentCheck}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="equipmentName">Equipment Name</Label>
                                <Input
                                  id="equipmentName"
                                  name="equipmentName"
                                  placeholder="e.g., Fire Extinguisher - Main Hall"
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="equipmentType">Type</Label>
                                <Select name="equipmentType" defaultValue="safety">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="medical">Medical</SelectItem>
                                    <SelectItem value="utility">Utility</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" placeholder="e.g., Main Hallway" required />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue="Good">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Good">Good</SelectItem>
                                    <SelectItem value="Needs Restocking">Needs Restocking</SelectItem>
                                    <SelectItem value="Low Pressure">Low Pressure</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="inspector">Inspector Name</Label>
                                <Input id="inspector" name="inspector" placeholder="Your name" required />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setShowNewEquipmentDialog(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Recording..." : "Record Check"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : filteredEquipment.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No equipment checks found.</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => setShowNewEquipmentDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Record First Check
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Last Check</TableHead>
                          <TableHead>Next Check</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Inspector</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEquipment.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.type === "Safety" && <Shield className="mr-1 h-3 w-3" />}
                                {item.type === "Medical" && <Heart className="mr-1 h-3 w-3" />}
                                {item.type === "Utility" && <Zap className="mr-1 h-3 w-3" />}
                                {item.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>{item.lastCheck}</TableCell>
                            <TableCell>{item.nextCheck}</TableCell>
                            <TableCell className={getStatusColor(item.status)}>{item.status}</TableCell>
                            <TableCell>{item.inspector}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-12 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data?.stats?.activeTrainingModules || 0}</div>
                        <p className="text-xs text-muted-foreground">Training programs</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {data?.stats?.avgTrainingCompletion || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Across all staff</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {data?.stats?.trainingDueThisMonth || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Modules expiring</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {data?.stats?.trainingComplianceRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Staff certified</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Training Dashboard</CardTitle>
                  <CardDescription>Monitor training completion and compliance across all staff roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : data?.trainingModules?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No training modules configured.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data?.trainingModules?.map((module) => (
                        <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <h4 className="font-medium">{module.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{module.category}</Badge>
                              <span className="text-sm text-muted-foreground">Due: {module.dueDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{module.completionRate}%</div>
                              <Progress value={module.completionRate} className="w-24" />
                            </div>
                            <Badge
                              variant={
                                module.status === "Complete"
                                  ? "default"
                                  : module.status === "Behind"
                                    ? "destructive"
                                    : module.status === "On Track"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {module.status === "Complete" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {module.status === "Behind" && <AlertTriangle className="mr-1 h-3 w-3" />}
                              {module.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                              {module.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>Facility compliance status and documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Joint Commission Standards</h4>
                            <p className="text-sm text-muted-foreground">Last audit: Current</p>
                          </div>
                        </div>
                        <Badge>Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">DEA Regulations</h4>
                            <p className="text-sm text-muted-foreground">DEA license current</p>
                          </div>
                        </div>
                        <Badge>Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">HIPAA Compliance</h4>
                            <p className="text-sm text-muted-foreground">Training current</p>
                          </div>
                        </div>
                        <Badge>Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Fire Safety Inspection</h4>
                            <p className="text-sm text-muted-foreground">Due in 30 days</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
