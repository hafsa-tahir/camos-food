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

  let { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (status === 'confirmed' && (error.message?.includes('violates check constraint') || error.message?.includes('constraint'))) {
      const retry = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', id)
        .select()
        .single()

      if (!retry.error) {
        return NextResponse.json({ data: retry.data, message: 'Order status confirmed (recorded as paid)' })
      }
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ data, message: `Order status updated to ${status}` })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  try {
    if (action === 'reset_amounts') {
      await supabase
        .from('order_items')
        .update({ price_at_order: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      const { error } = await supabase
        .from('orders')
        .update({ subtotal: 0, discount_amount: 0, total: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ message: 'All order amounts and revenue reset to PKR 0' })
    }

    if (action === 'clear_all') {
      await supabase
        .from('order_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      const { error } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ message: 'All order history cleared from Supabase' })
    }

    if (id) {
      await supabase.from('order_items').delete().eq('order_id', id)
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ message: 'Order deleted' })
    }

    return NextResponse.json({ error: 'Missing action or order id' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
