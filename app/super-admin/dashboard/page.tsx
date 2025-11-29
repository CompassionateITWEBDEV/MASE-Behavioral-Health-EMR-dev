"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, Users, CreditCard, Activity } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SuperAdminDashboard() {
  const { data: organizations, mutate } = useSWR("/api/super-admin/organizations", fetcher)
  const [newOrgOpen, setNewOrgOpen] = useState(false)
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_slug: "",
    organization_type: "behavioral_health",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "MI",
    zip_code: "",
  })

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch("/api/super-admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newOrg = await response.json()
        setNewOrgOpen(false)
        mutate()

        window.open(`/clinic-onboarding?org_id=${newOrg.id}`, "_blank")

        setFormData({
          organization_name: "",
          organization_slug: "",
          organization_type: "behavioral_health",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "MI",
          zip_code: "",
        })
      }
    } catch (error) {
      console.error("[v0] Create organization error:", error)
    }
  }

  const stats = [
    { icon: Building2, label: "Total Clinics", value: organizations?.length || 0, color: "text-blue-600" },
    {
      icon: Users,
      label: "Total Users",
      value: organizations?.reduce((acc: number, org: { user_count: number }) => acc + org.user_count, 0) || 0,
      color: "text-green-600",
    },
    {
      icon: CreditCard,
      label: "Active Subscriptions",
      value: organizations?.filter((org: { status: string }) => org.status === "active").length || 0,
      color: "text-purple-600",
    },
    { icon: Activity, label: "System Health", value: "99.9%", color: "text-green-600" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage organizations, subscriptions, and system settings</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Organizations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>Manage all clinics and practices</CardDescription>
              </div>
              <Dialog open={newOrgOpen} onOpenChange={setNewOrgOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Organization Name</Label>
                        <Input
                          value={formData.organization_name}
                          onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                          placeholder="MASE Behavioral Health"
                        />
                      </div>
                      <div>
                        <Label>Slug (URL)</Label>
                        <Input
                          value={formData.organization_slug}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                            })
                          }
                          placeholder="mase-behavioral"
                        />
                      </div>
                      <div>
                        <Label>Organization Type</Label>
                        <Select
                          value={formData.organization_type}
                          onValueChange={(value) => setFormData({ ...formData, organization_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="behavioral_health">Behavioral Health</SelectItem>
                            <SelectItem value="primary_care">Primary Care</SelectItem>
                            <SelectItem value="multi_specialty">Multi-Specialty</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="info@clinic.com"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="555-0100"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Detroit"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="MI"
                        />
                      </div>
                      <div>
                        <Label>Zip Code</Label>
                        <Input
                          value={formData.zip_code}
                          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                          placeholder="48201"
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateOrganization} className="w-full">
                      Create Organization
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations?.map(
                (org: {
                  id: string
                  organization_name: string
                  organization_type: string
                  status: string
                  user_count: number
                }) => (
                  <Card key={org.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{org.organization_name}</CardTitle>
                          <CardDescription className="capitalize">
                            {org.organization_type.replace("_", " ")}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              org.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {org.status}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{org.user_count} users</div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
