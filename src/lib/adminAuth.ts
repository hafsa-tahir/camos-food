import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Checks if the request or current session has admin permissions.
 * Checks ADMIN_SECRET_KEY match from cookies/headers OR user role in Supabase.
 */
export async function checkIsAdmin(request?: NextRequest): Promise<boolean> {
  try {
    const adminKey = process.env.ADMIN_SECRET_KEY || 'ORGANIC;CHEMISTRY6969'

    // Check custom request header
    if (request) {
      const headerKey = request.headers.get('x-admin-key')
      if (headerKey && headerKey === adminKey) return true
    }

    // Check admin_key cookie
    const cookieStore = await cookies()
    const cookieKey = cookieStore.get('admin_key')?.value
    if (cookieKey && cookieKey === adminKey) return true

    // Fallback: Check Supabase Auth User
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      const { data: customer } = await supabase
        .from('customers')
        .select('email, role')
        .eq('id', user.id)
        .single()

      const adminEmails = (process.env.ADMIN_EMAILS || 'admin@camosfoods.com')
        .split(',')
        .map((e) => e.trim().toLowerCase())

      if (customer?.role === 'admin') return true
      if (customer?.email && adminEmails.includes(customer.email.toLowerCase())) return true
      if (user.email && adminEmails.includes(user.email.toLowerCase())) return true
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
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
}

