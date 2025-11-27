"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Calendar, ClipboardList, TestTube, CreditCard, FileCheck, Pill } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const quickActions = [
  {
    title: "New Patient Intake",
    description: "Start biopsychosocial assessment",
    icon: UserPlus,
    color: "bg-cyan-600 text-white",
    route: "/intake",
    dialogType: "intake",
  },
  {
    title: "SOAP Note",
    description: "Document patient session",
    icon: FileText,
    color: "bg-slate-600 text-white",
    route: "/clinical-notes",
    dialogType: "soap",
  },
  {
    title: "Schedule Appointment",
    description: "Book patient visit",
    icon: Calendar,
    color: "bg-emerald-600 text-white",
    route: "/appointments",
    dialogType: "appointment",
  },
  {
    title: "ASAM Assessment",
    description: "Complete ASAM criteria",
    icon: ClipboardList,
    color: "bg-purple-600 text-white",
    route: "/assessments",
    dialogType: null,
  },
  {
    title: "Insurance Verification",
    description: "Check patient coverage",
    icon: CreditCard,
    color: "bg-blue-600 text-white",
    route: "/insurance",
    dialogType: null,
  },
  {
    title: "Prior Authorization",
    description: "Submit new auth request",
    icon: FileCheck,
    color: "bg-amber-600 text-white",
    route: "/prior-auth",
    dialogType: null,
  },
  {
    title: "PMP Check",
    description: "Search prescription history",
    icon: Pill,
    color: "bg-red-600 text-white",
    route: "/pmp",
    dialogType: "pmp",
  },
  {
    title: "UDS Collection",
    description: "Record drug screening",
    icon: TestTube,
    color: "bg-teal-600 text-white",
    route: null,
    dialogType: "uds",
  },
]

export function QuickActions() {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [patientId, setPatientId] = useState("")

  const handleAction = (action: (typeof quickActions)[0]) => {
    if (action.dialogType) {
      setOpenDialog(action.dialogType)
    } else if (action.route) {
      router.push(action.route)
    }
  }

  const handleDialogSubmit = (type: string) => {
    // Navigate to appropriate page with context
    switch (type) {
      case "intake":
        router.push("/intake")
        break
      case "soap":
        router.push(`/clinical-notes${patientId ? `?patient=${patientId}` : ""}`)
        break
      case "appointment":
        router.push(`/appointments${patientId ? `?patient=${patientId}` : ""}`)
        break
      case "pmp":
        router.push(`/pmp${patientId ? `?patient=${patientId}` : ""}`)
        break
      case "uds":
        router.push(`/patients/${patientId || "select"}?tab=labs`)
        break
    }
    setOpenDialog(null)
    setPatientId("")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50 bg-white border-gray-200"
                onClick={() => handleAction(action)}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog === "soap"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New SOAP Note</DialogTitle>
            <DialogDescription>Select or search for a patient to create a SOAP note</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient ID or Name</Label>
              <Input
                placeholder="Enter patient ID or search by name..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmit("soap")} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "appointment"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>Create a new appointment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient (optional)</Label>
              <Input
                placeholder="Enter patient ID or leave blank for walk-in..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div>
              <Label>Appointment Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dosing">Dosing Visit</SelectItem>
                  <SelectItem value="counseling">Counseling Session</SelectItem>
                  <SelectItem value="medical">Medical Appointment</SelectItem>
                  <SelectItem value="intake">New Patient Intake</SelectItem>
                  <SelectItem value="group">Group Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmit("appointment")} className="flex-1">
                Continue to Calendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "pmp"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PMP Check</DialogTitle>
            <DialogDescription>Search prescription monitoring database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                placeholder="Enter patient ID..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmit("pmp")} className="flex-1">
                Search PMP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "uds"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>UDS Collection</DialogTitle>
            <DialogDescription>Record urine drug screening</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient ID</Label>
              <Input
                placeholder="Enter patient ID..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div>
              <Label>Collection Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="for-cause">For Cause</SelectItem>
                  <SelectItem value="intake">Intake</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmit("uds")} className="flex-1">
                Record Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "intake"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Patient Intake</DialogTitle>
            <DialogDescription>Start the intake process for a new patient</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input placeholder="First name..." />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input placeholder="Last name..." />
              </div>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input placeholder="(555) 555-5555" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmit("intake")} className="flex-1">
                Start Intake
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
