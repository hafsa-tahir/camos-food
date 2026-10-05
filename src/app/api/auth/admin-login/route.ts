import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { key, secretKey, passkey, password } = await request.json()
    const providedKey = (key || secretKey || passkey || password || '').trim()

    const expectedKey = process.env.ADMIN_SECRET_KEY || 'camos_admin_secure_key_2026'

    if (providedKey && providedKey === expectedKey) {
      const cookieStore = await cookies()
      cookieStore.set('admin_key', expectedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 12, // 12 hours session
        path: '/',
      })

      return NextResponse.json({ message: 'Admin authenticated successfully' })
    }

    return NextResponse.json({ error: 'Invalid admin secret password' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
