"use client"

import { OTPBundleCalculator } from "@/components/otp-bundle-calculator"

export default function BundleCalculatorPage() {
  return (
    <div className="flex-1 space-y-6 p-6 ml-64">
      <div>
        <h1 className="text-3xl font-bold">OTP Bundle vs APG Calculator</h1>
        <p className="text-muted-foreground">OASAS-compliant billing decision support tool for optimal reimbursement</p>
      </div>

      <OTPBundleCalculator />
    </div>
  )
}
