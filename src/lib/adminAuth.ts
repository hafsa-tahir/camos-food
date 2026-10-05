import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = ['camosfoodapp@gmail.com', 'camosfoodapp@gamil.com', 'admin@camosfoods.com']

/**
 * Checks if the request or current session has admin permissions.
 * Verifies ADMIN_SECRET_KEY cookie/header OR logged in user role/email.
 */
export async function checkIsAdmin(request?: NextRequest): Promise<boolean> {
  try {
    const adminKey = process.env.ADMIN_SECRET_KEY || 'ORGANIC;CHEMISTRY6969'

    // 1. Check custom request header
    if (request) {
      const headerKey = request.headers.get('x-admin-key')
      if (headerKey && headerKey === adminKey) return true
    }

    // 2. Check admin_key HTTP-only cookie
    const cookieStore = await cookies()
    const cookieKey = cookieStore.get('admin_key')?.value
    if (cookieKey && cookieKey === adminKey) return true

    // 3. Fallback: Check Supabase Auth User
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true

      const { data: customer } = await supabase
        .from('customers')
        .select('email, role')
        .eq('id', user.id)
        .maybeSingle()

      if (customer?.role === 'admin') return true
      if (customer?.email && ADMIN_EMAILS.includes(customer.email.toLowerCase())) return true
    }

    return false
  } catch {
    return false
  }
}

export async function isAdmin(request: NextRequest): Promise<boolean> {
  return await checkIsAdmin(request)
}

export function adminUnauthorized() {
  return NextResponse.json(
    { error: 'Admin access required. Please sign in with an admin account.' },
    { status: 403 }
  )
}
