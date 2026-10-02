import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

function isConfigured(url: string, key: string) {
  return url.startsWith('http') && key.length > 20
}

/**
 * Client for user-scoped requests (respects RLS & user session cookies)
 */
export async function createClient() {
  const cookieStore = await cookies()
  const url = isConfigured(SUPABASE_URL, SUPABASE_ANON_KEY) ? SUPABASE_URL : PLACEHOLDER_URL
  const key = isConfigured(SUPABASE_URL, SUPABASE_ANON_KEY) ? SUPABASE_ANON_KEY : PLACEHOLDER_KEY

  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component — OK
        }
      },
    },
  })
}

/**
 * Service Role Client for administrative & cross-user database operations (100% bypasses RLS)
 */
export async function createServiceClient() {
  const url = isConfigured(SUPABASE_URL, SERVICE_ROLE_KEY) ? SUPABASE_URL : PLACEHOLDER_URL
  const key = isConfigured(SUPABASE_URL, SERVICE_ROLE_KEY) ? SERVICE_ROLE_KEY : PLACEHOLDER_KEY

  return createSupabaseJsClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
