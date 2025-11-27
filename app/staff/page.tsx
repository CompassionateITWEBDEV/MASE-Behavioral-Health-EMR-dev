"use client"

import { useState } from "react"
import useSWR from "swr"
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
import { Switch } from "@/components/ui/switch"
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Loader2,
} from "lucide-react"
import { getRoleDisplayName, type StaffRole } from "@/lib/auth/roles"
import { getStaffMembers, createStaffMember, type StaffMember, type CreateStaffInput } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

async function fetchStaff() {
  const result = await getStaffMembers()
  if (result.error) throw new Error(result.error)
  return result.data || []
}

export default function StaffManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newStaff, setNewStaff] = useState<CreateStaffInput>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "general_staff",
    department: "",
    license_type: "",
    license_number: "",
  })
  const [sendInvite, setSendInvite] = useState(true)

  const {
    data: staffMembers = [],
    error,
    isLoading,
    mutate,
  } = useSWR<StaffMember[]>("staff-members", fetchStaff, {
    revalidateOnFocus: false,
  })

  const canManageStaff = true
  const canViewStaff = true

  const filteredStaff = staffMembers.filter((staff) => {
    const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) || staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || staff.role === selectedRole
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment

    return matchesSearch && matchesRole && matchesDepartment
  })

  // Get unique departments for filter
  const departments = [...new Set(staffMembers.map((s) => s.department).filter(Boolean))]

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const getRoleBadge = (role: StaffRole) => {
    return <Badge variant="outline">{getRoleDisplayName(role)}</Badge>
  }

  const handleCreateStaff = async () => {
    if (!newStaff.first_name || !newStaff.last_name || !newStaff.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createStaffMember(newStaff)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `${newStaff.first_name} ${newStaff.last_name} has been added to the staff.`,
      })

      // Reset form and close dialog
      setNewStaff({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "general_staff",
        department: "",
        license_type: "",
        license_number: "",
      })
      setSendInvite(true)
      setIsAddStaffOpen(false)

      // Refresh the staff list
      mutate()
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
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
                    <DialogDescription>
                      Create a new staff account with appropriate role and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="Enter first name"
                        value={newStaff.first_name}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Enter last name"
                        value={newStaff.last_name}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        value={newStaff.phone || ""}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={newStaff.role}
                        onValueChange={(value) => setNewStaff((prev) => ({ ...prev, role: value as StaffRole }))}
                      >
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
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newStaff.department || "none"}
                        onValueChange={(value) =>
                          setNewStaff((prev) => ({ ...prev, department: value === "none" ? "" : value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Department</SelectItem>
                          <SelectItem value="Medical">Medical</SelectItem>
                          <SelectItem value="Nursing">Nursing</SelectItem>
                          <SelectItem value="Behavioral Health">Behavioral Health</SelectItem>
                          <SelectItem value="Peer Support">Peer Support</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_type">License Type</Label>
                      <Input
                        id="license_type"
                        placeholder="e.g., MD, RN, LCDC"
                        value={newStaff.license_type || ""}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, license_type: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        placeholder="Enter license number"
                        value={newStaff.license_number || ""}
                        onChange={(e) => setNewStaff((prev) => ({ ...prev, license_number: e.target.value }))}
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Switch id="send-invite" checked={sendInvite} onCheckedChange={setSendInvite} />
                      <Label htmlFor="send-invite">Send invitation email</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddStaffOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateStaff} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Staff Member
                    </Button>
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
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept!}>
                        {dept}
                      </SelectItem>
                    ))}
                    {departments.length === 0 && (
                      <>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Nursing">Nursing</SelectItem>
                        <SelectItem value="Behavioral Health">Behavioral Health</SelectItem>
                        <SelectItem value="Peer Support">Peer Support</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading staff members...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Staff</h3>
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button variant="outline" onClick={() => mutate()}>
                    Try Again
                  </Button>
                </div>
              )}

              {!isLoading && !error && (
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <Card key={staff.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg" alt={`${staff.first_name} ${staff.last_name}`} />
                            <AvatarFallback>
                              {staff.first_name[0]}
                              {staff.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {staff.first_name} {staff.last_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {staff.email}
                              {staff.phone && (
                                <>
                                  <Phone className="h-3 w-3 ml-2" />
                                  {staff.phone}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {getRoleBadge(staff.role)}
                              {staff.department && <Badge variant="secondary">{staff.department}</Badge>}
                              {getStatusBadge(staff.is_active)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-muted-foreground">
                            {staff.hire_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Hired: {new Date(staff.hire_date).toLocaleDateString()}
                              </div>
                            )}
                            {staff.license_type && (
                              <div className="mt-1">
                                License: {staff.license_type} {staff.license_number && `#${staff.license_number}`}
                              </div>
                            )}
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
              )}

              {!isLoading && !error && filteredStaff.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
                  <p className="text-muted-foreground">
                    {staffMembers.length === 0
                      ? "Add your first staff member to get started."
                      : "Try adjusting your search criteria."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
