import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { key, secretKey, passkey } = await request.json()
    const providedKey = (key || secretKey || passkey || '').trim()

    const expectedKey = process.env.ADMIN_SECRET_KEY || 'ORGANIC;CHEMISTRY6969'

    if (providedKey === expectedKey) {
      const cookieStore = await cookies()
      cookieStore.set('admin_key', expectedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({ message: 'Admin authenticated successfully' })
    }

    return NextResponse.json({ error: 'Invalid admin secret key' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
