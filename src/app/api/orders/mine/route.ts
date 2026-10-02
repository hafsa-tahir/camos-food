import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = await createServiceClient()

  let customerIds: string[] = [user.id]
  if (user.email) {
    const { data: matchedCust } = await serviceClient
      .from('customers')
      .select('id')
      .eq('email', user.email)
    if (matchedCust && matchedCust.length > 0) {
      customerIds = Array.from(new Set([...customerIds, ...matchedCust.map((c) => c.id)]))
    }
  }

  const { data, error } = await serviceClient
    .from('orders')
    .select('*, order_items(*, food_items(name, image_url))')
    .in('customer_id', customerIds)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
