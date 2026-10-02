import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMealSlotTargets } from '@/lib/utils'
import { FoodItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  // Get diet profile
  const { data: profile } = await supabase
    .from('diet_profiles')
    .select('*')
    .eq('customer_id', user.id)
    .single()

  if (!profile || !profile.calorie_target) {
    return NextResponse.json(
      { error: 'Please complete your diet profile first to get a meal plan.' },
      { status: 400 }
    )
  }

  // Get today's logs
  const { data: logs } = await supabase
    .from('daily_meal_logs')
    .select('*, food_items(*)')
    .eq('customer_id', user.id)
    .eq('date', date)

  // Calculate consumed calories per slot
  const consumedBySlot: Record<string, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  }
  const totalConsumed = logs?.reduce((sum, log) => {
    consumedBySlot[log.meal_slot] += log.calories
    return sum + log.calories
  }, 0) || 0

  const slotTargets = getMealSlotTargets(profile.calorie_target)

  // Get active menu items matching restrictions
  let query = supabase
    .from('food_items')
    .select('*')
    .eq('status', 'active')

  // Filter out items with restriction violations
  const restrictions = profile.restrictions || []
  if (restrictions.includes('vegan')) {
    query = query.overlaps('tags', ['vegan'])
  } else if (restrictions.includes('vegetarian')) {
    query = query.overlaps('tags', ['vegetarian', 'vegan'])
  }
  if (restrictions.includes('halal')) {
    query = query.overlaps('tags', ['halal', 'vegetarian', 'vegan'])
  }
  if (restrictions.includes('gluten-free')) {
    query = query.overlaps('tags', ['gluten-free'])
  }

  const { data: allItems } = await query

  const items = allItems || []

  // Smart selection: pick items closest to each slot's calorie target
  function pickItemsForSlot(targetCals: number, slotCategory?: string): FoodItem[] {
    let pool = [...items]
    if (slotCategory) {
      const preferred = pool.filter((i) => i.category === slotCategory)
      if (preferred.length > 0) pool = preferred
    }

    // Sort by calorie proximity to target
    pool.sort((a, b) =>
      Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals)
    )

    return pool.slice(0, 3)
  }

  const mealPlan = [
    {
      slot: 'breakfast',
      label: 'Breakfast',
      target_calories: slotTargets.breakfast,
      consumed_calories: consumedBySlot.breakfast,
      suggested_items: pickItemsForSlot(slotTargets.breakfast, 'breakfast'),
      logs: logs?.filter((l) => l.meal_slot === 'breakfast') || [],
    },
    {
      slot: 'lunch',
      label: 'Lunch',
      target_calories: slotTargets.lunch,
      consumed_calories: consumedBySlot.lunch,
      suggested_items: pickItemsForSlot(slotTargets.lunch, 'main'),
      logs: logs?.filter((l) => l.meal_slot === 'lunch') || [],
    },
    {
      slot: 'dinner',
      label: 'Dinner',
      target_calories: slotTargets.dinner,
      consumed_calories: consumedBySlot.dinner,
      suggested_items: pickItemsForSlot(slotTargets.dinner, 'rice'),
      logs: logs?.filter((l) => l.meal_slot === 'dinner') || [],
    },
    {
      slot: 'snack',
      label: 'Snacks',
      target_calories: slotTargets.snack,
      consumed_calories: consumedBySlot.snack,
      suggested_items: pickItemsForSlot(slotTargets.snack, 'snack'),
      logs: logs?.filter((l) => l.meal_slot === 'snack') || [],
    },
  ]

  return NextResponse.json({
    data: {
      date,
      calorie_target: profile.calorie_target,
      total_consumed: totalConsumed,
      remaining: Math.max(0, profile.calorie_target - totalConsumed),
      meal_plan: mealPlan,
      restrictions: profile.restrictions,
    },
  })
}
