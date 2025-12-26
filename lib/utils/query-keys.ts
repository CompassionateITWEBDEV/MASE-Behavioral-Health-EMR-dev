/**
 * Query Keys for React Query
 * Centralized query key factory for consistent cache management
 */

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  stats: () => [...patientKeys.all, "stats"] as const,
  search: (query: string) => [...patientKeys.all, "search", query] as const,
}

