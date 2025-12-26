import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { dbLogger } from "@/lib/utils/db-logger"
import type { PatientWithRelations } from "@/types/patient"
import type { PatientDetailResponse, ApiError } from "@/types/api"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/patients/[id]
 * Fetch a single patient with all relations
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    const { id } = await params

    // Log connection initiation
    const connectionStartTime = Date.now()
    connectionInfo = dbLogger.logConnectionStart("service-role", supabaseUrl, {
      operation: "READ",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      method: "GET",
      patientId: id,
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "READ",
      table: "patients",
      patientId: id,
    })

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "SELECT",
        table: "patients",
        filters: { id },
        queryString: `SELECT * FROM patients WHERE id = '${id}' WITH relations`,
      },
      connectionInfo.connectionId,
      {
        operation: "READ",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Execute query with all relations
    const queryStartTime = Date.now()
    const { data: patient, error } = await supabase
      .from("patients")
      .select(`
        *,
        appointments(
          id,
          appointment_date,
          duration_minutes,
          appointment_type,
          status,
          notes,
          provider_id,
          providers(
            id,
            first_name,
            last_name,
            email
          )
        ),
        assessments(
          id,
          assessment_type,
          assessment_date,
          risk_assessment,
          scores,
          notes,
          provider_id,
          created_at
        ),
        medications(
          id,
          medication_name,
          dosage,
          frequency,
          status,
          start_date,
          end_date,
          prescriber_id
        ),
        patient_insurance(
          id,
          payer_id,
          policy_number,
          group_number,
          subscriber_name,
          subscriber_relationship,
          effective_date,
          termination_date,
          is_primary,
          copay_amount,
          status,
          is_active
        ),
        vital_signs(
          id,
          measurement_date,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          heart_rate,
          temperature,
          respiratory_rate,
          oxygen_saturation,
          weight,
          height,
          bmi
        ),
        progress_notes(
          id,
          note_date,
          note_type,
          subjective,
          objective,
          assessment,
          plan,
          provider_id
        )
      `)
      .eq("id", id)
      .single()
    const queryTime = Date.now() - queryStartTime

    if (error) {
      dbLogger.logQueryError(
        requestId!,
        {
          operation: "SELECT",
          table: "patients",
          filters: { id },
        },
        connectionInfo.connectionId,
        error,
        { queryTime },
        {
          operation: "READ",
          table: "patients",
          endpoint: `/api/patients/${id}`,
          patientId: id,
        }
      )

      dbLogger.logOperationSummary("READ", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "READ",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
        error: error.message,
      })

      return NextResponse.json<ApiError>(
        { error: error.message },
        { status: 404 }
      )
    }

    if (!patient) {
      return NextResponse.json<ApiError>(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Log query success
    dbLogger.logQuerySuccess(
      requestId!,
      {
        operation: "SELECT",
        table: "patients",
        filters: { id },
      },
      connectionInfo.connectionId,
      {
        queryTime,
        rowsReturned: 1,
      },
      patient,
      {
        operation: "READ",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Log operation summary
    dbLogger.logOperationSummary("READ", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsReturned: 1,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      patientId: id,
    })

    return NextResponse.json<PatientDetailResponse>({
      patient: patient as PatientWithRelations,
    })
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
          endpoint: `/api/patients/[id]`,
        }
      )
    }

    dbLogger.logOperationSummary("READ", "patients", false, {
      totalTime,
    }, {
      operation: "READ",
      table: "patients",
      endpoint: `/api/patients/[id]`,
      error: error?.message || "Unknown error",
    })

    return NextResponse.json<ApiError>(
      { error: "Failed to fetch patient" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/patients/[id]
 * Update an existing patient
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    const { id } = await params
    const body = await request.json()

    // Log connection initiation
    const connectionStartTime = Date.now()
    connectionInfo = dbLogger.logConnectionStart("service-role", supabaseUrl, {
      operation: "UPDATE",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      method: "PUT",
      patientId: id,
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "UPDATE",
      table: "patients",
      patientId: id,
    })

    // Log data transformation (before)
    dbLogger.logDataTransformation("before", "UPDATE", {
      patientId: id,
      updatedFields: Object.keys(body),
    }, {
      operation: "UPDATE",
      table: "patients",
      patientId: id,
    })

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "UPDATE",
        table: "patients",
        filters: { id },
        data: updateData,
        queryString: `UPDATE patients SET ... WHERE id = '${id}'`,
      },
      connectionInfo.connectionId,
      {
        operation: "UPDATE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Execute update
    const queryStartTime = Date.now()
    const { data, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()
    const queryTime = Date.now() - queryStartTime

    if (error) {
      dbLogger.logQueryError(
        requestId!,
        {
          operation: "UPDATE",
          table: "patients",
          filters: { id },
          data: updateData,
        },
        connectionInfo.connectionId,
        error,
        { queryTime },
        {
          operation: "UPDATE",
          table: "patients",
          endpoint: `/api/patients/${id}`,
          patientId: id,
        }
      )

      dbLogger.logOperationSummary("UPDATE", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "UPDATE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
        error: error.message,
      })

      return NextResponse.json<ApiError>(
        { error: error.message },
        { status: 500 }
      )
    }

    // Log query success
    dbLogger.logQuerySuccess(
      requestId!,
      {
        operation: "UPDATE",
        table: "patients",
        filters: { id },
        data: updateData,
      },
      connectionInfo.connectionId,
      {
        queryTime,
        rowsAffected: 1,
        rowsReturned: 1,
      },
      data,
      {
        operation: "UPDATE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Log operation summary
    dbLogger.logOperationSummary("UPDATE", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsAffected: 1,
      rowsReturned: 1,
    }, {
      operation: "UPDATE",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      patientId: id,
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
          operation: "UPDATE",
          table: "patients",
          endpoint: `/api/patients/[id]`,
        }
      )
    }

    dbLogger.logOperationSummary("UPDATE", "patients", false, {
      totalTime,
    }, {
      operation: "UPDATE",
      table: "patients",
      endpoint: `/api/patients/[id]`,
      error: error?.message || "Unknown error",
    })

    return NextResponse.json<ApiError>(
      { error: "Failed to update patient" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/patients/[id]
 * Delete a patient
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operationStartTime = Date.now()
  let connectionInfo: any = null
  let requestId: string | null = null

  try {
    const { id } = await params

    // Log connection initiation
    const connectionStartTime = Date.now()
    connectionInfo = dbLogger.logConnectionStart("service-role", supabaseUrl, {
      operation: "DELETE",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      method: "DELETE",
      patientId: id,
    })

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    const connectionTime = Date.now() - connectionStartTime
    dbLogger.logConnectionSuccess(connectionInfo, connectionTime, {
      operation: "DELETE",
      table: "patients",
      patientId: id,
    })

    // Log query start
    requestId = dbLogger.logQueryStart(
      {
        operation: "DELETE",
        table: "patients",
        filters: { id },
        queryString: `DELETE FROM patients WHERE id = '${id}'`,
      },
      connectionInfo.connectionId,
      {
        operation: "DELETE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Execute delete
    const queryStartTime = Date.now()
    const { error, data } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .select()
    const queryTime = Date.now() - queryStartTime

    if (error) {
      dbLogger.logQueryError(
        requestId!,
        {
          operation: "DELETE",
          table: "patients",
          filters: { id },
        },
        connectionInfo.connectionId,
        error,
        { queryTime },
        {
          operation: "DELETE",
          table: "patients",
          endpoint: `/api/patients/${id}`,
          patientId: id,
        }
      )

      dbLogger.logOperationSummary("DELETE", "patients", false, {
        connectionTime,
        queryTime,
        totalTime: Date.now() - operationStartTime,
      }, {
        operation: "DELETE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
        error: error.message,
      })

      return NextResponse.json<ApiError>(
        { error: error.message },
        { status: 500 }
      )
    }

    // Log query success
    dbLogger.logQuerySuccess(
      requestId!,
      {
        operation: "DELETE",
        table: "patients",
        filters: { id },
      },
      connectionInfo.connectionId,
      {
        queryTime,
        rowsAffected: data?.length || 0,
        rowsReturned: data?.length || 0,
      },
      data,
      {
        operation: "DELETE",
        table: "patients",
        endpoint: `/api/patients/${id}`,
        patientId: id,
      }
    )

    // Log operation summary
    dbLogger.logOperationSummary("DELETE", "patients", true, {
      connectionTime,
      queryTime,
      totalTime: Date.now() - operationStartTime,
      rowsAffected: data?.length || 0,
    }, {
      operation: "DELETE",
      table: "patients",
      endpoint: `/api/patients/${id}`,
      patientId: id,
      warning: "Patient permanently deleted",
    })

    return NextResponse.json({ success: true, message: "Patient deleted successfully" })
  } catch (error: any) {
    const totalTime = Date.now() - operationStartTime

    if (connectionInfo) {
      dbLogger.logConnectionError(
        connectionInfo,
        error,
        totalTime,
        {
          operation: "DELETE",
          table: "patients",
          endpoint: `/api/patients/[id]`,
        }
      )
    }

    dbLogger.logOperationSummary("DELETE", "patients", false, {
      totalTime,
    }, {
      operation: "DELETE",
      table: "patients",
      endpoint: `/api/patients/[id]`,
      error: error?.message || "Unknown error",
    })

    return NextResponse.json<ApiError>(
      { error: "Failed to delete patient" },
      { status: 500 }
    )
  }
}

