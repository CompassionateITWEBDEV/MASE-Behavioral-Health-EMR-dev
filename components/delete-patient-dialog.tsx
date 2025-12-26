"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useDeletePatient } from "@/hooks/use-patient-mutations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

interface DeletePatientDialogProps {
  children: React.ReactNode
  patientId: string
  patientName: string
}

export function DeletePatientDialog({ children, patientId, patientName }: DeletePatientDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const deletePatient = useDeletePatient()

  const handleDelete = async () => {
    deletePatient.mutate(patientId, {
      onSuccess: () => {
        setOpen(false)
        router.refresh()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Patient
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{patientName}</strong>? This action cannot be undone and will
            permanently remove all patient data, including appointments, assessments, and progress notes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={deletePatient.isPending}>
            {deletePatient.isPending ? "Deleting..." : "Delete Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
