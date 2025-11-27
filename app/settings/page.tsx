"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Save, Shield, Menu } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <DashboardHeader />

        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <main className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Settings
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your EMR system configuration</p>
            </div>
            <Button className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-max md:w-full md:grid md:grid-cols-6">
                <TabsTrigger value="profile" className="text-xs md:text-sm">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs md:text-sm">
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs md:text-sm">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs md:text-sm">
                  System
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-xs md:text-sm">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="appearance" className="text-xs md:text-sm">
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Profile Information</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Update your personal and professional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm">
                        First Name
                      </Label>
                      <Input id="firstName" defaultValue="Dr. Sarah" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm">
                        Last Name
                      </Label>
                      <Input id="lastName" defaultValue="Johnson" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        Email
                      </Label>
                      <Input id="email" type="email" defaultValue="sarah.johnson@mase.org" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
                        Phone
                      </Label>
                      <Input id="phone" defaultValue="(555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license" className="text-sm">
                        License Number
                      </Label>
                      <Input id="license" defaultValue="LMSW-12345" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm">
                        Role
                      </Label>
                      <Select defaultValue="lmsw">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lmsw">Licensed Master Social Worker</SelectItem>
                          <SelectItem value="md">Medical Doctor</SelectItem>
                          <SelectItem value="rn">Registered Nurse</SelectItem>
                          <SelectItem value="peer">Peer Recovery Coach</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm">
                      Professional Bio
                    </Label>
                    <Textarea id="bio" placeholder="Brief professional background..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Security Settings</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Manage your account security and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm">
                        Current Password
                      </Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm">
                        New Password
                      </Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">
                        Confirm New Password
                      </Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Two-Factor Authentication</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Session Timeout</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Auto-logout after inactivity</p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Access Log</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Recent login activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Chrome on Windows • 192.168.1.100</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Yesterday 3:45 PM</p>
                        <p className="text-xs text-muted-foreground">Safari on iPhone • 192.168.1.105</p>
                      </div>
                      <Badge variant="outline">Ended</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Patient Alerts</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">High-risk patient notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Appointment Reminders</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Upcoming appointment notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Billing Updates</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Insurance and payment notifications</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">System Announcements</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Important system updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Email Notifications</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">System Configuration</CardTitle>
                  <CardDescription className="text-xs md:text-sm">EMR system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Auto-Save Documentation</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Automatically save notes every 30 seconds
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">AI Assistance</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Enable AI-powered suggestions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Voice Recording</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Enable voice-to-text for notes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Default ASAM Level</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Default assessment level for new patients
                        </p>
                      </div>
                      <Select defaultValue="1.0">
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.0">Level 1.0</SelectItem>
                          <SelectItem value="2.1">Level 2.1</SelectItem>
                          <SelectItem value="3.1">Level 3.1</SelectItem>
                          <SelectItem value="3.7">Level 3.7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Regulatory Access Management</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Manage inspector and surveyor access to the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Enable Regulatory Portals</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Allow DEA and Joint Commission access
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Audit Logging</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Log all regulatory access activities</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Auto-Generate Reports</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Automatically prepare compliance reports
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="pt-4 border-t">
                      <Link href="/regulatory/dashboard">
                        <Button className="w-full">
                          <Shield className="h-4 w-4 mr-2" />
                          Access Regulatory Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Data Management</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Backup and data retention settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Automatic Backups</Label>
                      <p className="text-xs md:text-sm text-muted-foreground">Daily system backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Data Retention Period</Label>
                      <p className="text-xs md:text-sm text-muted-foreground">How long to keep patient records</p>
                    </div>
                    <Select defaultValue="7">
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="7">7 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Billing Configuration</CardTitle>
                  <CardDescription className="text-xs md:text-sm">OTP billing and insurance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Default Billing Method</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Preferred billing approach</p>
                      </div>
                      <Select defaultValue="bundle">
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bundle">OTP Bundle</SelectItem>
                          <SelectItem value="apg">APG Method</SelectItem>
                          <SelectItem value="auto">Auto-Select</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Auto-Submit Claims</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Automatically submit completed claims
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">PMP Integration</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Enable Michigan PMP monitoring</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Appearance Settings</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Customize the look and feel of your EMR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Theme</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <Select defaultValue="light">
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Compact Mode</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Reduce spacing for more content</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Font Size</Label>
                        <p className="text-xs md:text-sm text-muted-foreground">Adjust text size for readability</p>
                      </div>
                      <Select defaultValue="medium">
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
