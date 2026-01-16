import { createServiceClient } from "@/lib/supabase/service-role"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { id } = await params

    // Get transfer record with patient data
    const { data: transfer, error: transferError } = await supabase
      .from("patient_transfers")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email,
          gender,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          insurance_provider,
          insurance_id,
          mrn,
          client_number
        ),
        staff!patient_transfers_initiated_by_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq("id", id)
      .single()

    if (transferError || !transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
    }

    // Get organization name
    const { data: organization } = await supabase
      .from("organizations")
      .select("name, address, phone, fax")
      .limit(1)
      .single()

    // Fetch document data
    const documentsResponse = await fetch(
      `${request.nextUrl.origin}/api/patient-transfers/${id}/documents?documents=${transfer.documents_included.join(",")}`
    )
    const documentsData = await documentsResponse.json()

    // Update transfer status to in_progress
    await supabase
      .from("patient_transfers")
      .update({ transfer_status: "in_progress" })
      .eq("id", id)

    // Return data for PDF generation (client-side will generate PDF)
    return NextResponse.json({
      success: true,
      transfer: transfer,
      documents: documentsData.documents,
      organization: organization || {
        name: "Current Facility",
        address: null,
        phone: null,
        fax: null,
      },
    })
  } catch (error) {
    console.error("Error preparing PDF generation:", error)
    return NextResponse.json(
      { error: "Failed to prepare PDF generation" },
      { status: 500 }
    )
  }
}
