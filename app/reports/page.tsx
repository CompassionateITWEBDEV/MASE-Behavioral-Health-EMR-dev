import { Suspense } from "react"
import { AdvancedReportingDashboard } from "@/components/advanced-reporting-dashboard"

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Reports</h1>
        <p className="text-gray-600 mt-2">
          Productivity, financial, and compliance reporting for improved accountability
        </p>
      </div>

      <Suspense fallback={<div>Loading advanced reporting dashboard...</div>}>
        <AdvancedReportingDashboard />
      </Suspense>
    </div>
  )
}
