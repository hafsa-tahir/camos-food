import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const logSchema = z.object({
  food_item_id: z.string().min(1).optional(),
  custom_item_name: z.string().optional(),
  date: z.string().optional(),
  meal_slot: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.number().int().positive(),
  protein_g: z.number().min(0).optional(),
  carbs_g: z.number().min(0).optional(),
  fat_g: z.number().min(0).optional(),
  quantity: z.number().int().positive().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_meal_logs')
    .select('*, food_items(name, image_url)')
    .eq('customer_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalCalories = (data || []).reduce((sum, log) => sum + log.calories * (log.quantity || 1), 0)

  return NextResponse.json({ data: { logs: data || [], total_calories: totalCalories, date } })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = logSchema.parse(body)

    const { data, error } = await supabase
      .from('daily_meal_logs')
      .insert({
        customer_id: user.id,
        food_item_id: parsed.food_item_id || null,
        custom_item_name: parsed.custom_item_name || null,
        date: parsed.date || new Date().toISOString().split('T')[0],
        meal_slot: parsed.meal_slot,
        calories: parsed.calories,
        protein_g: parsed.protein_g || 0,
        carbs_g: parsed.carbs_g || 0,
        fat_g: parsed.fat_g || 0,
        quantity: parsed.quantity || 1,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, message: 'Meal logged successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const logId = searchParams.get('id')

  if (!logId) {
    return NextResponse.json({ error: 'Log ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('daily_meal_logs')
    .delete()
    .eq('id', logId)
    .eq('customer_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Log deleted' })
}
