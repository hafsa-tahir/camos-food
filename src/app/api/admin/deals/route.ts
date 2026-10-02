import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, adminUnauthorized } from '@/lib/adminAuth'
import { z } from 'zod'

const dealSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.number().positive(),
  applies_to: z.enum(['storewide', 'item', 'category']),
  item_id: z.string().min(1).optional(),
  category: z.string().optional(),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().optional(),
  image_url: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  try {
    const body = await request.json()
    const parsed = dealSchema.parse(body)

    const { data, error } = await supabase
      .from('deals')
      .insert({ ...parsed, is_active: parsed.is_active ?? true })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, message: 'Deal created' })
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
  if (!id) return NextResponse.json({ error: 'Deal ID required' }, { status: 400 })

  const body = await request.json()
  const { data, error } = await supabase.from('deals').update(body).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, message: 'Deal updated' })
}
