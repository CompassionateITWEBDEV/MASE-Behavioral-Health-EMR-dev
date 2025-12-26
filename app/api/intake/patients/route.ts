import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { dbLogger } from "@/lib/utils/db-logger"

export async function GET(request: Request) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    // Log connection initiation
    const connectionStartTime = Date.now()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "unknown"
    connectionInfo = dbLogger.logConnectionStart("server", supabaseUrl, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/intake/patients",
      method: "GET",
    })

    const supabase = await createClient()
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "READ",
      table: "patients",
    })
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get("stage")
    const status = searchParams.get("status")

    // Log data transformation (before)
    dbLogger.logDataTransformation("before", "READ", {
      stage,
      status,
      url: request.url,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/intake/patients",
    })

    const filters: Record<string, any> = {}
    let query = supabase
      .from("patients")
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        phone,
        email,
        gender,
        address,
        created_at,
        patient_insurance(
          id,
          payer_id,
          policy_number,
          priority_order,
          is_active
        )
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
      filters.status = status
    }

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "SELECT",
        table: "patients",
        filters,
        queryString: `SELECT * FROM patients WHERE status = '${status || "any"}' ORDER BY created_at DESC`,
      },
      connectionInfo.connectionId,
      {
        operation: "READ",
        table: "patients",
        endpoint: "/api/intake/patients",
      }
    )

    // Execute query
    const queryStartTime = Date.now()
    const { data: patients, error } = await query
    const queryTime = Date.now() - queryStartTime

    if (error) {
      dbLogger.logQueryError(
        requestId!,
        {
          operation: "SELECT",
          table: "patients",
          filters,
        },
        connectionInfo.connectionId,
        error,
        { queryTime },
        {
          operation: "READ",
          table: "patients",
          endpoint: "/api/intake/patients",
        }
      )

      dbLogger.logOperationSummary("READ", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "READ",
        table: "patients",
        endpoint: "/api/intake/patients",
        error: error.message,
        fallbackToMock: true,
      })

      // Return mock data if database query fails
      return NextResponse.json(getMockIntakePatients())
    }

    // Log query success
    dbLogger.logQuerySuccess(
      requestId!,
      {
        operation: "SELECT",
        table: "patients",
        filters,
      },
      connectionInfo.connectionId,
      {
        queryTime,
        rowsReturned: patients?.length || 0,
      },
      patients,
      {
        operation: "READ",
        table: "patients",
        endpoint: "/api/intake/patients",
      }
    )

    // Transform to intake queue format
    const transformStartTime = Date.now()
    const intakePatients = (patients || []).map((patient, index) => ({
      id: `INT-2025-${String(patient.id).padStart(3, "0")}`,
      patientId: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      age: calculateAge(patient.date_of_birth),
      phone: patient.phone || "(555) 000-0000",
      email: patient.email,
      gender: patient.gender,
      address: patient.address,
      entryTime: new Date(patient.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      currentStage: getRandomStage(index),
      eligibilityStatus: patient.patient_insurance?.some((ins: any) => ins.is_active) ? "approved" : "pending",
      udsRequired: Math.random() > 0.5,
      pregnancyTestRequired: Math.random() > 0.7,
      priority: Math.random() > 0.8 ? "urgent" : "normal",
      estimatedWait: `${Math.floor(Math.random() * 45) + 5} min`,
      alerts: getRandomAlerts(),
      dob: patient.date_of_birth,
    }))
    const transformTime = Date.now() - transformStartTime

    // Log data transformation (after)
    dbLogger.logDataTransformation("after", "READ", {
      originalCount: patients?.length || 0,
      transformedCount: intakePatients.length,
      transformTime: `${transformTime}ms`,
      sample: intakePatients.slice(0, 2),
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/intake/patients",
    })

    // Log operation summary
    dbLogger.logOperationSummary("READ", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsReturned: intakePatients.length,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/intake/patients",
      filters,
    })

    return NextResponse.json(intakePatients)
  } catch (error: any) {
    const totalTime = Date.now() - operationStartTime

    if (connectionInfo) {
      dbLogger.logConnectionError(
        connectionInfo,
        error,
        totalTime,
        {
          operation: "READ",
          table: "patients",
          endpoint: "/api/intake/patients",
        }
      )
    }

    dbLogger.logOperationSummary("READ", "patients", false, {
      totalTime,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/intake/patients",
      error: error?.message || "Unknown error",
      fallbackToMock: true,
    })

    return NextResponse.json(getMockIntakePatients())
  }
}

