import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Helper that creates a Supabase client using the service role key.
 *
 * The service role key is required for privileged operations executed from
 * backend API routes (e.g. dispensing transactions). The key is never exposed
 * to the browser because this helper relies on the request scoped cookie
 * store provided by Next.js server components.
 */
export async function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured")
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore errors when called from a Server Component without mutable cookies.
        }
      },
    },
  })
}
