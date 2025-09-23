import { Suspense } from "react"
import { AssessmentLibraryDashboard } from "@/components/assessment-library-dashboard"

export default function AssessmentLibraryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assessment Library</h2>
      </div>
      <Suspense fallback={<div>Loading assessment library...</div>}>
        <AssessmentLibraryDashboard />
      </Suspense>
    </div>
  )
}
