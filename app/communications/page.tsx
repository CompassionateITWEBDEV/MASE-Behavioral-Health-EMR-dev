import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TeamNotifications } from "@/components/team-notifications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Phone, Video, Bell, Search, Plus, Users } from "lucide-react"

const DEFAULT_PROVIDER = {
  id: "00000000-0000-0000-0000-000000000001",
  first_name: "Demo",
  last_name: "Provider",
  email: "demo@example.com",
  role: "physician",
}

export default async function CommunicationsPage() {
  const supabase = await createClient()

  let provider = DEFAULT_PROVIDER
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: providerData } = await supabase.from("providers").select("*").eq("id", user.id).single()
      if (providerData) {
        provider = providerData
      }
    }
  } catch (error) {
    console.log("[v0] Auth check failed, using default provider")
  }

  // Get recent care teams for quick access
  const { data: recentTeams } = await supabase
    .from("care_teams")
    .select(`
      *,
      patients(first_name, last_name)
    `)
    .eq("is_active", true)
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Communications
              </h1>
              <p className="text-muted-foreground">Team collaboration and secure messaging hub</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href="/care-teams">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Teams
                </a>
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>

          <Tabs defaultValue="team-notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="team-notifications">Team Notifications</TabsTrigger>
              <TabsTrigger value="care-teams">My Care Teams</TabsTrigger>
              <TabsTrigger value="messages">Direct Messages</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value="team-notifications" className="space-y-6">
              <TeamNotifications providerId={provider.id} />
            </TabsContent>

            <TabsContent value="care-teams" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    My Care Teams
                  </CardTitle>
                  <CardDescription>Quick access to patient care teams you are assigned to</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTeams && recentTeams.length > 0 ? (
                    <div className="space-y-3">
                      {recentTeams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {team.patients?.first_name?.[0] || "P"}
                                {team.patients?.last_name?.[0] || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{team.team_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Patient: {team.patients?.first_name || "Unknown"}{" "}
                                {team.patients?.last_name || "Patient"}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/patients/${team.patient_id}/communications`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Communications
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No care teams found yet.</p>
                      <Button variant="outline" className="mt-4 bg-transparent" asChild>
                        <a href="/care-teams">Browse Care Teams</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Direct Messages</span>
                      <Badge variant="secondary">12</Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Input placeholder="Search conversations..." className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Sarah Johnson (PT-2024-001)</p>
                          <p className="text-xs text-muted-foreground truncate">Appointment confirmation needed...</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          2
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>MC</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Michael Chen (PT-2024-002)</p>
                          <p className="text-xs text-muted-foreground truncate">Medication questions...</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          1
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>DS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Dr. Smith</p>
                          <p className="text-xs text-muted-foreground truncate">Patient care coordination...</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">PT-2024-001 - Last seen 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-96 border border-border rounded-lg p-4 space-y-4 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg max-w-xs">
                          <p className="text-sm">
                            Hi, I wanted to confirm my appointment for tomorrow at 2 PM. Also, I have some questions
                            about my medication dosage.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Today 10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                          <p className="text-sm">
                            Hello Sarah! Yes, your appointment is confirmed for tomorrow at 2 PM. I will make sure to
                            address your medication questions during our session.
                          </p>
                          <p className="text-xs text-primary-foreground/70 mt-1">Today 11:15 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg max-w-xs">
                          <p className="text-sm">Thank you! Should I bring my current medication bottles?</p>
                          <p className="text-xs text-muted-foreground mt-1">Today 11:20 AM</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Textarea placeholder="Type your message..." className="flex-1" rows={2} />
                      <Button>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Announcements</CardTitle>
                  <CardDescription>Important updates and notices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">New OTP Bundle Billing Guidelines</h4>
                        <Badge variant="outline">Jan 15, 2025</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Updated OASAS billing guidelines are now in effect. Please review the new bundle vs APG
                        criteria.
                      </p>
                      <Button variant="link" className="p-0 h-auto">
                        Read More
                      </Button>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Telehealth Platform Update</h4>
                        <Badge variant="outline">Jan 10, 2025</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enhanced auto-dictation features now available for all telehealth sessions.
                      </p>
                      <Button variant="link" className="p-0 h-auto">
                        Read More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Emergency Communications</CardTitle>
                  <CardDescription>Critical alerts and emergency protocols</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                    <h4 className="font-medium text-destructive mb-2">Emergency Contact Protocol</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      For immediate patient safety concerns, use the emergency alert system below.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm">
                        <Phone className="mr-2 h-4 w-4" />
                        Emergency Services
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bell className="mr-2 h-4 w-4" />
                        Alert Team
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Emergency Alerts</h4>
                    <div className="text-sm text-muted-foreground">No recent emergency alerts</div>
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
