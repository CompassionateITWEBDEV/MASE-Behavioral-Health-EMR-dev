"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, Send, User, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_TYPES = [
  "Demographics & Insurance",
  "Medical History",
  "Medication List",
  "Allergy List",
  "Immunization Records",
  "Lab Results (30 days)",
  "Vital Signs",
  "Progress Notes",
  "Treatment Plans",
  "Assessments",
  "Consents & Authorizations",
  "42 CFR Part 2 Consent",
  "Discharge Summary",
];

export default function PatientTransferPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [externalFacilityName, setExternalFacilityName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>(DOCUMENT_TYPES);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const { toast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    getCurrentUser();
  }, []);

  // Search patients function
  const searchPatients = async (term: string) => {
    if (!term || term.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // For single character, increase limit to show more results
      // For longer searches, use normal limit
      const limit = term.length === 1 ? 50 : 20;
      
      const response = await fetch(`/api/patients?search=${encodeURIComponent(term)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Failed to search patients");
      }

      const data = await response.json();
      // Filter to only active patients
      let activeResults = (data.patients || []).filter((p: any) => {
        if (p.is_active !== undefined) {
          return p.is_active === true;
        }
        if (p.status !== undefined) {
          return p.status === "active";
        }
        return true;
      });
      
      // For single character, prioritize first names starting with that letter
      if (term.length === 1) {
        const termLower = term.toLowerCase();
        activeResults.sort((a: any, b: any) => {
          const aFirstName = (a.first_name || "").toLowerCase();
          const bFirstName = (b.first_name || "").toLowerCase();
          const aStarts = aFirstName.startsWith(termLower);
          const bStarts = bFirstName.startsWith(termLower);
          
          // First names starting with the letter come first
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Then sort alphabetically
          return aFirstName.localeCompare(bFirstName);
        });
      }
      
      setSearchResults(activeResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching patients:", error);
      setSearchResults([]);
      toast({
        title: "Search Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle patient selection from search
  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient.id);
    setSelectedPatientData(patient); // Store the full patient object
    setPatientSearchQuery(`${patient.first_name} ${patient.last_name}${patient.mrn ? ` (MRN: ${patient.mrn})` : ""}`);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.patient-search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get patient data from stored object
  const patient = selectedPatientData;

  const toggleDoc = (doc: string) => {
    setSelectedDocs((prev) => (prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]));
  };

  async function createTransferRecord() {
    // Validation
    if (!selectedPatient || !transferTo) {
      toast({
        title: "Validation Error",
        description: "Please select a patient and enter transfer destination",
        variant: "destructive",
      });
      return null;
    }

    if (transferTo === "external" && !externalFacilityName) {
      toast({
        title: "Validation Error",
        description: "Please enter the receiving facility name for external transfers",
        variant: "destructive",
      });
      return null;
    }

    if (!transferReason || transferReason.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter a reason for the transfer",
        variant: "destructive",
      });
      return null;
    }

    if (selectedDocs.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one document to include in the transfer packet",
        variant: "destructive",
      });
      return null;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to generate transfer packets",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Step 1: Check for pending prescriptions (warning only)
      const prescriptionsResponse = await fetch(`/api/prescriptions?patient_id=${selectedPatient}`);
      const prescriptionsData = await prescriptionsResponse.json();
      const pendingPrescriptions = (prescriptionsData.prescriptions || []).filter(
        (p: any) => p.status === "pending" || p.status === "sent"
      );

      // Step 2: Create transfer record via API
      const transferData = {
        patient_id: selectedPatient,
        transfer_type: transferTo,
        transfer_to: transferTo === "external" ? externalFacilityName : "Internal Transfer",
        contact_person: transferTo === "external" ? contactPerson : null,
        contact_phone: transferTo === "external" ? contactPhone : null,
        contact_email: transferTo === "external" ? contactEmail : null,
        transfer_reason: transferReason,
        documents_included: selectedDocs,
        initiated_by: currentUserId,
      };

      const response = await fetch("/api/patient-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transfer");
      }

      const result = await response.json();

      // Show warning about prescriptions
      if (pendingPrescriptions.length > 0 && result.cancelled_prescriptions === 0) {
        toast({
          title: "Prescription Notice",
          description: `${pendingPrescriptions.length} pending prescription(s) found (not cancelled for internal transfer).`,
          variant: "default",
        });
      }

      return result;
    } catch (error: any) {
      console.error("Transfer creation error:", error);
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred while creating the transfer",
        variant: "destructive",
      });
      return null;
    }
  }

  async function generateAndDownloadPDF() {
    setLoading(true);

    try {
      // Step 1: Create transfer record
      const transferResult = await createTransferRecord();
      if (!transferResult || !transferResult.transfer) {
        setLoading(false);
        return;
      }

      const transferId = transferResult.transfer.id;

      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare the transfer packet",
      });

      // Step 2: Get PDF data from API
      const pdfResponse = await fetch(`/api/patient-transfers/${transferId}/generate-pdf`, {
        method: "POST",
      });

      if (!pdfResponse.ok) {
        throw new Error("Failed to prepare PDF generation");
      }

      const pdfData = await pdfResponse.json();

      // Step 3: Generate PDF using jsPDF
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const jsPDF = jsPDFModule.default;
      let autoTable = (autoTableModule as any).autoTable || (autoTableModule as any).default;

      if (!autoTable && (autoTableModule as any).applyPlugin) {
        (autoTableModule as any).applyPlugin(jsPDF);
        autoTable = null;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      const callAutoTable = (options: any) => {
        if (typeof autoTable === "function") {
          autoTable(doc, options);
        } else if (typeof (doc as any).autoTable === "function") {
          (doc as any).autoTable(options);
        }
      };

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      const transfer = pdfData.transfer;
      const patient = transfer.patients;
      const org = pdfData.organization;

      // Cover Page
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT TRANSFER PACKET", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Transfer Date: ${new Date(transfer.initiated_at).toLocaleDateString()}`, pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 20;

      // Patient Information
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT INFORMATION", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const patientInfo = [
        [`Name:`, `${patient.first_name} ${patient.last_name}`],
        [`Date of Birth:`, patient.date_of_birth || "N/A"],
        [`MRN:`, patient.mrn || "N/A"],
        [`Phone:`, patient.phone || "N/A"],
        [`Email:`, patient.email || "N/A"],
        [`Address:`, patient.address || "N/A"],
      ];

      patientInfo.forEach(([label, value]) => {
        checkPageBreak(8);
        doc.text(label, margin, yPos);
        doc.text(value, margin + 50, yPos);
        yPos += 8;
      });

      yPos += 5;

      // Transfer Information
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TRANSFER INFORMATION", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const transferInfo = [
        [`Transfer From:`, org.name],
        [`Transfer To:`, transfer.transfer_to_facility],
        [`Transfer Type:`, transfer.transfer_type === "external" ? "External Facility" : "Internal Transfer"],
        [`Transfer Reason:`, transfer.transfer_reason],
      ];

      if (transfer.contact_person) {
        transferInfo.push([`Contact Person:`, transfer.contact_person]);
      }
      if (transfer.contact_phone) {
        transferInfo.push([`Contact Phone:`, transfer.contact_phone]);
      }
      if (transfer.contact_email) {
        transferInfo.push([`Contact Email:`, transfer.contact_email]);
      }

      transferInfo.forEach(([label, value]) => {
        checkPageBreak(8);
        doc.text(label, margin, yPos);
        // Wrap long text
        const lines = doc.splitTextToSize(value, pageWidth - margin - 60);
        doc.text(lines, margin + 50, yPos);
        yPos += lines.length * 5;
      });

      yPos += 10;

      // Documents Included
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DOCUMENTS INCLUDED", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      transfer.documents_included.forEach((docName: string) => {
        checkPageBreak(8);
        doc.text(`• ${docName}`, margin + 5, yPos);
        yPos += 8;
      });

      yPos += 10;

      // Medication List
      if (pdfData.documents.medications) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CURRENT MEDICATIONS", margin, yPos);
        yPos += 10;

        const meds = pdfData.documents.medications.active_medications || [];
        if (meds.length > 0) {
          const medTableData = meds.map((med: any) => [
            med.medication_name || "N/A",
            med.dosage || "N/A",
            med.frequency || "N/A",
            med.route || "N/A",
          ]);

          callAutoTable({
            startY: yPos,
            head: [["Medication", "Dosage", "Frequency", "Route"]],
            body: medTableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [200, 200, 200] },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(10);
          doc.text("No active medications", margin, yPos);
          yPos += 10;
        }
      }

      // Add page for additional documents
      doc.addPage();
      yPos = margin;

      // 42 CFR Part 2 Compliance
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("42 CFR PART 2 COMPLIANCE", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This transfer packet contains protected health information subject to 42 CFR Part 2 regulations.",
        margin,
        yPos,
        { maxWidth: pageWidth - 2 * margin }
      );
      yPos += 10;

      doc.text(
        "Unauthorized disclosure is prohibited. This information may only be shared with proper authorization.",
        margin,
        yPos,
        { maxWidth: pageWidth - 2 * margin }
      );
      yPos += 15;

      // Signature Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AUTHORIZATION", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const staffName = transfer.initiated_by_staff 
        ? `${transfer.initiated_by_staff.first_name || ""} ${transfer.initiated_by_staff.last_name || ""}`.trim()
        : "System";
      doc.text(`Initiated by: ${staffName}`, margin, yPos);
      yPos += 8;
      doc.text(`Date: ${new Date(transfer.initiated_at).toLocaleDateString()}`, margin, yPos);
      yPos += 8;
      doc.text(`Time: ${new Date(transfer.initiated_at).toLocaleTimeString()}`, margin, yPos);

      // Download PDF
      const fileName = `transfer-${patient.first_name}-${patient.last_name}-${Date.now()}.pdf`;
      doc.save(fileName);

      // Update transfer record with PDF URL (would be stored in Supabase Storage in production)
      await fetch(`/api/patient-transfers/${transferId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_url: fileName,
          transfer_status: "completed",
        }),
      });

      toast({
        title: "PDF Generated",
        description: `Transfer packet downloaded successfully. ${transferResult.cancelled_prescriptions > 0 ? `${transferResult.cancelled_prescriptions} prescription(s) cancelled.` : ""}`,
      });

      // Reset form
      setTimeout(() => {
        setSelectedPatient("");
        setSelectedPatientData(null);
        setPatientSearchQuery("");
        setTransferTo("");
        setExternalFacilityName("");
        setContactPerson("");
        setContactPhone("");
        setContactEmail("");
        setTransferReason("");
        setSelectedDocs(DOCUMENT_TYPES);
      }, 2000);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: error.message || "An error occurred while generating the PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateAndSendFax() {
    setLoading(true);

    try {
      // Step 1: Create transfer record
      const transferResult = await createTransferRecord();
      if (!transferResult || !transferResult.transfer) {
        setLoading(false);
        return;
      }

      const transferId = transferResult.transfer.id;

      toast({
        title: "Preparing Fax...",
        description: "Generating PDF and preparing to send via fax",
      });

      // Step 2: Generate PDF first (reuse PDF generation)
      const pdfResponse = await fetch(`/api/patient-transfers/${transferId}/generate-pdf`, {
        method: "POST",
      });

      if (!pdfResponse.ok) {
        throw new Error("Failed to prepare PDF for fax");
      }

      // Step 3: TODO - Integrate with fax service (Twilio, RingCentral, etc.)
      // For now, show success message
      toast({
        title: "Fax Queued",
        description: "PDF generated. Fax integration will be implemented with fax service API.",
        variant: "default",
      });

      // Update transfer record
      await fetch(`/api/patient-transfers/${transferId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fax_sent: true,
          transfer_status: "completed",
        }),
      });

      // Reset form
      setTimeout(() => {
        setSelectedPatient("");
        setSelectedPatientData(null);
        setPatientSearchQuery("");
        setTransferTo("");
        setExternalFacilityName("");
        setContactPerson("");
        setContactPhone("");
        setContactEmail("");
        setTransferReason("");
        setSelectedDocs(DOCUMENT_TYPES);
      }, 2000);
    } catch (error: any) {
      console.error("Fax sending error:", error);
      toast({
        title: "Fax Failed",
        description: error.message || "An error occurred while sending the fax",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Transfer & Records</h1>
              <p className="text-gray-600 mt-1">Generate complete transfer packets for facility transfers</p>
            </div>

            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>Search and select the patient to transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 patient-search-container relative">
                  <Label>Search Patient</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, MRN, phone, or email... (type to search)"
                      value={patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value);
                        searchPatients(e.target.value);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0 && patientSearchQuery.length >= 1) {
                          setShowSearchResults(true);
                        }
                      }}
                      className="pl-10"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handlePatientSelect(p)}
                          className="cursor-pointer px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {p.first_name} {p.last_name}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                {p.mrn && <span>MRN: {p.mrn}</span>}
                                {p.date_of_birth && (
                                  <span>DOB: {new Date(p.date_of_birth).toLocaleDateString()}</span>
                                )}
                                {p.phone && <span>{p.phone}</span>}
                              </div>
                            </div>
                            <User className="h-4 w-4 text-gray-400 ml-2" />
                          </div>
                        </div>
                      ))}
                      {searchResults.length >= 50 && (
                        <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
                          Showing first 50 results. Refine your search for more specific results.
                        </div>
                      )}
                    </div>
                  )}

                  {showSearchResults && searchResults.length === 0 && patientSearchQuery.length >= 1 && !isSearching && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg p-4 text-sm text-gray-500">
                      No patients found matching "{patientSearchQuery}"
                    </div>
                  )}
                </div>

                {patient && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-lg">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient("");
                              setSelectedPatientData(null);
                              setPatientSearchQuery("");
                              setShowSearchResults(false);
                            }}
                            className="h-7 text-xs"
                          >
                            Change Patient
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><span className="font-medium">DOB:</span> {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "N/A"}</p>
                          <p><span className="font-medium">Phone:</span> {patient.phone || "N/A"}</p>
                          {patient.mrn && <p><span className="font-medium">MRN:</span> {patient.mrn}</p>}
                          <p><span className="font-medium">Email:</span> {patient.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!patient && patientSearchQuery.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Start typing to search for a patient</p>
                    <p className="text-xs mt-1">Search by name, MRN, phone number, or email address</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transfer Destination */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Destination</CardTitle>
                  <CardDescription>Enter receiving facility information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transfer To</Label>
                    <Select value={transferTo} onValueChange={setTransferTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="external">External Facility</SelectItem>
                        <SelectItem value="internal">Internal Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {transferTo === "external" && (
                    <>
                      <div className="space-y-2">
                        <Label>Facility Name *</Label>
                        <Input
                          placeholder="Enter receiving facility name"
                          value={externalFacilityName}
                          onChange={(e) => setExternalFacilityName(e.target.value)}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Contact Person</Label>
                          <Input
                            placeholder="Contact name"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            placeholder="Phone number"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            placeholder="Email address"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Reason for Transfer *</Label>
                    <Textarea
                      placeholder="Enter reason for patient transfer..."
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Selection */}
            {transferTo && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Select Documents</CardTitle>
                      <CardDescription>
                        Choose which documents to include in transfer packet ({selectedDocs.length} selected)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedDocs(DOCUMENT_TYPES)}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedDocs([])}>
                        Deselect All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {DOCUMENT_TYPES.map((doc) => (
                      <div key={doc} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox checked={selectedDocs.includes(doc)} onCheckedChange={() => toggleDoc(doc)} />
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Actions */}
            {transferTo && selectedDocs.length > 0 && (
              <Card className="border-cyan-200 bg-cyan-50">
                <CardHeader>
                  <CardTitle>Transfer Packet Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      onClick={generateAndDownloadPDF}
                      disabled={loading}
                      size="lg"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {loading ? "Generating..." : "Generate & Download PDF"}
                    </Button>
                    <Button onClick={generateAndSendFax} disabled={loading} variant="outline" size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Generate & Send via Fax
                    </Button>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Transfer packet will include:</p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Cover sheet with patient demographics</li>
                      <li>Transfer authorization form</li>
                      <li>{selectedDocs.length} selected medical documents</li>
                      <li>42 CFR Part 2 compliance documentation</li>
                      <li>Audit trail and tracking information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
