"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp, TrendingDown } from "lucide-react"

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [physicianSignature, setPhysicianSignature] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // Changed to "all" to show all orders by default
  const [hasSession, setHasSession] = useState<boolean | null>(null) // Track session state
  const { toast } = useToast()

  // Map filterStatus to database status values (moved to component level for JSX access)
  const statusMap: Record<string, string> = {
    pending: "pending_physician_review",
    approved: "approved",
    denied: "denied",
    draft: "draft", // Added draft status
  }

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      
      // Check if user is authenticated (regular Supabase auth OR superadmin)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Also check for superadmin session (cookie-based)
      const isSuperAdmin = typeof document !== 'undefined' && (
        document.cookie.includes('super_admin_session=') ||
        localStorage.getItem('super_admin_session')
      )
      
      if (sessionError) {
        console.warn("[Order Management] Session error (non-blocking):", sessionError.message)
      }
      
      if (!session && !isSuperAdmin) {
        // This is expected behavior - user needs to login
        // Using console.warn instead of console.error since it's not a code error
        console.warn("[Order Management] ⚠️ No active session - RLS policies will block access")
        console.warn("[Order Management] Please login at /auth/login or /super-admin/login to view orders")
        setHasSession(false)
        toast({
          title: "Authentication Required",
          description: "Please login to view medication orders. RLS policies require authentication.",
          variant: "destructive",
        })
      } else {
        if (session) {
          console.log("[Order Management] ✅ User session active:", session.user.email)
        } else if (isSuperAdmin) {
          console.log("[Order Management] ✅ Superadmin session active")
        }
        setHasSession(true)
      }
      
      // If superadmin, use API endpoint which bypasses RLS via service client
      // Otherwise use direct Supabase query
      let data: any[] | null = null
      let error: any = null
      
      if (isSuperAdmin) {
        // Superadmin: Use API endpoint which uses service client (bypasses RLS)
        console.log("[Order Management] Superadmin detected - using API endpoint to bypass RLS")
        try {
          const apiUrl = new URL("/api/medication-order-requests", window.location.origin)
          if (filterStatus !== "all" && statusMap[filterStatus]) {
            apiUrl.searchParams.set("status", statusMap[filterStatus])
          }
          
          const response = await fetch(apiUrl.toString(), {
            method: "GET",
            credentials: "include", // Include cookies for superadmin session
            headers: {
              "Content-Type": "application/json",
            },
          })
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
          }
          
          const apiData = await response.json()
          data = apiData.order_requests || []
          console.log(`[Order Management] API returned ${data.length} orders`)
          
          // Debug: Check if patient data is included
          if (data.length > 0) {
            console.log("[Order Management] Sample API order:", {
              id: data[0].id,
              patient_id: data[0].patient_id,
              patients: data[0].patients,
              hasPatientData: !!(data[0].patients?.first_name && data[0].patients?.last_name)
            })
          }
        } catch (apiError) {
          console.error("[Order Management] API error:", apiError)
          error = apiError
        }
      } else {
        // Regular user: Use direct Supabase query
        let query = supabase
          .from("medication_order_requests")
          .select("*, patients(first_name, last_name)")
        
        // Only apply status filter if not "all"
        if (filterStatus !== "all" && statusMap[filterStatus]) {
          query = query.eq("status", statusMap[filterStatus])
        }
        
        const result = await query.order("created_at", { ascending: false })
        data = result.data
        error = result.error
      }
      
      // Debug: Log the actual query being executed
      const hasAnySession = !!session || isSuperAdmin
      console.log("[Order Management] Query details:", {
        table: "medication_order_requests",
        filter: filterStatus,
        statusFilter: filterStatus !== "all" && statusMap[filterStatus] ? statusMap[filterStatus] : "none (all orders)",
        hasSession: !!session,
        isSuperAdmin: isSuperAdmin,
        hasAnySession: hasAnySession,
      })
      
      console.log("[Order Management] Orders query result:", {
        dataCount: data?.length || 0,
        hasError: !!error,
        errorMessage: error?.message,
        filterStatus: filterStatus,
        statusMapValue: statusMap[filterStatus],
        queryFilter: filterStatus !== "all" && statusMap[filterStatus] ? statusMap[filterStatus] : "all"
      })

      if (error) {
        // Supabase errors are not standard Error objects, so we need to handle them specially
        const errorInfo = {
          message: error.message || "Unknown error",
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
        }
        console.error("[Order Management] Supabase error:", errorInfo)
        console.error("[Order Management] Full error object:", JSON.stringify(error, null, 2))
        toast({
          title: "Error",
          description: errorInfo.message || "Failed to fetch orders",
          variant: "destructive",
        })
        setOrders([])
        return
      }
      
      // Log if no data returned
      if (!data || data.length === 0) {
        console.warn("[Order Management] No orders returned from query", {
          filterStatus,
          statusFilter: filterStatus !== "all" && statusMap[filterStatus] ? statusMap[filterStatus] : "none (showing all)",
          tableName: "medication_order_requests",
          hasSession: !!session,
        })
        
        // Try to check if there are ANY orders in the table (for debugging)
        // Note: This will also be blocked by RLS if not authenticated
        // Superadmin should use API endpoint which uses service client
        if (isSuperAdmin) {
          console.warn("[Order Management] Superadmin detected - queries may still be blocked by RLS")
          console.warn("[Order Management] Superadmin should use API endpoints which bypass RLS, or RLS policies need to allow superadmin access")
        }
        
        const { data: allOrdersCheck, error: checkError } = await supabase
          .from("medication_order_requests")
          .select("id, status, created_at")
          .limit(5)
        
        if (checkError) {
          console.error("[Order Management] Error checking for any orders:", checkError)
          if (isSuperAdmin) {
            console.error("[Order Management] Superadmin query blocked - RLS policies need to be updated to allow superadmin access")
          }
        } else {
          console.log(`[Order Management] Total orders in table (any status): ${allOrdersCheck?.length || 0}`, allOrdersCheck)
        }
      } else {
        console.log(`[Order Management] Successfully fetched ${data.length} orders`)
        console.log("[Order Management] Order statuses:", data.map((o: any) => ({ id: o.id, status: o.status, created_at: o.created_at })))
      }
      
      // Always fetch patient and staff data separately to ensure names are always displayed
      // This works whether or not the relationship is properly set up
      if (data && data.length > 0) {
        const patientIds = new Set<string>()
        const staffIds = new Set<string>()
        
        data.forEach((order: any) => {
          if (order.patient_id) patientIds.add(order.patient_id)
          if (order.nurse_id) staffIds.add(order.nurse_id)
          if (order.physician_id) staffIds.add(order.physician_id)
        })
        
        // Always fetch patient data to ensure names are displayed
        let patientMap = new Map()
        if (patientIds.size > 0) {
          console.log(`[Order Management] Fetching patient data for ${patientIds.size} patients:`, Array.from(patientIds))
          
          // If superadmin, try using API endpoint for patients (bypasses RLS)
          let patientData: any[] | null = null
          let patientError: any = null
          
          if (isSuperAdmin) {
            // For superadmin, fetch patients via API or use service client
            // Try direct query first (might work if RLS allows)
            const { data, error } = await supabase
              .from("patients")
              .select("id, first_name, last_name")
              .in("id", Array.from(patientIds))
            
            patientData = data
            patientError = error
            
            // If direct query fails, try fetching one by one via API
            if (error) {
              console.warn("[Order Management] Direct patient query failed, trying alternative method")
              // Fallback: we'll use the patient_id to show at least something
            }
          } else {
            // Regular user: use direct query
            const { data, error } = await supabase
              .from("patients")
              .select("id, first_name, last_name")
              .in("id", Array.from(patientIds))
            
            patientData = data
            patientError = error
          }
          
          if (patientError) {
            console.error("[Order Management] Error fetching patient data:", {
              message: patientError.message,
              details: patientError.details,
              hint: patientError.hint,
              code: patientError.code,
              fullError: JSON.stringify(patientError, null, 2)
            })
            // Don't show toast for superadmin - it's expected if RLS blocks
            if (!isSuperAdmin) {
              toast({
                title: "Warning",
                description: `Could not load patient names: ${patientError.message}`,
                variant: "destructive",
              })
            }
          } else {
            console.log(`[Order Management] Successfully fetched ${patientData?.length || 0} patients`)
            if (patientData && patientData.length > 0) {
              patientMap = new Map(
                patientData.map((p: any) => [p.id, { first_name: p.first_name, last_name: p.last_name }])
              )
            } else {
              console.warn("[Order Management] No patient data returned, but patientIds were provided:", Array.from(patientIds))
            }
          }
        }
        
        // Fetch staff members by their IDs
        let staffMap = new Map()
        const staffArray = Array.from(staffIds)
        if (staffArray.length > 0) {
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("id, first_name, last_name")
            .in("id", staffArray)
          
          if (staffError) {
            console.warn("Error fetching staff data:", staffError)
          } else if (staffData) {
            staffMap = new Map(
              staffData.map((s: any) => [s.id, { first_name: s.first_name, last_name: s.last_name }])
            )
          }
        }
        
        // Merge all data into orders
        // Priority: Use relationship data if available, otherwise use separately fetched data
        const ordersWithRelations = data.map((order: any) => {
          // Handle patient data - check multiple sources
          let patientData = null
          
          // 1. Check if API returned patient relationship data (from inner join)
          // The API uses !inner which returns patients as an object or array
          if (order.patients) {
            // Handle if patients is an array (shouldn't happen with !inner, but just in case)
            if (Array.isArray(order.patients) && order.patients.length > 0) {
              patientData = order.patients[0]
            }
            // Handle if patients is an object
            else if (order.patients.first_name && order.patients.last_name) {
              patientData = order.patients
            }
          }
          // 2. Check separately fetched patient map (fallback)
          if (!patientData && order.patient_id && patientMap.has(order.patient_id)) {
            patientData = patientMap.get(order.patient_id)
          }
          
          return {
            ...order,
            patients: patientData,
            // Staff: Always use fetched data since there's no foreign key relationship
            staff: staffMap.get(order.nurse_id) || null,
            physician: staffMap.get(order.physician_id) || null,
          }
        })
        
        // Debug: Log sample orders to verify patient data
        if (ordersWithRelations.length > 0) {
          console.log("[Order Management] Sample orders with patient data:")
          ordersWithRelations.slice(0, 3).forEach((order: any, idx: number) => {
            console.log(`  Order ${idx + 1}:`, {
              orderId: order.id,
              patientId: order.patient_id,
              patientData: order.patients,
              hasPatientName: !!(order.patients?.first_name && order.patients?.last_name),
              patientName: order.patients?.first_name && order.patients?.last_name 
                ? `${order.patients.first_name} ${order.patients.last_name}`
                : "MISSING"
            })
          })
        }
        
        console.log(`[Order Management] Final orders with relations: ${ordersWithRelations.length} orders`)
        console.log("[Order Management] Sample order:", ordersWithRelations[0] || "No orders")
        setOrders(ordersWithRelations)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error, null, 2)
          : String(error)
      
      console.error("Error fetching orders:", errorMessage)
      console.error("Error object:", error)
      
      toast({
        title: "Error",
        description: errorMessage || "Failed to fetch orders",
        variant: "destructive",
      })
      setOrders([])
    }
  }

  const approveOrder = async () => {
    if (!selectedOrder || !physicianSignature) {
      toast({
        title: "Signature Required",
        description: "Please sign the order to approve",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("medication_order_requests")
        .update({
          status: "approved",
          physician_signature: physicianSignature,
          physician_review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id)

      if (error) throw error

      toast({
        title: "Order Approved",
        description: `Order for ${selectedOrder.patients.first_name} ${selectedOrder.patients.last_name} has been approved`,
      })

      setShowReviewDialog(false)
      setPhysicianSignature("")
      setReviewNotes("")
      fetchOrders()
    } catch (error) {
      console.error("Error approving order:", error)
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive",
      })
    }
  }

  const denyOrder = async () => {
    if (!selectedOrder || !reviewNotes) {
      toast({
        title: "Reason Required",
        description: "Please provide reason for denial",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("medication_order_requests")
        .update({
          status: "denied",
          physician_review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id)

      if (error) throw error

      toast({
        title: "Order Denied",
        description: "Order has been denied with notes to nursing",
      })

      setShowReviewDialog(false)
      setReviewNotes("")
      fetchOrders()
    } catch (error) {
      console.error("Error denying order:", error)
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending_physician_review").length

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medication Order Management</h1>
              <p className="text-gray-600 mt-2">Review and approve medication orders from nursing staff</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                    </div>
                    <Clock className="h-10 w-10 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved Today</p>
                      <p className="text-3xl font-bold text-green-600">12</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Denied Today</p>
                      <p className="text-3xl font-bold text-red-600">2</p>
                    </div>
                    <XCircle className="h-10 w-10 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Review Time</p>
                      <p className="text-3xl font-bold text-blue-600">18m</p>
                    </div>
                    <Calendar className="h-10 w-10 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
              <TabsList>
                <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({orders.filter((o) => o.status === "approved").length})</TabsTrigger>
                <TabsTrigger value="denied">Denied ({orders.filter((o) => o.status === "denied").length})</TabsTrigger>
              </TabsList>

              <TabsContent value={filterStatus} className="space-y-4 mt-6">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                order.order_type === "increase"
                                  ? "default"
                                  : order.order_type === "decrease"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {order.order_type === "increase" && <TrendingUp className="h-3 w-3 mr-1" />}
                              {order.order_type === "decrease" && <TrendingDown className="h-3 w-3 mr-1" />}
                              {order.order_type.toUpperCase()}
                            </Badge>
                            <h3 className="font-semibold text-lg">
                              {order.patients?.first_name && order.patients?.last_name
                                ? `${order.patients.first_name} ${order.patients.last_name}`
                                : order.patient_id
                                  ? `Patient ID: ${order.patient_id.substring(0, 8)}... (Name not found)`
                                  : "Unknown Patient"}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Current Dose</p>
                              <p className="font-medium text-lg">{order.current_dose_mg}mg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Requested Dose</p>
                              <p className="font-medium text-lg text-cyan-600">{order.requested_dose_mg}mg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Submitted By</p>
                              <p className="font-medium">
                                {order.staff?.first_name} {order.staff?.last_name}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Clinical Justification:</p>
                            <p className="text-sm bg-gray-50 p-3 rounded">{order.clinical_justification}</p>
                          </div>
                        </div>

                        {order.status === "pending_physician_review" && (
                          <Button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowReviewDialog(true)
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            Review Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {orders.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <p className="text-lg font-medium mb-2">No orders found</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Filter: {filterStatus} | Status: {filterStatus !== "all" && statusMap[filterStatus] ? statusMap[filterStatus] : "all"}
                      </p>
                      
                      {/* Show authentication warning if no session */}
                      {hasSession === false && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-red-800 mb-2">⚠️ Authentication Required</p>
                          <p className="text-xs text-red-600 mb-2">
                            You are not logged in. RLS policies require authentication to view orders.
                          </p>
                          <Button 
                            onClick={() => window.location.href = "/auth/login"}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            Go to Login
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        Check browser console (F12) for detailed logs
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tip: Try clicking "All Orders" tab to see orders with any status (including "draft")
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Order Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Medication Order</DialogTitle>
            <DialogDescription>Review the order request and approve or deny with your signature</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Patient Information</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.patients?.first_name && selectedOrder.patients?.last_name
                    ? `${selectedOrder.patients.first_name} ${selectedOrder.patients.last_name}`
                    : "Loading patient name..."}
                </p>
                <p>
                  <strong>Order Type:</strong> {selectedOrder.order_type?.toUpperCase() || "N/A"}
                </p>
                <p>
                  <strong>Current Dose:</strong> {selectedOrder.current_dose_mg || 0}mg →{" "}
                  <strong className="text-cyan-600">{selectedOrder.requested_dose_mg || 0}mg</strong>
                </p>
                <p>
                  <strong>Submitted by:</strong>{" "}
                  {selectedOrder.staff?.first_name && selectedOrder.staff?.last_name
                    ? `${selectedOrder.staff.first_name} ${selectedOrder.staff.last_name}`
                    : "Loading staff name..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Clinical Justification</Label>
                <div className="bg-gray-50 p-3 rounded text-sm">{selectedOrder.clinical_justification}</div>
              </div>

              <div className="space-y-2">
                <Label>Physician Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your clinical assessment and rationale..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Physician Signature</h4>
                <div className="space-y-2">
                  <Label>Sign Order (Enter PIN or use Biometric)</Label>
                  <Input
                    type="password"
                    value={physicianSignature}
                    onChange={(e) => setPhysicianSignature(e.target.value)}
                    placeholder="Enter 4-digit PIN or use biometric"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={denyOrder}>
              <XCircle className="h-4 w-4 mr-2" />
              Deny Order
            </Button>
            <Button onClick={approveOrder} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
