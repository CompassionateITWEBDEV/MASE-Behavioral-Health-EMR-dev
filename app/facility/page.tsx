"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"

export default function FacilityManagement() {
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null)
  const [equipmentFilter, setEquipmentFilter] = useState("all")

  // Mock data for HVA
  const hazards = [
    {
      id: 1,
      name: "Fire/Explosion",
      category: "Natural",
      probability: 2,
      humanImpact: 3,
      propertyImpact: 3,
      businessImpact: 3,
      preparedness: 2,
      totalScore: 13,
      riskLevel: "High",
    },
    {
      id: 2,
      name: "Power Outage",
      category: "Technological",
      probability: 3,
      humanImpact: 2,
      propertyImpact: 2,
      businessImpact: 3,
      preparedness: 2,
      totalScore: 12,
      riskLevel: "High",
    },
    {
      id: 3,
      name: "Severe Weather",
      category: "Natural",
      probability: 2,
      humanImpact: 2,
      propertyImpact: 2,
      businessImpact: 2,
      preparedness: 3,
      totalScore: 11,
      riskLevel: "Moderate",
    },
    {
      id: 4,
      name: "Active Shooter",
      category: "Human",
      probability: 1,
      humanImpact: 3,
      propertyImpact: 1,
      businessImpact: 3,
      preparedness: 2,
      totalScore: 10,
      riskLevel: "Moderate",
    },
    {
      id: 5,
      name: "Cyber Attack",
      category: "Technological",
      probability: 2,
      humanImpact: 1,
      propertyImpact: 1,
      businessImpact: 3,
      preparedness: 1,
      totalScore: 8,
      riskLevel: "Low",
    },
  ]

  // Mock data for equipment
  const equipment = [
    {
      id: 1,
      name: "Fire Extinguisher - Main Hall",
      type: "Safety",
      location: "Main Hallway",
      lastCheck: "2024-01-08",
      nextCheck: "2024-01-15",
      status: "Good",
      inspector: "J. Smith",
    },
    {
      id: 2,
      name: "AED Unit #1",
      type: "Medical",
      location: "Reception",
      lastCheck: "2024-01-08",
      nextCheck: "2024-01-15",
      status: "Good",
      inspector: "M. Johnson",
    },
    {
      id: 3,
      name: "NARCAN Kit - Dispensing",
      type: "Medical",
      location: "Dispensing Room",
      lastCheck: "2024-01-07",
      nextCheck: "2024-01-14",
      status: "Needs Restocking",
      inspector: "R. Davis",
    },
    {
      id: 4,
      name: "Emergency Generator",
      type: "Utility",
      location: "Basement",
      lastCheck: "2024-01-01",
      nextCheck: "2024-02-01",
      status: "Good",
      inspector: "T. Wilson",
    },
    {
      id: 5,
      name: "Medical Oxygen Tank #2",
      type: "Medical",
      location: "Medical Room",
      lastCheck: "2024-01-06",
      nextCheck: "2024-01-13",
      status: "Low Pressure",
      inspector: "N. Brown",
    },
  ]

  // Mock data for training
  const trainingModules = [
    {
      id: 1,
      title: "Data Collection for Counselors",
      category: "Clinical",
      completionRate: 85,
      dueDate: "2024-01-20",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Equipment Safety Procedures",
      category: "Safety",
      completionRate: 92,
      dueDate: "2024-01-15",
      status: "On Track",
    },
    {
      id: 3,
      title: "HIPAA Compliance Update",
      category: "Compliance",
      completionRate: 78,
      dueDate: "2024-01-25",
      status: "Behind",
    },
    {
      id: 4,
      title: "Emergency Response Protocols",
      category: "Safety",
      completionRate: 95,
      dueDate: "2024-01-12",
      status: "Complete",
    },
  ]

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

  return (
    <div className="min-h-screen bg-background">
      <div className="pl-64">
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
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reports
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">
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
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">High Risk Hazards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <p className="text-xs text-muted-foreground">Require immediate attention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-xs text-muted-foreground">Monitor and plan</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">1</div>
                    <p className="text-xs text-muted-foreground">Routine monitoring</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Jan 2024</div>
                    <p className="text-xs text-muted-foreground">Annual review due</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hazard Vulnerability Assessment (HVA)</CardTitle>
                  <CardDescription>Comprehensive risk evaluation for healthcare facility hazards</CardDescription>
                </CardHeader>
                <CardContent>
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
                      {hazards.map((hazard) => (
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
                            <Badge variant={getRiskColor(hazard.riskLevel)}>{hazard.riskLevel}</Badge>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-muted-foreground">Items tracked</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">8</div>
                    <p className="text-xs text-muted-foreground">Inspections needed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <p className="text-xs text-muted-foreground">Immediate attention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <p className="text-xs text-muted-foreground">On schedule</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Inspection Schedule</CardTitle>
                  <CardDescription>Track and manage critical equipment maintenance and safety checks</CardDescription>
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
                  </div>
                </CardHeader>
                <CardContent>
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
                      {equipment.map((item) => (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Training programs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <p className="text-xs text-muted-foreground">Across all staff</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <p className="text-xs text-muted-foreground">Modules expiring</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">96%</div>
                    <p className="text-xs text-muted-foreground">Staff certified</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Training Dashboard</CardTitle>
                  <CardDescription>Monitor training completion and compliance across all staff roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingModules.map((module) => (
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
                                  : "secondary"
                            }
                          >
                            {module.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Compliance Status</CardTitle>
                    <CardDescription>Current compliance with healthcare regulations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>SAMHSA Guidelines</span>
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Joint Commission Standards</span>
                      <Badge variant="default">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>HIPAA Requirements</span>
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Review Due
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fire Safety Code</span>
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Action Required
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Inspections</CardTitle>
                    <CardDescription>Scheduled regulatory and safety inspections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Fire Department Inspection</div>
                        <div className="text-sm text-muted-foreground">Annual safety review</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Jan 25, 2024</div>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SAMHSA Site Visit</div>
                        <div className="text-sm text-muted-foreground">Program compliance review</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Feb 15, 2024</div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Joint Commission Survey</div>
                        <div className="text-sm text-muted-foreground">Accreditation renewal</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Mar 10, 2024</div>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
