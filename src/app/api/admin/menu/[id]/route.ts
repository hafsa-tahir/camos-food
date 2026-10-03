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

    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id)
    if (isUuid) {
      const { data, error } = await supabase
        .from('food_items')
        .update(parsed)
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data, message: 'Item updated' })
    } else {
      // Find DB item by name or slug
      const formattedName = id.replace(/-/g, ' ')
      const { data: existing } = await supabase
        .from('food_items')
        .select('*')
        .ilike('name', formattedName)
        .maybeSingle()

      if (existing) {
        const { data: updated } = await supabase
          .from('food_items')
          .update(parsed)
          .eq('id', existing.id)
          .select()
          .single()

        return NextResponse.json({ data: updated, message: 'Item updated' })
      } else {
        // Insert new item with updated status
        const { data: inserted, error: insErr } = await supabase
          .from('food_items')
          .insert({
            name: formattedName.replace(/\b\w/g, (l) => l.toUpperCase()),
            price: parsed.price || 550,
            calories: parsed.calories || 500,
            status: parsed.status || 'active',
            category: parsed.category || 'main',
            ...parsed,
          })
          .select()
          .single()

        if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
        return NextResponse.json({ data: inserted, message: 'Item updated' })
      }
    }
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

  const isUuid = /^[0-9a-fA-F-]{36}$/.test(id)
  let query = supabase.from('food_items').delete()

  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.ilike('name', id.replace(/-/g, ' '))
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message: 'Item deleted' })
}
