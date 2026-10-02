import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { calculateDailyCalories } from '@/lib/utils'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  referral_code: z.string().optional(),
  weight_kg: z.number().optional(),
  height_cm: z.number().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female']).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['lose_weight', 'maintain', 'gain_weight']).optional(),
  restrictions: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.parse(body)
    const normalizedEmail = parsed.email.trim().toLowerCase()

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // 1. Check if an account already exists with this exact email
    const { data: existingCustomer } = await serviceClient
      .from('customers')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // 2. Create auto-confirmed user via Admin Service Client (bypasses email confirmation requirement)
    let userId: string | null = null
    let session: any = null

    const { data: adminUser, error: adminError } = await serviceClient.auth.admin.createUser({
      email: normalizedEmail,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { name: parsed.name.trim() },
    })

    if (adminUser?.user) {
      userId = adminUser.user.id
    } else {
      // Fallback to standard signUp if admin API is restricted
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: parsed.password,
        options: {
          data: { name: parsed.name.trim() },
        },
      })

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      if (!authData.user) {
        return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
      }

      userId = authData.user.id
      session = authData.session
    }

    // Automatically sign in to generate session
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: parsed.password,
    })

    if (signInData?.session) {
      session = signInData.session
    }

    // 3. Upsert customer profile
    await serviceClient
      .from('customers')
      .upsert({
        id: userId,
        name: parsed.name.trim(),
        email: normalizedEmail,
      })

    // 4. Process Referral Code if provided during signup
    let referralApplied = false
    let referralError: string | null = null
    if (parsed.referral_code && parsed.referral_code.trim()) {
      const codeUpper = parsed.referral_code.trim().toUpperCase()
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('*')
        .eq('code', codeUpper)
        .eq('is_active', true)
        .maybeSingle()

      if (!coupon) {
        referralError = `Referral code "${codeUpper}" is invalid or expired`
      } else if (coupon.owner_id === userId) {
        referralError = 'You cannot redeem your own referral code'
      } else if ((coupon.times_used || 0) >= 1 || !coupon.is_active) {
        referralError = 'This single-use referral code has already been redeemed and is now expired'
      } else {
        referralApplied = true
        await serviceClient
          .from('coupons')
          .update({
            times_used: 1,
            is_active: false,
          })
          .eq('id', coupon.id)
      }
    }

    // 5. Create diet profile if provided
    if (parsed.weight_kg && parsed.height_cm && parsed.age && parsed.gender && parsed.activity_level && parsed.goal) {
      const calorie_target = calculateDailyCalories({
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        age: parsed.age,
        gender: parsed.gender,
        activity_level: parsed.activity_level,
        goal: parsed.goal,
      })

      await serviceClient.from('diet_profiles').insert({
        customer_id: userId,
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        age: parsed.age,
        gender: parsed.gender,
        activity_level: parsed.activity_level,
        goal: parsed.goal,
        calorie_target,
        restrictions: parsed.restrictions || [],
      })
    }

    return NextResponse.json({
      data: {
        user: { id: userId, email: normalizedEmail, user_metadata: { name: parsed.name.trim() } },
        session,
        referral_applied: referralApplied,
      },
      message: referralApplied
        ? 'Account created! Referral code applied: Both you and your friend receive 10% OFF!'
        : 'Account created successfully!',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Unhandled signup API error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
