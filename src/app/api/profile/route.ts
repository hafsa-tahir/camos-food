import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateDailyCalories } from '@/lib/utils'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  weight_kg: z.number().optional(),
  height_cm: z.number().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female']).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['lose_weight', 'maintain', 'gain_weight']).optional(),
  restrictions: z.array(z.string()).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: customer }, { data: dietProfile }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', user.id).single(),
    supabase.from('diet_profiles').select('*').eq('customer_id', user.id).single(),
  ])

  return NextResponse.json({ data: { customer, diet_profile: dietProfile } })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = profileSchema.parse(body)

    // Update customer
    if (parsed.name || parsed.phone || parsed.address) {
      await supabase.from('customers').update({
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.phone !== undefined && { phone: parsed.phone }),
        ...(parsed.address !== undefined && { address: parsed.address }),
      }).eq('id', user.id)
    }

    // Update/insert diet profile
    const dietFields = {
      weight_kg: parsed.weight_kg,
      height_cm: parsed.height_cm,
      age: parsed.age,
      gender: parsed.gender,
      activity_level: parsed.activity_level,
      goal: parsed.goal,
      restrictions: parsed.restrictions,
    }

    const hasDietFields = Object.values(dietFields).some((v) => v !== undefined)
    if (hasDietFields) {
      // Calculate calorie target if we have all required fields
      let calorie_target: number | undefined
      const { data: existing } = await supabase
        .from('diet_profiles')
        .select('*')
        .eq('customer_id', user.id)
        .single()

      const merged = { ...existing, ...dietFields }
      if (merged.weight_kg && merged.height_cm && merged.age && merged.gender && merged.activity_level && merged.goal) {
        calorie_target = calculateDailyCalories({
          weight_kg: merged.weight_kg,
          height_cm: merged.height_cm,
          age: merged.age,
          gender: merged.gender,
          activity_level: merged.activity_level,
          goal: merged.goal,
        })
      }

      await supabase.from('diet_profiles').upsert({
        customer_id: user.id,
        ...Object.fromEntries(Object.entries(dietFields).filter(([, v]) => v !== undefined)),
        ...(calorie_target && { calorie_target }),
      }, { onConflict: 'customer_id' })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
