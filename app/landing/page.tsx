"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Heart,
  Shield,
  Users,
  Stethoscope,
  ClipboardList,
  Lock,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  UserCircle,
  ShieldCheck,
  Activity,
  Calendar,
  FileText,
  Pill,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  const [hoveredPortal, setHoveredPortal] = useState<string | null>(null)

  const portals = [
    {
      id: "patient",
      title: "Patient Portal",
      description: "Access your health records, appointments, and communicate with your care team",
      icon: UserCircle,
      color: "#0891b2",
      bgColor: "#ecfeff",
      href: "/auth/patient-login",
      features: ["View appointments", "Message providers", "Access records", "Pay bills"],
    },
    {
      id: "staff",
      title: "Staff Portal",
      description: "Manage patient care, scheduling, and daily clinical operations",
      icon: Users,
      color: "#059669",
      bgColor: "#ecfdf5",
      href: "/auth/login",
      features: ["Patient check-in", "Schedule management", "Documentation", "Communications"],
    },
    {
      id: "provider",
      title: "Provider Portal",
      description: "Clinical workflows, prescribing, assessments, and patient management",
      icon: Stethoscope,
      color: "#7c3aed",
      bgColor: "#f5f3ff",
      href: "/auth/provider-login",
      features: ["E-Prescribing", "Clinical notes", "Lab results", "Treatment plans"],
    },
    {
      id: "admin",
      title: "Administrator Portal",
      description: "System configuration, compliance, billing, and organizational management",
      icon: ShieldCheck,
      color: "#dc2626",
      bgColor: "#fef2f2",
      href: "/auth/admin-login",
      features: ["User management", "Compliance reports", "Billing oversight", "System settings"],
    },
  ]

  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track patient progress and clinical outcomes in real-time",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security protecting sensitive health information",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent appointment management with automated reminders",
    },
    {
      icon: FileText,
      title: "Digital Documentation",
      description: "Streamlined clinical notes and assessment workflows",
    },
    { icon: Pill, title: "Medication Management", description: "E-prescribing and controlled substance tracking" },
    {
      icon: ClipboardList,
      title: "Compliance Ready",
      description: "Built-in DEA, state, and Joint Commission compliance tools",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <a
              href="#features"
              style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
            >
              Features
            </a>
            <a
              href="#portals"
              style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
            >
              Portals
            </a>
            <a
              href="#contact"
              style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}
            >
              Contact
            </a>
            <Link href="/auth/login">
              <Button style={{ backgroundColor: "#0891b2", color: "#ffffff" }}>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#ecfeff",
              borderRadius: "9999px",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: "#0891b2", fontSize: "14px", fontWeight: "500" }}>
              Trusted by 500+ behavioral health facilities
            </span>
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "700",
              color: "#0f172a",
              lineHeight: "1.1",
              marginBottom: "24px",
              maxWidth: "900px",
              margin: "0 auto 24px",
            }}
          >
            Complete EMR for Behavioral Health & OTP Clinics
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#64748b",
              maxWidth: "700px",
              margin: "0 auto 40px",
              lineHeight: "1.6",
            }}
          >
            Streamline patient care, ensure compliance, and improve outcomes with our comprehensive electronic medical
            records system designed specifically for behavioral health.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="#portals">
              <Button
                size="lg"
                style={{
                  backgroundColor: "#0891b2",
                  color: "#ffffff",
                  padding: "16px 32px",
                  fontSize: "16px",
                  height: "auto",
                }}
              >
                Access Your Portal
                <ArrowRight style={{ marginLeft: "8px", width: "20px", height: "20px" }} />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                style={{
                  padding: "16px 32px",
                  fontSize: "16px",
                  height: "auto",
                }}
              >
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              marginTop: "64px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "HIPAA Compliant", icon: Shield },
              { label: "DEA Certified", icon: CheckCircle },
              { label: "SOC 2 Type II", icon: Lock },
              { label: "42 CFR Part 2", icon: ShieldCheck },
            ].map((badge) => (
              <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <badge.icon style={{ width: "20px", height: "20px", color: "#059669" }} />
                <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section id="portals" style={{ padding: "80px 24px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
              Choose Your Portal
            </h2>
            <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
              Select the appropriate portal based on your role to access personalized features and workflows
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {portals.map((portal) => (
              <Link key={portal.id} href={portal.href} style={{ textDecoration: "none" }}>
                <Card
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: hoveredPortal === portal.id ? `2px solid ${portal.color}` : "1px solid #e5e7eb",
                    transform: hoveredPortal === portal.id ? "translateY(-4px)" : "none",
                    boxShadow: hoveredPortal === portal.id ? "0 12px 24px rgba(0,0,0,0.1)" : "none",
                    height: "100%",
                  }}
                  onMouseEnter={() => setHoveredPortal(portal.id)}
                  onMouseLeave={() => setHoveredPortal(null)}
                >
                  <CardHeader>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        backgroundColor: portal.bgColor,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <portal.icon style={{ width: "28px", height: "28px", color: portal.color }} />
                    </div>
                    <CardTitle style={{ fontSize: "20px", color: "#0f172a" }}>{portal.title}</CardTitle>
                    <CardDescription style={{ fontSize: "14px", lineHeight: "1.5" }}>
                      {portal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {portal.features.map((feature) => (
                        <li
                          key={feature}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            fontSize: "14px",
                            color: "#64748b",
                          }}
                        >
                          <CheckCircle style={{ width: "16px", height: "16px", color: portal.color }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div
                      style={{
                        marginTop: "16px",
                        display: "flex",
                        alignItems: "center",
                        color: portal.color,
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Sign In
                      <ArrowRight style={{ marginLeft: "4px", width: "16px", height: "16px" }} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 24px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>
              Everything You Need
            </h2>
            <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto" }}>
              A comprehensive suite of tools designed for behavioral health and OTP clinic workflows
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "24px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#ecfeff",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <feature.icon style={{ width: "24px", height: "24px", color: "#0891b2" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: "80px 24px", backgroundColor: "#0f172a" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#ffffff", marginBottom: "16px" }}>
            Need Help Getting Started?
          </h2>
          <p style={{ fontSize: "18px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto 40px" }}>
            Our support team is available 24/7 to assist you with any questions or technical issues
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="tel:1-800-555-0123"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#ffffff",
                textDecoration: "none",
                padding: "16px 24px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            >
              <Phone style={{ width: "20px", height: "20px" }} />
              <span>1-800-555-0123</span>
            </a>
            <a
              href="mailto:support@masehealth.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#ffffff",
                textDecoration: "none",
                padding: "16px 24px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            >
              <Mail style={{ width: "20px", height: "20px" }} />
              <span>support@masehealth.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 24px", backgroundColor: "#0f172a", borderTop: "1px solid #1e293b" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#0891b2",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart style={{ color: "#ffffff", width: "18px", height: "18px" }} />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>
              2024 MASE Behavioral Health EMR. All rights reserved.
            </span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/privacy" style={{ color: "#94a3b8", fontSize: "14px", textDecoration: "none" }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ color: "#94a3b8", fontSize: "14px", textDecoration: "none" }}>
              Terms of Service
            </a>
            <a href="/hipaa" style={{ color: "#94a3b8", fontSize: "14px", textDecoration: "none" }}>
              HIPAA Notice
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
