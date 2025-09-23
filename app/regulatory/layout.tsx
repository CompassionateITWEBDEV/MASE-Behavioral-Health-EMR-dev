"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RegulatoryLayoutProps {
  children: React.ReactNode
}

export default function RegulatoryLayout({ children }: RegulatoryLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkRegulatoryAccess()
  }, [])

  const checkRegulatoryAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/regulatory-login")
        return
      }

      // Check if user has regulatory role
      const { data: providerData, error } = await supabase
        .from("providers")
        .select("role, inspector_id, access_expires_at")
        .eq("id", user.id)
        .single()

      if (error || !providerData) {
        router.push("/auth/regulatory-login")
        return
      }

      const regulatoryRoles = ["dea_inspector", "joint_commission_surveyor", "state_inspector", "read_only_auditor"]

      if (!regulatoryRoles.includes(providerData.role)) {
        router.push("/auth/login")
        return
      }

      // Check if access has expired
      if (providerData.access_expires_at && new Date(providerData.access_expires_at) < new Date()) {
        alert("Your regulatory access has expired. Please contact the facility administrator.")
        await supabase.auth.signOut()
        router.push("/auth/regulatory-login")
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error("Error checking regulatory access:", error)
      router.push("/auth/regulatory-login")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying regulatory access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect
  }

  return <>{children}</>
}
