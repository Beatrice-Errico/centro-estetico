import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

export function createServiceRoleClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceRoleClient() deve essere usato solo lato server.')
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !serviceRole) {
    throw new Error('Mancano NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }
  return createSupabaseClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
