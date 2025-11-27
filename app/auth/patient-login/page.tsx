"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, UserCircle, ArrowLeft, Phone, Mail } from "lucide-react"

export default function PatientLoginPage() {
  const [patientId, setPatientId] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // For patient login, we verify patient ID and DOB
      // In production, this would validate against the patients table
      if (!patientId || !dateOfBirth) {
        throw new Error("Please enter your Patient ID and Date of Birth")
      }

      // Simulate verification - in production this would check the database
      router.push("/patient-portal")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#0891b2",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart style={{ color: "#ffffff", width: "24px", height: "24px" }} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>MASE Behavioral Health</span>
          </Link>
          <Link
            href="/landing"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            Back to Portal Selection
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          minHeight: "calc(100vh - 73px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <Card>
            <CardHeader style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#ecfeff",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <UserCircle style={{ width: "32px", height: "32px", color: "#0891b2" }} />
              </div>
              <CardTitle style={{ fontSize: "24px" }}>Patient Portal Login</CardTitle>
              <CardDescription>Access your health records, appointments, and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    type="text"
                    placeholder="Enter your patient ID (e.g., P-12345)"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                {error && (
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#fef2f2",
                      borderRadius: "8px",
                      color: "#dc2626",
                      fontSize: "14px",
                    }}
                  >
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    backgroundColor: "#0891b2",
                    marginTop: "8px",
                  }}
                >
                  {isLoading ? "Verifying..." : "Access Patient Portal"}
                </Button>
              </form>

              <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>
                  {"Don't know your Patient ID? Contact us:"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <a
                    href="tel:1-800-555-0123"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#0891b2",
                      fontSize: "14px",
                      textDecoration: "none",
                    }}
                  >
                    <Phone style={{ width: "14px", height: "14px" }} />
                    1-800-555-0123
                  </a>
                  <a
                    href="mailto:support@masehealth.com"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#0891b2",
                      fontSize: "14px",
                      textDecoration: "none",
                    }}
                  >
                    <Mail style={{ width: "14px", height: "14px" }} />
                    support@masehealth.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
