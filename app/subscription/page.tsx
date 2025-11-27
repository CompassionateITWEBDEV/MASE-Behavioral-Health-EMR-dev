"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Crown,
  CreditCard,
  Check,
  Pill,
  Video,
  Beaker,
  Send,
  BarChart3,
  Brain,
  Shield,
  Users,
  MessageSquare,
  FileText,
  Building2,
  Zap,
  Settings,
  AlertTriangle,
  Package,
  Clock,
  Download,
  Sparkles,
  Menu,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface SubscriptionFeature {
  id: string
  name: string
  description: string
  icon: any
  category: "clinical" | "billing" | "integration" | "operations" | "advanced"
  enabled: boolean
  tier: "basic" | "professional" | "enterprise"
  monthlyPrice: number
  usageLimit?: number
  currentUsage?: number
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billingCycle: "monthly" | "annual"
  features: string[]
  recommended?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 299,
    billingCycle: "monthly",
    features: [
      "Patient Management",
      "Basic Documentation",
      "Appointment Scheduling",
      "Up to 5 Staff Users",
      "Email Support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 599,
    billingCycle: "monthly",
    recommended: true,
    features: [
      "Everything in Basic",
      "E-Prescribing (EPCS)",
      "Telehealth",
      "Billing & Claims",
      "Lab Integration",
      "Up to 25 Staff Users",
      "Priority Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    billingCycle: "monthly",
    features: [
      "Everything in Professional",
      "AI Clinical Assistant",
      "Advanced Analytics",
      "Multi-Location Support",
      "Custom Integrations",
      "Unlimited Staff Users",
      "Dedicated Support",
      "SLA Guarantee",
    ],
  },
]

const allFeatures: SubscriptionFeature[] = [
  // Clinical Features
  {
    id: "e-prescribing",
    name: "E-Prescribing (EPCS)",
    description: "Electronic prescribing including controlled substances",
    icon: Send,
    category: "clinical",
    enabled: true,
    tier: "professional",
    monthlyPrice: 99,
  },
  {
    id: "telehealth",
    name: "Telehealth",
    description: "Video consultations with patients",
    icon: Video,
    category: "clinical",
    enabled: true,
    tier: "professional",
    monthlyPrice: 79,
    usageLimit: 500,
    currentUsage: 234,
  },
  {
    id: "lab-integration",
    name: "Lab Integration",
    description: "Connect with lab providers for orders and results",
    icon: Beaker,
    category: "clinical",
    enabled: true,
    tier: "professional",
    monthlyPrice: 59,
  },
  {
    id: "medication-dispensing",
    name: "Medication Dispensing",
    description: "Methadone and controlled substance dispensing",
    icon: Pill,
    category: "clinical",
    enabled: true,
    tier: "basic",
    monthlyPrice: 0,
  },
  {
    id: "clinical-protocols",
    name: "Clinical Protocols",
    description: "Evidence-based treatment protocols",
    icon: FileText,
    category: "clinical",
    enabled: true,
    tier: "basic",
    monthlyPrice: 0,
  },
  // Billing Features
  {
    id: "billing-claims",
    name: "Billing & Claims",
    description: "Insurance billing and claims management",
    icon: CreditCard,
    category: "billing",
    enabled: true,
    tier: "professional",
    monthlyPrice: 149,
    usageLimit: 1000,
    currentUsage: 456,
  },
  {
    id: "clearinghouse",
    name: "Clearinghouse Integration",
    description: "Direct claims submission to clearinghouses",
    icon: Building2,
    category: "billing",
    enabled: true,
    tier: "professional",
    monthlyPrice: 79,
  },
  {
    id: "prior-auth",
    name: "Prior Authorization",
    description: "Automated prior authorization workflows",
    icon: Shield,
    category: "billing",
    enabled: false,
    tier: "enterprise",
    monthlyPrice: 99,
  },
  {
    id: "otp-bundle",
    name: "OTP Bundle Billing",
    description: "Specialized OTP billing with bundle calculator",
    icon: Package,
    category: "billing",
    enabled: true,
    tier: "professional",
    monthlyPrice: 49,
  },
  // Integration Features
  {
    id: "pmp-integration",
    name: "PMP Integration",
    description: "Prescription Monitoring Program integration",
    icon: Shield,
    category: "integration",
    enabled: true,
    tier: "professional",
    monthlyPrice: 49,
  },
  {
    id: "patient-portal",
    name: "Patient Portal",
    description: "Patient self-service portal",
    icon: Users,
    category: "integration",
    enabled: true,
    tier: "basic",
    monthlyPrice: 0,
  },
  {
    id: "mobile-check-in",
    name: "Mobile Check-In",
    description: "Patient mobile check-in and queue management",
    icon: Clock,
    category: "integration",
    enabled: true,
    tier: "professional",
    monthlyPrice: 39,
  },
  {
    id: "sms-reminders",
    name: "SMS/Email Reminders",
    description: "Automated appointment and medication reminders",
    icon: MessageSquare,
    category: "integration",
    enabled: true,
    tier: "professional",
    monthlyPrice: 29,
    usageLimit: 5000,
    currentUsage: 2340,
  },
  // Operations Features
  {
    id: "staff-management",
    name: "Staff Management",
    description: "Advanced staff roles and permissions",
    icon: Users,
    category: "operations",
    enabled: true,
    tier: "basic",
    monthlyPrice: 0,
  },
  {
    id: "multi-location",
    name: "Multi-Location Support",
    description: "Manage multiple clinic locations",
    icon: Building2,
    category: "operations",
    enabled: false,
    tier: "enterprise",
    monthlyPrice: 199,
  },
  {
    id: "workflows",
    name: "Custom Workflows",
    description: "Create and manage custom clinical workflows",
    icon: Settings,
    category: "operations",
    enabled: true,
    tier: "professional",
    monthlyPrice: 49,
  },
  // Advanced Features
  {
    id: "ai-assistant",
    name: "AI Clinical Assistant",
    description: "AI-powered documentation and decision support",
    icon: Brain,
    category: "advanced",
    enabled: false,
    tier: "enterprise",
    monthlyPrice: 199,
    usageLimit: 1000,
    currentUsage: 0,
  },
  {
    id: "advanced-analytics",
    name: "Advanced Analytics",
    description: "Comprehensive reporting and analytics dashboard",
    icon: BarChart3,
    category: "advanced",
    enabled: false,
    tier: "enterprise",
    monthlyPrice: 149,
  },
  {
    id: "predictive-insights",
    name: "Predictive Insights",
    description: "AI-powered patient outcome predictions",
    icon: Sparkles,
    category: "advanced",
    enabled: false,
    tier: "enterprise",
    monthlyPrice: 249,
  },
]

export default function SubscriptionPage() {
  const [features, setFeatures] = useState<SubscriptionFeature[]>(allFeatures)
  const [currentPlan] = useState("professional")
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [isAddOnOpen, setIsAddOnOpen] = useState(false)
  const [selectedAddOn, setSelectedAddOn] = useState<SubscriptionFeature | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          // Check if feature is available in current plan
          const tierOrder = { basic: 0, professional: 1, enterprise: 2 }
          const currentTierLevel = tierOrder[currentPlan as keyof typeof tierOrder]
          const featureTierLevel = tierOrder[f.tier]

          if (featureTierLevel > currentTierLevel && !f.enabled) {
            // Would need to upgrade or add on
            setSelectedAddOn(f)
            setIsAddOnOpen(true)
            return f
          }

          return { ...f, enabled: !f.enabled }
        }
        return f
      }),
    )
  }

  const enabledFeatures = features.filter((f) => f.enabled)
  const disabledFeatures = features.filter((f) => !f.enabled)
  const monthlyAddOns = enabledFeatures.reduce((sum, f) => sum + f.monthlyPrice, 0)
  const basePlanPrice = subscriptionPlans.find((p) => p.id === currentPlan)?.price || 0
  const totalMonthly = basePlanPrice + monthlyAddOns

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "clinical":
        return <Pill className="h-4 w-4" />
      case "billing":
        return <CreditCard className="h-4 w-4" />
      case "integration":
        return <Zap className="h-4 w-4" />
      case "operations":
        return <Settings className="h-4 w-4" />
      case "advanced":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "basic":
        return <Badge variant="secondary">Basic</Badge>
      case "professional":
        return <Badge style={{ backgroundColor: "#0891b2", color: "white" }}>Professional</Badge>
      case "enterprise":
        return <Badge style={{ backgroundColor: "#7c3aed", color: "white" }}>Enterprise</Badge>
      default:
        return <Badge variant="outline">{tier}</Badge>
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <DashboardHeader />

        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <main className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#1e293b" }}>
                Subscription Management
              </h1>
              <p className="text-sm md:text-base" style={{ color: "#64748b" }}>
                Manage your EMR features and subscription plan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export Usage Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: "#7c3aed" }} className="w-full sm:w-auto">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose Your Plan</DialogTitle>
                    <DialogDescription>{"Select the plan that best fits your clinic's needs"}</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {subscriptionPlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative ${plan.recommended ? "ring-2" : ""}`}
                        style={plan.recommended ? { borderColor: "#0891b2" } : undefined}
                      >
                        {plan.recommended && (
                          <div
                            className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full"
                            style={{ backgroundColor: "#0891b2", color: "white" }}
                          >
                            Recommended
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {plan.name}
                            {currentPlan === plan.id && (
                              <Badge variant="outline" style={{ color: "#16a34a" }}>
                                Current
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="text-3xl font-bold">
                            ${plan.price}
                            <span className="text-sm font-normal" style={{ color: "#64748b" }}>
                              /month
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#16a34a" }} />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="w-full mt-4"
                            variant={currentPlan === plan.id ? "outline" : "default"}
                            disabled={currentPlan === plan.id}
                          >
                            {currentPlan === plan.id ? "Current Plan" : "Select Plan"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Current Plan Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                      Current Plan
                    </p>
                    <p className="text-lg md:text-2xl font-bold capitalize">{currentPlan}</p>
                  </div>
                  <Crown className="h-6 w-6 md:h-8 md:w-8" style={{ color: "#0891b2" }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                      Monthly Cost
                    </p>
                    <p className="text-lg md:text-2xl font-bold">${totalMonthly}</p>
                  </div>
                  <CreditCard className="h-6 w-6 md:h-8 md:w-8" style={{ color: "#16a34a" }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                      Active Features
                    </p>
                    <p className="text-lg md:text-2xl font-bold">{enabledFeatures.length}</p>
                  </div>
                  <Check className="h-6 w-6 md:h-8 md:w-8" style={{ color: "#16a34a" }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                      Add-Ons Cost
                    </p>
                    <p className="text-lg md:text-2xl font-bold">${monthlyAddOns}</p>
                  </div>
                  <Package className="h-6 w-6 md:h-8 md:w-8" style={{ color: "#f59e0b" }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-max md:w-auto">
                <TabsTrigger value="overview" className="text-xs md:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="clinical" className="text-xs md:text-sm">
                  Clinical
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-xs md:text-sm">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="integration" className="text-xs md:text-sm">
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="operations" className="text-xs md:text-sm">
                  Operations
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs md:text-sm">
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="usage" className="text-xs md:text-sm">
                  Usage
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Enabled Features */}
                <Card>
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Check className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#16a34a" }} />
                      Enabled Features ({enabledFeatures.length})
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Features currently active in your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 md:space-y-3 max-h-72 md:max-h-96 overflow-y-auto">
                      {enabledFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center justify-between p-2 md:p-3 rounded-lg"
                          style={{ backgroundColor: "#f0fdf4" }}
                        >
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <feature.icon
                              className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0"
                              style={{ color: "#16a34a" }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm md:text-base truncate">{feature.name}</p>
                              <p className="text-xs hidden sm:block" style={{ color: "#64748b" }}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {feature.monthlyPrice > 0 && (
                              <span className="text-xs md:text-sm hidden sm:inline" style={{ color: "#64748b" }}>
                                +${feature.monthlyPrice}/mo
                              </span>
                            )}
                            <Switch checked={feature.enabled} onCheckedChange={() => toggleFeature(feature.id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Available Add-Ons */}
                <Card>
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Package className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#64748b" }} />
                      Available Add-Ons ({disabledFeatures.length})
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Additional features you can enable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 md:space-y-3 max-h-72 md:max-h-96 overflow-y-auto">
                      {disabledFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center justify-between p-2 md:p-3 rounded-lg border"
                          style={{ borderColor: "#e2e8f0" }}
                        >
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <feature.icon
                              className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0"
                              style={{ color: "#64748b" }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                <p className="font-medium text-sm md:text-base">{feature.name}</p>
                                <span className="hidden sm:inline">{getTierBadge(feature.tier)}</span>
                              </div>
                              <p className="text-xs hidden sm:block" style={{ color: "#64748b" }}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs md:text-sm font-medium" style={{ color: "#0891b2" }}>
                              +${feature.monthlyPrice}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleFeature(feature.id)}
                              className="text-xs md:text-sm"
                            >
                              Enable
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Category-specific tabs */}
            {["clinical", "billing", "integration", "operations", "advanced"].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <Card>
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-2 capitalize text-base md:text-lg">
                      {getCategoryIcon(category)}
                      {category} Features
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Manage {category} features for your clinic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 md:space-y-4">
                      {features
                        .filter((f) => f.category === category)
                        .map((feature) => (
                          <div
                            key={feature.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border gap-3"
                            style={{
                              borderColor: feature.enabled ? "#86efac" : "#e2e8f0",
                              backgroundColor: feature.enabled ? "#f0fdf4" : "#ffffff",
                            }}
                          >
                            <div className="flex items-start sm:items-center gap-3 md:gap-4">
                              <div
                                className="p-2 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: feature.enabled ? "#dcfce7" : "#f1f5f9" }}
                              >
                                <feature.icon
                                  className="h-5 w-5 md:h-6 md:w-6"
                                  style={{ color: feature.enabled ? "#16a34a" : "#64748b" }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm md:text-base">{feature.name}</p>
                                  {getTierBadge(feature.tier)}
                                </div>
                                <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                                  {feature.description}
                                </p>
                                {feature.usageLimit && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>
                                        Usage: {feature.currentUsage?.toLocaleString()} /{" "}
                                        {feature.usageLimit.toLocaleString()}
                                      </span>
                                      <span>
                                        {Math.round(((feature.currentUsage || 0) / feature.usageLimit) * 100)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={((feature.currentUsage || 0) / feature.usageLimit) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                              <div className="text-left sm:text-right">
                                {feature.monthlyPrice > 0 ? (
                                  <p className="font-semibold text-sm md:text-base">${feature.monthlyPrice}/mo</p>
                                ) : (
                                  <p className="text-xs md:text-sm" style={{ color: "#16a34a" }}>
                                    Included
                                  </p>
                                )}
                              </div>
                              <Switch checked={feature.enabled} onCheckedChange={() => toggleFeature(feature.id)} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Usage & Limits</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Monitor your feature usage and limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 md:space-y-6">
                    {features
                      .filter((f) => f.usageLimit)
                      .map((feature) => (
                        <div key={feature.id} className="space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <feature.icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#64748b" }} />
                              <span className="font-medium text-sm md:text-base">{feature.name}</span>
                              {!feature.enabled && (
                                <Badge variant="outline" style={{ color: "#dc2626" }} className="text-xs">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                              {feature.currentUsage?.toLocaleString()} / {feature.usageLimit?.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={((feature.currentUsage || 0) / (feature.usageLimit || 1)) * 100}
                            className="h-2 md:h-3"
                          />
                          {((feature.currentUsage || 0) / (feature.usageLimit || 1)) * 100 > 80 && (
                            <p className="text-xs flex items-center gap-1" style={{ color: "#f59e0b" }}>
                              <AlertTriangle className="h-3 w-3" />
                              Approaching limit - consider upgrading
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Staff Users</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Active users on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm md:text-base">
                      <span className="font-medium">Active Staff Members</span>
                      <span>18 / 25</span>
                    </div>
                    <Progress value={72} className="h-2 md:h-3" />
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                      Professional plan includes up to 25 staff users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add-On Upgrade Dialog */}
          <Dialog open={isAddOnOpen} onOpenChange={setIsAddOnOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">Enable {selectedAddOn?.name}</DialogTitle>
                <DialogDescription>This feature requires an upgrade or add-on purchase</DialogDescription>
              </DialogHeader>
              {selectedAddOn && (
                <div className="py-4 space-y-4">
                  <div
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <selectedAddOn.icon className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0" style={{ color: "#0891b2" }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm md:text-base">{selectedAddOn.name}</p>
                      <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                        {selectedAddOn.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm md:text-base">Required Tier</p>
                      <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                        Available in {selectedAddOn.tier} plan
                      </p>
                    </div>
                    {getTierBadge(selectedAddOn.tier)}
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm md:text-base">Add-On Price</p>
                      <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>
                        Monthly recurring charge
                      </p>
                    </div>
                    <p className="text-lg md:text-xl font-bold">${selectedAddOn.monthlyPrice}/mo</p>
                  </div>
                </div>
              )}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddOnOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (selectedAddOn) {
                      setFeatures((prev) => prev.map((f) => (f.id === selectedAddOn.id ? { ...f, enabled: true } : f)))
                    }
                    setIsAddOnOpen(false)
                  }}
                >
                  Enable (+${selectedAddOn?.monthlyPrice}/mo)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
