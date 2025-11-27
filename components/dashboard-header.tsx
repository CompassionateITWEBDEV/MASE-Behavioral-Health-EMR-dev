"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Settings, User, LogOut, UserCircle, HelpCircle } from "lucide-react"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

const notifications = [
  {
    id: 1,
    title: "New patient intake",
    message: "John Smith requires assessment",
    time: "5 min ago",
    read: false,
    link: "/intake-queue",
  },
  {
    id: 2,
    title: "Prior auth approved",
    message: "PA #12345 has been approved",
    time: "1 hour ago",
    read: false,
    link: "/prior-auth",
  },
  {
    id: 3,
    title: "Lab results ready",
    message: "UDS results for 3 patients available",
    time: "2 hours ago",
    read: true,
    link: "/lab-integration",
  },
  {
    id: 4,
    title: "Dosing hold alert",
    message: "Patient requires counselor clearance",
    time: "3 hours ago",
    read: false,
    link: "/clinical-alerts",
  },
  {
    id: 5,
    title: "Appointment reminder",
    message: "Team meeting in 30 minutes",
    time: "30 min ago",
    read: true,
    link: "/appointments",
  },
]

export function DashboardHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationList, setNotificationList] = useState(notifications)
  const unreadCount = notificationList.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="border-b px-6 py-4" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer hover:opacity-80" style={{ color: "#1e293b" }}>
              MASE Behavioral Health EMR
            </h1>
          </Link>
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

          <Sheet>
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
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </SheetTitle>
                <SheetDescription>You have {unreadCount} unread notifications</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-150px)] mt-4">
                <div className="space-y-2">
                  {notificationList.map((notification) => (
                    <Link key={notification.id} href={notification.link} onClick={() => markAsRead(notification.id)}>
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.read ? "bg-gray-50 hover:bg-gray-100" : "bg-cyan-50 hover:bg-cyan-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1" />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 pt-4 border-t">
                <Link href="/notifications">
                  <Button variant="outline" className="w-full bg-transparent">
                    View all notifications
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                General Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/subscription")}>
                <UserCircle className="mr-2 h-4 w-4" />
                Subscription & Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/staff")}>
                <User className="mr-2 h-4 w-4" />
                User Management
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/facility")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Facility Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
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
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/my-work")}>
                <Settings className="mr-2 h-4 w-4" />
                My Work Queue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/landing")} className="text-red-600 focus:text-red-600">
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
