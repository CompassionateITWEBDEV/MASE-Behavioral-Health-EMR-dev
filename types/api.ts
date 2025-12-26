/**
 * API Response Type Definitions
 * Standardized types for API responses across the application
 */

/**
 * Standard API error response
 */
export interface ApiError {
  error: string
  message?: string
  code?: string
  details?: Record<string, any>
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Standard API success response
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

/**
 * Patient list API response
 */
export interface PatientListResponse {
  patients: Patient[]
  total?: number
  error?: string
}

/**
 * Patient detail API response
 */
export interface PatientDetailResponse {
  patient: PatientWithRelations
  error?: string
}

/**
 * Patient stats API response
 */
export interface PatientStatsResponse {
  stats: PatientStats
  error?: string
}

/**
 * Generic mutation response
 */
export interface MutationResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Re-export Patient types for convenience
export type {
  Patient,
  PatientWithRelations,
  PatientFilters,
  PatientStats,
} from "./patient"

