"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag as Flask, Plus, FileCheck, Clock } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ToxicologyPage() {
  const { data, error, isLoading } = useSWR("/api/toxicology", fetcher)
  const { data: labsData } = useSWR("/api/toxicology?action=labs", fetcher)
  const { data: ordersData } = useSWR("/api/toxicology?action=orders", fetcher)

  const [newLabOpen, setNewLabOpen] = useState(false)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Toxicology Lab Integration</h1>
              <p className="text-muted-foreground">Drug Screening Orders & Results</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Drug Screen Order
            </Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Collection</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.pending || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Lab</CardTitle>
                <Flask className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.collected || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Results Ready</CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.stats?.resulted || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Toxicology lab integration is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This module will provide automated drug screening order management, specimen tracking, and result
                integration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