export async function POST(request: Request) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    // Log connection initiation
    const connectionStartTime = Date.now()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "unknown"
    connectionInfo = dbLogger.logConnectionStart("server", supabaseUrl, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/intake/patients",
      method: "POST",
    })

    const supabase = await createClient()
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "CREATE",
      table: "patients",
    })

    const body = await request.json()

    // Log data transformation (before)
    dbLogger.logDataTransformation("before", "CREATE", {
      receivedFields: Object.keys(body),
      firstName: body.firstName,
      lastName: body.lastName,
      hasEmail: !!body.email,
      hasPhone: !!body.phone,
      status: "intake",
    }, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/intake/patients",
    })

    // Prepare insert data
    const insertData = {
      first_name: body.firstName,
      last_name: body.lastName,
      date_of_birth: body.dateOfBirth,
      phone: body.phone,
      email: body.email,
      gender: body.gender,
      address: body.address,
      status: "intake",
    }

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "INSERT",
        table: "patients",
        data: insertData,
        queryString: `INSERT INTO patients (first_name, last_name, date_of_birth, phone, email, gender, address, status) VALUES (...)`,
      },
      connectionInfo.connectionId,
      {
        operation: "CREATE",
        table: "patients",
        endpoint: "/api/intake/patients",
      }
    )

    // Execute insert
    const queryStartTime = Date.now()
    const { data, error } = await supabase
      .from("patients")
      .insert(insertData)
      .select()
      .single()
    const queryTime = Date.now() - queryStartTime

    if (error) {
      dbLogger.logQueryError(
        requestId!,
        {
          operation: "INSERT",
          table: "patients",
          data: insertData,
        },
        connectionInfo.connectionId,
        error,
        { queryTime },
        {
          operation: "CREATE",
          table: "patients",
          endpoint: "/api/intake/patients",
        }
      )

      dbLogger.logOperationSummary("CREATE", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "CREATE",
        table: "patients",
        endpoint: "/api/intake/patients",
        error: error.message,
        attemptedData: {
          firstName: insertData.first_name,
          lastName: insertData.last_name,
        },
      })

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log query success
    dbLogger.logQuerySuccess(
      requestId!,
      {
        operation: "INSERT",
        table: "patients",
        data: insertData,
      },
      connectionInfo.connectionId,
      {
        queryTime,
        rowsAffected: 1,
        rowsReturned: 1,
      },
      data,
      {
        operation: "CREATE",
        table: "patients",
        endpoint: "/api/intake/patients",
      }
    )

    // Log data transformation (after)
    dbLogger.logDataTransformation("after", "CREATE", {
      patientId: data?.id,
      firstName: data?.first_name,
      lastName: data?.last_name,
      status: data?.status,
      createdAt: data?.created_at,
    }, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/intake/patients",
    })

    // Log operation summary
    dbLogger.logOperationSummary("CREATE", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsAffected: 1,
      rowsReturned: 1,
    }, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/intake/patients",
      patientId: data?.id,
      patientName: `${data?.first_name} ${data?.last_name}`,
      status: "intake",
    })

    return NextResponse.json(data)
  } catch (error: any) {
    const totalTime = Date.now() - operationStartTime

    if (connectionInfo) {
      dbLogger.logConnectionError(
        connectionInfo,
        error,
        totalTime,
        {
          operation: "CREATE",
          table: "patients",
          endpoint: "/api/intake/patients",
        }
      )
    }

    dbLogger.logOperationSummary("CREATE", "patients", false, {
      totalTime,
    }, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/intake/patients",
      error: error?.message || "Unknown error",
    })

    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}

function calculateAge(dob: string): number {
  if (!dob) return 0
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function getRandomStage(index: number): string {
  const stages = [
    "data-entry",
    "eligibility",
    "tech-onboarding",
    "consent-forms",
    "collector-queue",
    "nurse-queue",
    "counselor-queue",
    "doctor-queue",
    "dosing",
  ]
  return stages[index % stages.length]
}

function getRandomAlerts(): string[] {
  const allAlerts = ["Withdrawal symptoms", "Pregnant", "High risk", "New patient"]
  const alerts: string[] = []
  if (Math.random() > 0.7) {
    alerts.push(allAlerts[Math.floor(Math.random() * allAlerts.length)])
  }
  return alerts
}

function getMockIntakePatients() {
  return [
    {
      id: "INT-2025-001",
      patientId: 1,
      name: "Maria Santos",
      age: 29,
      phone: "(555) 123-4567",
      email: "maria.santos@example.com",
      gender: "female",
      address: "123 Main St, Anytown",
      entryTime: "08:30 AM",
      currentStage: "data-entry",
      eligibilityStatus: "pending",
      udsRequired: true,
      pregnancyTestRequired: true,
      priority: "normal",
      estimatedWait: "15 min",
      alerts: [],
    },
    {
      id: "INT-2025-002",
      patientId: 2,
      name: "James Rodriguez",
      age: 34,
      phone: "(555) 234-5678",
      email: "james.rodriguez@example.com",
      gender: "male",
      address: "456 Elm St, Othertown",
      entryTime: "09:15 AM",
      currentStage: "collector-queue",
      eligibilityStatus: "approved",
      udsRequired: true,
      pregnancyTestRequired: false,
      priority: "urgent",
      estimatedWait: "5 min",
      alerts: ["Withdrawal symptoms"],
    },
    {
      id: "INT-2025-003",
      patientId: 3,
      name: "Sarah Johnson",
      age: 26,
      phone: "(555) 345-6789",
      email: "sarah.johnson@example.com",
      gender: "female",
      address: "789 Oak St, Somewhere",
      entryTime: "10:00 AM",
      currentStage: "nurse-queue",
      eligibilityStatus: "approved",
      udsRequired: false,
      pregnancyTestRequired: false,
      priority: "normal",
      estimatedWait: "20 min",
      alerts: [],
    },
  ]
}
