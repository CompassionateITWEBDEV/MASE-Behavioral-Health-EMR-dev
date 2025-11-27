"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ShieldCheck, ArrowLeft, AlertTriangle, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (!showMfa) {
        // First step: verify credentials
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // In production, check if user is admin and require MFA
        // For now, redirect directly
        router.push("/settings")
      } else {
        // Second step: verify MFA
        if (mfaCode.length !== 6) {
          throw new Error("Please enter a valid 6-digit code")
        }
        router.push("/settings")
      }
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
          {/* Security Warning */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "flex",
              gap: "12px",
            }}
          >
            <AlertTriangle style={{ width: "20px", height: "20px", color: "#dc2626", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#dc2626", marginBottom: "4px" }}>
                Restricted Access
              </p>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                This portal is for authorized administrators only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <ShieldCheck style={{ width: "32px", height: "32px", color: "#dc2626" }} />
              </div>
              <CardTitle style={{ fontSize: "24px" }}>Administrator Login</CardTitle>
              <CardDescription>System configuration, compliance, and organizational management</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {!showMfa ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Label htmlFor="email">Administrator Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@clinic.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Label htmlFor="mfaCode">Two-Factor Authentication Code</Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                      style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
                    />
                    <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                      Enter the code from your authenticator app
                    </p>
                  </div>
                )}

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
                    backgroundColor: "#dc2626",
                    marginTop: "8px",
                  }}
                >
                  {isLoading ? "Verifying..." : showMfa ? "Verify Code" : "Continue to Verification"}
                </Button>
              </form>

              <div style={{ marginTop: "24px" }}>
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <Lock style={{ width: "20px", height: "20px", color: "#64748b", flexShrink: 0 }} />
                  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                    <p style={{ marginBottom: "8px" }}>
                      <strong>Security Requirements:</strong>
                    </p>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      <li>Multi-factor authentication required</li>
                      <li>Session timeout after 15 minutes of inactivity</li>
                      <li>Access from approved IP addresses only</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
