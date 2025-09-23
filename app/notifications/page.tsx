import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TeamNotifications } from "@/components/team-notifications"

export default async function NotificationsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get provider profile
  const { data: provider } = await supabase.from("providers").select("*").eq("id", user.id).single()

  if (!provider) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Notifications
              </h1>
              <p className="text-muted-foreground">Stay updated on patient cases and team communications</p>
            </div>
          </div>

          <TeamNotifications providerId={provider.id} />
        </main>
      </div>
    </div>
  )
}
