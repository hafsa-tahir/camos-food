import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_key')
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
