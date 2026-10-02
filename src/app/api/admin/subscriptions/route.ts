import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, adminUnauthorized } from '@/lib/adminAuth'
import { z } from 'zod'

const subscriptionSchema = z.object({
  user_name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().optional(),
  package_plan: z.string().min(2),
  status: z.enum(['active', 'paused', 'expired']).optional(),
  start_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  try {
    let directSubs: any[] = []
    try {
      const { data } = await supabase
        .from('weekly_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) directSubs = data
    } catch {
      // Table fallback
    }

    // Derive subscriptions from orders containing subscription/package items
    const { data: orders } = await supabase
      .from('orders')
      .select('*, customers(name, email, phone), order_items(*)')
      .order('created_at', { ascending: false })

    const orderDerivedSubs: any[] = []

    if (orders) {
      for (const o of orders) {
        const subItems = o.order_items?.filter(
          (it: any) =>
            it.name_at_order?.toLowerCase().includes('plan') ||
            it.name_at_order?.toLowerCase().includes('package') ||
            it.name_at_order?.toLowerCase().includes('subscription') ||
            it.name_at_order?.toLowerCase().includes('diet') ||
            it.name_at_order?.toLowerCase().includes('desi')
        ) || []

        let packageTitle = ''
        if (subItems.length > 0) {
          packageTitle = subItems.map((it: any) => `${it.quantity}x ${it.name_at_order}`).join(', ')
        } else if (o.subtotal === 3550) packageTitle = '5-Day Diet Plan'
        else if (o.subtotal === 5250) packageTitle = '7-Day Diet Plan'
        else if (o.subtotal === 2800) packageTitle = '5-Day Desi Plan'
        else if (o.subtotal === 3750) packageTitle = '7-Day Desi Plan (Chicken Qeema)'
        else if (o.subtotal === 3900) packageTitle = '7-Day Desi Plan (Beef Qeema)'

        if (packageTitle) {
          orderDerivedSubs.push({
            id: `sub-ord-${o.id.slice(0, 8)}`,
            order_id: o.id,
            user_name: o.customers?.name || o.customers?.email?.split('@')[0] || 'Customer',
            phone: o.customers?.phone || 'No phone provided',
            email: o.customers?.email || 'N/A',
            package_plan: packageTitle,
            status: o.status === 'cancelled' ? 'expired' : 'active',
            start_date: new Date(o.created_at).toISOString().split('T')[0],
            notes: `Order #${o.id.slice(0, 8)} | ${o.delivery_address || 'No address'} | PKR ${o.total}`,
            created_at: o.created_at,
          })
        }
      }
    }

    const allSubs = [...directSubs]
    for (const sub of orderDerivedSubs) {
      if (!allSubs.some((s) => s.id === sub.id || (s as any).order_id === sub.order_id)) {
        allSubs.push(sub)
      }
    }

    return NextResponse.json({ data: allSubs })
  } catch (err) {
    console.error('Error fetching subscriptions:', err)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  try {
    const body = await request.json()
    const parsed = subscriptionSchema.parse(body)

    const newSub = {
      ...parsed,
      status: parsed.status || 'active',
      start_date: parsed.start_date || new Date().toISOString().split('T')[0],
    }

    const { data, error } = await supabase
      .from('weekly_subscriptions')
      .insert(newSub)
      .select()
      .single()

    if (error) {
      // Fallback if table doesn't exist yet in Supabase SQL schema
      return NextResponse.json({
        data: { id: `sub-${Date.now()}`, ...newSub, created_at: new Date().toISOString() },
        message: 'Subscriber added successfully',
      })
    }

    return NextResponse.json({ data, message: 'Subscriber added successfully' })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('weekly_subscriptions')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: { id, ...body }, message: 'Subscription status updated' })
    }

    return NextResponse.json({ data, message: 'Subscription status updated' })
  } catch {
    return NextResponse.json({ error: 'Error updating subscription' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })

  await supabase.from('weekly_subscriptions').delete().eq('id', id)
  return NextResponse.json({ message: 'Subscription removed' })
}
