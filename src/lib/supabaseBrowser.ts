import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function createBrowserClient(): SupabaseClient {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // ✅ In SSR (window undefined) ritorniamo un client senza storage (no persist/refresh)
  if (typeof window === 'undefined') {
    return createSupabaseClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  // ✅ In browser usiamo un singleton con storage
  if (browserClient) return browserClient
  browserClient = createSupabaseClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'ce-auth',
    },
  })
  return browserClient
}
