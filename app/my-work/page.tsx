import { Suspense } from "react"
import { MyWorkDashboard } from "@/components/my-work-dashboard"

export default function MyWorkPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Work</h2>
      </div>
      <Suspense fallback={<div>Loading your work queue...</div>}>
        <MyWorkDashboard />
      </Suspense>
    </div>
  )
}
