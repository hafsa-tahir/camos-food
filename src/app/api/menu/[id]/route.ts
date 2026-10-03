import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { REAL_MENU_ITEMS, enrichFoodItem } from '@/lib/menuData'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServiceClient()

  // Try Supabase first
  const { data } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', id)
    .single()

  if (data) {
    return NextResponse.json({ data: enrichFoodItem(data) })
  }

  // Fallback to local menu data
  const localItem = REAL_MENU_ITEMS.find(
    (i) => i.id === id || i.name.toLowerCase() === id.toLowerCase()
  )
  if (localItem) {
    return NextResponse.json({ data: enrichFoodItem(localItem) })
  }

  return NextResponse.json({ error: 'Item not found' }, { status: 404 })
}
