"use client"

import {
  Users,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Brain,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  Settings,
  Home,
  CreditCard,
  FileCheck,
  Pill,
  Video,
  Package,
  Calculator,
  UserPlus,
  Syringe,
  Archive,
  FileSignature,
  PackageCheck,
  Building2,
  ClipboardCheck,
  UserCheck,
  Send,
  Activity,
  Beaker,
  Heart,
  TrendingUp,
  Workflow,
  FileOutput,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/", active: false },
  { icon: Users, label: "Patients", href: "/patients", count: 247 },
  { icon: UserPlus, label: "Intake Queue", href: "/intake-queue", count: 5 },
  { icon: ClipboardCheck, label: "Patient Intake", href: "/intake", count: 3 },
  { icon: Video, label: "Telehealth", href: "/telehealth", count: 8 },
  { icon: FileText, label: "Documentation", href: "/documentation" },
  { icon: ClipboardList, label: "Assessments", href: "/assessments" },
  { icon: Archive, label: "Assessment Library", href: "/assessment-library", count: 19 },
  { icon: ClipboardCheck, label: "My Work", href: "/my-work", count: 6 },
  { icon: FileSignature, label: "Consent Forms", href: "/consent-forms", count: 19 },
  { icon: FileOutput, label: "Discharge Summary", href: "/discharge-summary", count: 4 },
  { icon: Send, label: "E-Prescribing", href: "/e-prescribing", count: 3 },
  { icon: Beaker, label: "Lab Integration", href: "/lab-integration", count: 7 },
  { icon: Heart, label: "Clinical Protocols", href: "/clinical-protocols", count: 12 },
  { icon: TrendingUp, label: "Advanced Reports", href: "/reports" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  { icon: Stethoscope, label: "Clinical Notes", href: "/clinical-notes" },
  { icon: Brain, label: "AI Coaching", href: "/ai-coaching", count: 5 },
  { icon: Users, label: "Patient Portal", href: "/patient-portal" },
  { icon: UserCheck, label: "Staff Management", href: "/staff", count: 24 },
  { icon: Users, label: "Care Teams", href: "/care-teams", count: 8 },
  { icon: Pill, label: "Medications", href: "/medications", count: 156 },
  { icon: Send, label: "Prescriptions", href: "/prescriptions", count: 8 },
  { icon: Syringe, label: "Methadone Dispensing", href: "/dispensing", count: 12 },
  { icon: Archive, label: "Inventory Management", href: "/inventory" },
  { icon: FileSignature, label: "DEA Form 222", href: "/form-222", count: 2 },
  { icon: PackageCheck, label: "Take-Home Management", href: "/takehome", count: 8 },
  { icon: Building2, label: "Facility Management", href: "/facility", count: 4 },
  { icon: CreditCard, label: "Insurance Management", href: "/insurance", count: 4 },
  { icon: CreditCard, label: "Billing Center", href: "/billing-center" },
  { icon: Workflow, label: "Clearinghouse", href: "/clearinghouse", count: 5 },
  { icon: UserCheck, label: "NPI Verification", href: "/npi-verification", count: 2 },
  { icon: Package, label: "OTP Bundle Billing", href: "/otp-billing" },
  { icon: Calculator, label: "Bundle Calculator", href: "/bundle-calculator" },
  { icon: FileCheck, label: "Prior Authorization", href: "/prior-auth", count: 12 },
  { icon: Pill, label: "PMP Monitoring", href: "/pmp" },
  { icon: Shield, label: "Compliance", href: "/compliance" },
  { icon: Shield, label: "Regulatory Portal", href: "/regulatory/dashboard", count: 2 },
  { icon: Activity, label: "Staff Workflows", href: "/workflows", count: 3 },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: MessageSquare, label: "Communications", href: "/communications", count: 4 },
  { icon: MessageSquare, label: "Notifications", href: "/notifications", count: 7 },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground font-[family-name:var(--font-work-sans)]">
            MASE EMR
          </span>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href || "/"}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                  {item.count && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
