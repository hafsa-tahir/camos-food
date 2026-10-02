import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Returns null if env vars are not yet configured
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY.length > 20
  )
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client that won't throw on creation
    // (actual calls will fail gracefully at the call site)
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
    )
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
