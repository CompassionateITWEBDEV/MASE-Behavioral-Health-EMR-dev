import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { dbLogger } from "@/lib/utils/db-logger"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    // Log connection initiation
    const connectionStartTime = Date.now()
    connectionInfo = dbLogger.logConnectionStart("service-role", supabaseUrl, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/patients",
      method: "GET",
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "READ",
      table: "patients",
    })

    // Parse request parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")
    const page = searchParams.get("page")
    const pageSize = searchParams.get("pageSize")
    const sortBy = searchParams.get("sortBy") || "last_name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Calculate pagination
    const pageNum = page ? Number.parseInt(page) : 1
    const pageSizeNum = pageSize ? Number.parseInt(pageSize) : (limit ? Number.parseInt(limit) : 200)
    const from = (pageNum - 1) * pageSizeNum
    const to = from + pageSizeNum - 1

    // Log data transformation (before)
    dbLogger.logDataTransformation("before", "READ", {
      search,
      status,
      limit,
      page: pageNum,
      pageSize: pageSizeNum,
      sortBy,
      sortOrder,
      url: request.url,
    }, {
      operation: "READ",
      table: "patients",
    })

    // Build query with count for pagination
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
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_id,
        created_at,
        appointments(
          id,
          appointment_date,
          status,
          provider_id
        ),
        assessments(
          id,
          assessment_type,
          risk_assessment,
          created_at
        ),
        medications(
          id,
          medication_name,
          dosage,
          status
        )
      `, { count: "exact" })
      .order(sortBy, { ascending: sortOrder === "asc" })

    const filters: Record<string, any> = {}
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`)
      filters.search = search
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
      filters.status = status
    }

    // Apply pagination
    if (page && pageSize) {
      query = query.range(from, to)
      filters.page = pageNum
      filters.pageSize = pageSizeNum
    } else if (limit) {
      query = query.limit(Number.parseInt(limit))
      filters.limit = limit
    } else {
      query = query.limit(200)
      filters.limit = "200 (default)"
    }

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "SELECT",
        table: "patients",
        filters,
        queryString: `SELECT * FROM patients WHERE ${JSON.stringify(filters)} ORDER BY last_name ASC`,
      },
      connectionInfo.connectionId,
      {
        operation: "READ",
        table: "patients",
        endpoint: "/api/patients",
      }
    )

    // Execute query
    const queryStartTime = Date.now()
    const { data: patients, error, count } = await query
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
          endpoint: "/api/patients",
        }
      )

      dbLogger.logOperationSummary("READ", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "READ",
        table: "patients",
        endpoint: "/api/patients",
        error: error.message,
      })

      return NextResponse.json({ patients: [], error: error.message }, { status: 500 })
    }

    // Calculate pagination metadata
    const total = count || 0
    const totalPages = page && pageSize ? Math.ceil(total / pageSizeNum) : 1

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
        endpoint: "/api/patients",
      }
    )

    // Log data transformation (after)
    dbLogger.logDataTransformation("after", "READ", {
      count: patients?.length || 0,
      total,
      page: pageNum,
      totalPages,
      sample: patients?.slice(0, 2),
    }, {
      operation: "READ",
      table: "patients",
    })

    // Log operation summary
    dbLogger.logOperationSummary("READ", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsReturned: patients?.length || 0,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/patients",
      filters,
      pagination: page && pageSize ? { page: pageNum, pageSize: pageSizeNum, total, totalPages } : undefined,
    })

    // Return response with pagination metadata if pagination is used
    if (page && pageSize) {
      return NextResponse.json({
        patients: patients || [],
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      })
    }

    return NextResponse.json({ patients: patients || [] })
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
          endpoint: "/api/patients",
        }
      )
    }

    dbLogger.logOperationSummary("READ", "patients", false, {
      totalTime,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: "/api/patients",
      error: error?.message || "Unknown error",
    })

    return NextResponse.json({ patients: [], error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    // Log connection initiation
    const connectionStartTime = Date.now()
    connectionInfo = dbLogger.logConnectionStart("service-role", supabaseUrl, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/patients",
      method: "POST",
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "CREATE",
      table: "patients",
    })

    // Parse request body
    const body = await request.json()

    // Log data transformation (before)
    dbLogger.logDataTransformation("before", "CREATE", {
      receivedFields: Object.keys(body),
      firstName: body.first_name || body.firstName,
      lastName: body.last_name || body.lastName,
      hasEmail: !!body.email,
      hasPhone: !!body.phone,
    }, {
      operation: "CREATE",
      table: "patients",
    })

    // Prepare insert data
    const insertData = {
      first_name: body.first_name || body.firstName,
      last_name: body.last_name || body.lastName,
      date_of_birth: body.date_of_birth || body.dateOfBirth,
      phone: body.phone,
      email: body.email,
      gender: body.gender,
      address: body.address,
      emergency_contact_name: body.emergency_contact_name,
      emergency_contact_phone: body.emergency_contact_phone,
      insurance_provider: body.insurance_provider,
      insurance_id: body.insurance_id,
    }

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "INSERT",
        table: "patients",
        data: insertData,
        queryString: `INSERT INTO patients (first_name, last_name, date_of_birth, phone, email, gender, address, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_id) VALUES (...)`,
      },
      connectionInfo.connectionId,
      {
        operation: "CREATE",
        table: "patients",
        endpoint: "/api/patients",
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
          endpoint: "/api/patients",
        }
      )

      dbLogger.logOperationSummary("CREATE", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "CREATE",
        table: "patients",
        endpoint: "/api/patients",
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
        endpoint: "/api/patients",
      }
    )

    // Log data transformation (after)
    dbLogger.logDataTransformation("after", "CREATE", {
      patientId: data?.id,
      firstName: data?.first_name,
      lastName: data?.last_name,
      createdAt: data?.created_at,
    }, {
      operation: "CREATE",
      table: "patients",
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
      endpoint: "/api/patients",
      patientId: data?.id,
      patientName: `${data?.first_name} ${data?.last_name}`,
    })

    return NextResponse.json({ patient: data })
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
          endpoint: "/api/patients",
        }
      )
    }

    dbLogger.logOperationSummary("CREATE", "patients", false, {
      totalTime,
    }, {
      operation: "CREATE",
      table: "patients",
      endpoint: "/api/patients",
      error: error?.message || "Unknown error",
    })

    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
