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
import { Heart, Stethoscope, ArrowLeft, Shield } from "lucide-react"

export default function ProviderLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [npi, setNpi] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
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
                  backgroundColor: "#f5f3ff",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Stethoscope style={{ width: "32px", height: "32px", color: "#7c3aed" }} />
              </div>
              <CardTitle style={{ fontSize: "24px" }}>Provider Portal Login</CardTitle>
              <CardDescription>Access clinical workflows, e-prescribing, and patient management</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="provider@clinic.com"
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
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="npi">NPI Number (Optional)</Label>
                  <Input
                    id="npi"
                    type="text"
                    placeholder="10-digit NPI"
                    value={npi}
                    onChange={(e) => setNpi(e.target.value)}
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
                    backgroundColor: "#7c3aed",
                    marginTop: "8px",
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign In to Provider Portal"}
                </Button>
              </form>

              <div style={{ marginTop: "24px" }}>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                    <span style={{ width: "100%", borderTop: "1px solid #e5e7eb" }} />
                  </div>
                  <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <span
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "0 12px",
                        fontSize: "12px",
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      Security Note
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f5f3ff",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <Shield style={{ width: "20px", height: "20px", color: "#7c3aed", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                    Provider accounts require DEA verification for e-prescribing controlled substances. Contact IT if
                    you need DEA credentials added to your account.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Link href="/auth/register" style={{ color: "#7c3aed", fontSize: "14px" }}>
                  New provider? Request access
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
