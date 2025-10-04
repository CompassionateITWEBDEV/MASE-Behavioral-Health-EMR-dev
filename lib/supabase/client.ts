import { createBrowserClient } from "@supabase/ssr"
import { createFallbackClient } from "./fallback"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createFallbackClient("client")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
