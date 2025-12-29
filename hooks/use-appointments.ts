/**
 * Custom hook for fetching appointments and schedule data
 * Retrieves appointment lists with optional filtering
 *
 * NOTE: The /api/appointments endpoint will be created in Phase 3.
 * This hook is structured to work with the planned API.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "@/lib/utils/query-keys";
import type {
  AppointmentRecord,
  ScheduleFilters,
  ScheduleSummary,
  AppointmentsResponse,
} from "@/types/schedule";

/**
 * Options for useAppointments hook
 */
interface UseAppointmentsOptions {
  /** Filters to apply to the query */
  filters?: ScheduleFilters;
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
}

/**
 * Fetches appointments with optional filtering
 *
 * @param options - Hook options including filters and enabled flag
 * @returns React Query result with appointments data
 *
 * @example
 * ```tsx
 * // Fetch all appointments
 * const { data, isLoading } = useAppointments();
 *
 * // Fetch with filters
 * const { data } = useAppointments({
 *   filters: {
 *     date: '2024-01-15',
 *     providerId: 'provider-uuid',
 *     status: ['scheduled', 'confirmed']
 *   }
 * });
 * ```
 *
 * @remarks
 * API endpoint /api/appointments will be created in Phase 3
 */
export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { filters, enabled = true } = options;

  return useQuery<AppointmentsResponse>({
    queryKey: appointmentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.date) {
        params.append("date", filters.date);
      }
      if (filters?.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters?.endDate) {
        params.append("endDate", filters.endDate);
      }
      if (filters?.providerId) {
        params.append("providerId", filters.providerId);
      }
      if (filters?.patientId) {
        params.append("patientId", filters.patientId);
      }
      if (filters?.status) {
        const statusValue = Array.isArray(filters.status)
          ? filters.status.join(",")
          : filters.status;
        params.append("status", statusValue);
      }
      if (filters?.appointmentType) {
        const typeValue = Array.isArray(filters.appointmentType)
          ? filters.appointmentType.join(",")
          : filters.appointmentType;
        params.append("type", typeValue);
      }

      const url = `/api/appointments${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch appointments");
      }

      return response.json();
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds - appointments change frequently
  });
}

/**
 * Fetches a single appointment by ID
 *
 * @param appointmentId - The appointment UUID
 * @param enabled - Whether to enable the query
 * @returns React Query result with appointment details
 */
export function useAppointment(
  appointmentId: string | null | undefined,
  enabled = true
) {
  return useQuery<{ appointment: AppointmentRecord }>({
    queryKey: appointmentKeys.detail(appointmentId || ""),
    queryFn: async () => {
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }

      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch appointment");
      }
      return response.json();
    },
    enabled: enabled && !!appointmentId,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetches schedule summary for a given date
 *
 * @param date - Date string (YYYY-MM-DD format)
 * @param enabled - Whether to enable the query
 * @returns React Query result with schedule summary
 */
export function useScheduleSummary(date?: string, enabled = true) {
  return useQuery<{ summary: ScheduleSummary }>({
    queryKey: appointmentKeys.summary(date),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) {
        params.append("date", date);
      }
      params.append("summary", "true");

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch schedule summary");
      }
      return response.json();
    },
    enabled,
    staleTime: 30 * 1000,
  });
}
