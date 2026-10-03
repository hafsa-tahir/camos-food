import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdmin, adminUnauthorized } from '@/lib/adminAuth'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  calories: z.number().int().positive(),
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

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('food_items').select('*').order('sort_order')

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  
  // Combine database items with REAL_MENU_ITEMS from menuData.ts
  const dbItems = data || []
  const { REAL_MENU_ITEMS } = await import('@/lib/menuData')

  // Find items in REAL_MENU_ITEMS that are not yet in dbItems (by name or id)
  const existingNames = new Set(dbItems.map((i) => i.name.toLowerCase()))
  const missingRealItems = REAL_MENU_ITEMS.filter((i) => !existingNames.has(i.name.toLowerCase()))

  const allItems = [...dbItems, ...missingRealItems]

  return NextResponse.json({ data: allItems })
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return adminUnauthorized()
  const supabase = await createServiceClient()

  try {
    const body = await request.json()
    const parsed = itemSchema.parse(body)

    const { data, error } = await supabase
      .from('food_items')
      .insert({ ...parsed, status: parsed.status || 'active' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, message: 'Food item created' })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
