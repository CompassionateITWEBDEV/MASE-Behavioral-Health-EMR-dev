"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DischargeSummaryForm } from "@/components/discharge-summary-form"
import { toast } from "sonner"

export default function EditDischargeSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [params.id])

  const loadSummary = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("discharge_summaries")
        .select(
          `
          *,
          patients!discharge_summaries_patient_id_fkey(
            id,
            first_name,
            last_name
          ),
          providers!discharge_summaries_provider_id_fkey(
            id,
            first_name,
            last_name
          )
        `,
        )
        .eq("id", params.id)
        .single()

      if (error) throw error

      // Check if already finalized
      if (data.status === "finalized") {
        toast.error("Cannot edit a finalized discharge summary")
        router.push(`/discharge-summary/${params.id}`)
        return
      }

      setSummary(data)
    } catch (error) {
      console.error("Error loading discharge summary:", error)
      toast.error("Failed to load discharge summary")
      router.push("/discharge-summaries")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pl-64">
          <DashboardHeader />
          <main className="p-6">
            <div className="text-center py-12">Loading discharge summary...</div>
          </main>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6">
          <DischargeSummaryForm existingSummary={summary} isEditing={true} />
        </main>
      </div>
    </div>
  )
}
