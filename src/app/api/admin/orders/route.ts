import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, adminUnauthorized } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('orders')
    .select('*, customers(name, email, phone), order_items(*, food_items(name))')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data || [] })
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

  const { status } = await request.json()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, message: `Order status updated to ${status}` })
}
