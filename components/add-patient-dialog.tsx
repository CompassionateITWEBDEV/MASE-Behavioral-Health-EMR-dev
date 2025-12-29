"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddPatientDialogProps {
  children: React.ReactNode
  providerId: string
  onSuccess?: () => void // Added optional onSuccess callback
}

export function AddPatientDialog({ children, providerId, onSuccess }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insuranceId: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      insuranceProvider: "",
      insuranceId: "",
    })
  }

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return "First name is required"
    }
    if (!formData.lastName.trim()) {
      return "Last name is required"
    }
    if (!formData.dateOfBirth) {
      return "Date of birth is required"
    }
    // Validate date of birth is in the past
    const birthDate = new Date(formData.dateOfBirth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (birthDate >= today) {
      return "Date of birth must be in the past"
    }
    if (!formData.phone.trim()) {
      return "Phone number is required"
    }
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Invalid email format"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsLoading(true)

    try {
      const requestBody: any = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone.trim(),
        gender: formData.gender && formData.gender.trim() ? formData.gender : null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        emergency_contact_name: formData.emergencyContactName?.trim() || null,
        emergency_contact_phone: formData.emergencyContactPhone?.trim() || null,
        insurance_provider: formData.insuranceProvider || null,
        insurance_id: formData.insuranceId?.trim() || null,
        created_by: providerId,
      }

      console.log("Submitting patient data:", requestBody)

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || `Failed to add patient (${response.status})`
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          data: data,
        })
        throw new Error(errorMessage)
      }

      toast.success("Patient added successfully")
      resetForm()
      setOpen(false)

      if (onSuccess) {
        onSuccess()
      }

      router.refresh()
    } catch (error) {
      console.error("Error adding patient:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add patient")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>{"Enter the patient's information to create a new record."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address, city, state, zip"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                placeholder="Contact name"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Select value={formData.insuranceProvider} onValueChange={(value) => handleInputChange("insuranceProvider", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                  <SelectItem value="Medicare">Medicare</SelectItem>
                  <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="Aetna">Aetna</SelectItem>
                  <SelectItem value="Cigna">Cigna</SelectItem>
                  <SelectItem value="United Healthcare">United Healthcare</SelectItem>
                  <SelectItem value="Humana">Humana</SelectItem>
                  <SelectItem value="Private Pay">Private Pay</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceId">Insurance ID</Label>
              <Input
                id="insuranceId"
                placeholder="Insurance member ID"
                value={formData.insuranceId}
                onChange={(e) => handleInputChange("insuranceId", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
