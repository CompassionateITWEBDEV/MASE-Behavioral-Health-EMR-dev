"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  UserCircle,
  Briefcase,
  Building2,
  CreditCard,
  Users,
  Cog,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const initialNotifications = [
  {
    id: 1,
    title: "New Patient Intake",
    message: "John D. completed intake forms",
    time: "5 min ago",
    read: false,
    link: "/intake-queue",
  },
  {
    id: 2,
    title: "Lab Results Ready",
    message: "UDS results for Sarah M.",
    time: "15 min ago",
    read: false,
    link: "/patients",
  },
  {
    id: 3,
    title: "Appointment Reminder",
    message: "3 appointments in next hour",
    time: "30 min ago",
    read: true,
    link: "/appointments",
  },
  {
    id: 4,
    title: "Prior Auth Approved",
    message: "Auth #PA-2024-001 approved",
    time: "1 hour ago",
    read: true,
    link: "/insurance",
  },
  {
    id: 5,
    title: "Compliance Alert",
    message: "2 assessments due today",
    time: "2 hours ago",
    read: false,
    link: "/assessments",
  },
]

export function DashboardHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(initialNotifications)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    setNotificationOpen(false)
    router.push(notification.link)
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleSettingsNavigation = (path: string) => {
    setSettingsOpen(false)
    router.push(path)
  }

  const handleUserNavigation = (path: string) => {
    setUserMenuOpen(false)
    router.push(path)
  }

  const handleSignOut = () => {
    setUserMenuOpen(false)
    router.push("/landing")
  }

  return (
    <header className="border-b px-6 py-4" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
            MASE Behavioral Health EMR
          </h1>
          <Badge variant="secondary" style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}>
            AI-Assisted
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: "#64748b" }}
            />
            <Input
              placeholder="Search patients, records..."
              className="pl-10 w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    style={{ backgroundColor: "#0891b2", color: "#ffffff" }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader className="flex flex-row items-center justify-between">
                <SheetTitle>Notifications</SheetTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        notification.read
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "bg-cyan-50 hover:bg-cyan-100 border-l-4 border-cyan-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleSettingsNavigation("/settings")}>
                <Cog className="mr-2 h-4 w-4" />
                General Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSettingsNavigation("/subscription")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription & Billing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSettingsNavigation("/staff")}>
                <Users className="mr-2 h-4 w-4" />
                User Management
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSettingsNavigation("/facility")}>
                <Building2 className="mr-2 h-4 w-4" />
                Facility Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>Dr. Sarah Johnson</span>
                  <span className="text-xs font-normal text-gray-500">Medical Director</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleUserNavigation("/settings")}>
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleUserNavigation("/my-work")}>
                <Briefcase className="mr-2 h-4 w-4" />
                My Work Queue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
