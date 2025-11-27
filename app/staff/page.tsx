"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react"
import { useRolePermissions } from "@/lib/auth/rbac-hooks"
import type { StaffRole } from "@/lib/auth/roles"

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: StaffRole
  department: string
  status: "active" | "inactive" | "on_leave"
  lastLogin: string
  certifications: string[]
  avatar?: string
}

const mockStaff: StaffMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    phone: "(555) 123-4567",
    role: "doctor",
    department: "Medical",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    certifications: ["MD", "Addiction Medicine", "DEA License"],
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    email: "mike.rodriguez@clinic.com",
    phone: "(555) 234-5678",
    role: "counselor",
    department: "Behavioral Health",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    certifications: ["LCDC", "CADC", "Group Therapy"],
  },
  {
    id: "3",
    name: "Jennifer Lee",
    email: "jennifer.lee@clinic.com",
    phone: "(555) 345-6789",
    role: "rn",
    department: "Nursing",
    status: "active",
    lastLogin: "2024-01-15T08:45:00Z",
    certifications: ["RN", "Medication Administration", "IV Therapy"],
  },
  {
    id: "4",
    name: "David Thompson",
    email: "david.thompson@clinic.com",
    phone: "(555) 456-7890",
    role: "peer_recovery",
    department: "Peer Support",
    status: "active",
    lastLogin: "2024-01-14T16:20:00Z",
    certifications: ["CPRS", "Peer Recovery Specialist"],
  },
]

export default function StaffManagement() {
  const { hasPermission } = useRolePermissions()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

  const canManageStaff = hasPermission("staff", "write")
  const canViewStaff = hasPermission("staff", "read")

  if (!canViewStaff) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">{"You don't have permission to view staff management."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || staff.role === selectedRole
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment

    return matchesSearch && matchesRole && matchesDepartment
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      case "on_leave":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            On Leave
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: StaffRole) => {
    const roleLabels = {
      admin: "Administrator",
      doctor: "Doctor",
      rn: "Registered Nurse",
      counselor: "Counselor",
      intake: "Intake Specialist",
      peer_recovery: "Peer Recovery",
      general_staff: "General Staff",
    }

    return <Badge variant="outline">{roleLabels[role]}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members, roles, and permissions</p>
        </div>
        {canManageStaff && (
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Create a new staff account with appropriate role and permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="rn">Registered Nurse</SelectItem>
                      <SelectItem value="counselor">Counselor</SelectItem>
                      <SelectItem value="intake">Intake Specialist</SelectItem>
                      <SelectItem value="peer_recovery">Peer Recovery Specialist</SelectItem>
                      <SelectItem value="general_staff">General Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="behavioral_health">Behavioral Health</SelectItem>
                      <SelectItem value="peer_support">Peer Support</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea id="certifications" placeholder="Enter certifications (one per line)" />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Switch id="send-invite" />
                  <Label htmlFor="send-invite">Send invitation email</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddStaffOpen(false)}>Create Staff Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Directory
          </CardTitle>
          <CardDescription>View and manage all staff members across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="rn">Registered Nurse</SelectItem>
                <SelectItem value="counselor">Counselor</SelectItem>
                <SelectItem value="intake">Intake Specialist</SelectItem>
                <SelectItem value="peer_recovery">Peer Recovery</SelectItem>
                <SelectItem value="general_staff">General Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="Nursing">Nursing</SelectItem>
                <SelectItem value="Behavioral Health">Behavioral Health</SelectItem>
                <SelectItem value="Peer Support">Peer Support</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredStaff.map((staff) => (
              <Card key={staff.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                      <AvatarFallback>
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{staff.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {staff.email}
                        <Phone className="h-3 w-3 ml-2" />
                        {staff.phone}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(staff.role)}
                        <Badge variant="secondary">{staff.department}</Badge>
                        {getStatusBadge(staff.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last login: {new Date(staff.lastLogin).toLocaleDateString()}
                      </div>
                      <div className="mt-1">Certifications: {staff.certifications.join(", ")}</div>
                    </div>
                    {canManageStaff && (
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or add new staff members.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
