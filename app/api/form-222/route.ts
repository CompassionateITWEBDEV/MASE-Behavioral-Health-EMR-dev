import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierName, supplierAddress, supplierDEA, signedByUserId, lineItems } = body

    // Validate authorized signer (registrant or POA)
    const isAuthorizedSigner = await validateAuthorizedSigner(signedByUserId)
    if (!isAuthorizedSigner) {
      return NextResponse.json(
        { error: "Only DEA registrant or POA-authorized personnel may sign Form 222" },
        { status: 403 },
      )
    }

    // Validate single supplier rule
    if (!supplierName || !supplierDEA) {
      return NextResponse.json({ error: "Single supplier name and DEA number required per form" }, { status: 400 })
    }

    // Validate one item per line
    const duplicateItems = findDuplicateItems(lineItems)
    if (duplicateItems.length > 0) {
      return NextResponse.json(
        { error: "Only one item per numbered line allowed - same substance, form, strength" },
        { status: 400 },
      )
    }

    // Generate form number and set 60-day expiry
    const formNumber = generateFormNumber()
    const executionDate = new Date()
    const expiresAt = new Date(executionDate.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days

    // Create form in database
    const form222 = await createForm222({
      formNumber,
      supplierName,
      supplierAddress,
      supplierDEA,
      signedByUserId,
      executionDate,
      expiresAt,
      lineItems,
    })

    // Generate purchaser copy
    await generatePurchaserCopy(form222.id)

    return NextResponse.json({
      success: true,
      formNumber,
      expiresAt: expiresAt.toISOString(),
      message: "Form 222 executed successfully. Purchaser copy generated.",
    })
  } catch (error) {
    console.error("[v0] Form 222 creation error:", error)
    return NextResponse.json({ error: "Failed to execute Form 222" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const expiringSoon = searchParams.get("expiring_soon") === "true"

    let query = "SELECT * FROM dea_form_222 WHERE 1=1"
    const params: any[] = []

    if (status) {
      query += " AND status = $" + (params.length + 1)
      params.push(status)
    }

    if (expiringSoon) {
      query += " AND expires_at <= $" + (params.length + 1)
      params.push(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)) // 10 days from now
    }

    query += " ORDER BY execution_date DESC"

    // Execute query and return forms
    const forms = await executeQuery(query, params)

    return NextResponse.json({ forms })
  } catch (error) {
    console.error("[v0] Form 222 fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch Form 222 records" }, { status: 500 })
  }
}

// Helper functions
async function validateAuthorizedSigner(userId: number): Promise<boolean> {
  // Check if user is registrant or has active POA
  const query = `
    SELECT 1 FROM dea_poa 
    WHERE authorized_user_id = $1 
    AND status = 'active' 
    AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
  `
  const result = await executeQuery(query, [userId])
  return result.length > 0
}

function findDuplicateItems(lineItems: any[]): any[] {
  const seen = new Set()
  const duplicates = []

  for (const item of lineItems) {
    const key = `${item.medication}-${item.strength}-${item.form}`
    if (seen.has(key)) {
      duplicates.push(item)
    }
    seen.add(key)
  }

  return duplicates
}

function generateFormNumber(): string {
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `F222-${year}-${sequence}`
}

async function createForm222(formData: any) {
  // Database creation logic would go here
  console.log("[v0] Creating Form 222:", formData)
  return { id: 1, ...formData }
}

async function generatePurchaserCopy(formId: number) {
  // Generate PDF copy for purchaser records
  console.log("[v0] Generating purchaser copy for form:", formId)
}

async function executeQuery(query: string, params: any[]) {
  // Database query execution would go here
  console.log("[v0] Executing query:", query, params)
  return []
}
