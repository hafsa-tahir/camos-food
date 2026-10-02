import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, adminUnauthorized } from '@/lib/adminAuth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  calories: z.number().int().positive().optional(),
  protein_g: z.number().min(0).optional(),
  carbs_g: z.number().min(0).optional(),
  fat_g: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  image_url: z.string().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'rejected']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()
  const { id } = await params

  try {
    const body = await request.json()
    const parsed = updateSchema.parse(body)

    const { data, error } = await supabase
      .from('food_items')
      .update(parsed)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, message: 'Item updated' })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()
  const { id } = await params

  const { error } = await supabase.from('food_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message: 'Item deleted' })
}
