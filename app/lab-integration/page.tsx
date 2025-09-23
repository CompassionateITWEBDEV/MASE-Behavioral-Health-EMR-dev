import { Suspense } from "react"
import { LabIntegrationDashboard } from "@/components/lab-integration-dashboard"

export default function LabIntegrationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lab Integration</h1>
        <p className="text-gray-600 mt-2">Manage lab orders and results with bi-directional integration</p>
      </div>

      <Suspense fallback={<div>Loading lab integration dashboard...</div>}>
        <LabIntegrationDashboard />
      </Suspense>
    </div>
  )
}
