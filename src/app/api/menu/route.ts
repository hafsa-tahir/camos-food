import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { REAL_MENU_ITEMS } from '@/lib/menuData'

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient()
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)
  const minCalories = searchParams.get('min_calories')
  const maxCalories = searchParams.get('max_calories')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  let query = supabase
    .from('food_items')
    .select('*')
    .order('sort_order', { ascending: true })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  if (minCalories) {
    query = query.gte('calories', parseInt(minCalories))
  }

  if (maxCalories) {
    query = query.lte('calories', parseInt(maxCalories))
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  const { data: dbItems, error } = await query

  // Merge DB items with REAL_MENU_ITEMS baseline.
  // DB items (including inactive/out-of-stock ones) ALWAYS override local items!
  const dbNames = new Set((dbItems || []).map((i) => i.name.toLowerCase()))
  const localOnly = REAL_MENU_ITEMS.filter((i) => !dbNames.has(i.name.toLowerCase()))

  let items = [...(dbItems || []), ...localOnly]

  // Filter out subscription plans so deals remain strictly on the /deals page
  items = items.filter((i) => i.category !== 'subscription' && !i.name.toLowerCase().includes('plan') && !i.tags?.includes('subscription'))

  // Apply filters on merged list when DB didn't handle them
  if (!dbItems || dbItems.length === 0) {
    if (category && category !== 'all') {
      items = items.filter(i => i.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
    }
    if (featured === 'true') {
      items = items.filter(i => i.is_featured)
    }
  }

  // Also fetch active deals
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .or('ends_at.is.null,ends_at.gt.now()')

  return NextResponse.json({ data: { items, deals: deals || [] } })
}
