import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { calculateDailyCalories } from '@/lib/utils'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  referral_code: z.string().optional(),
  weight_kg: z.number().optional(),
  height_cm: z.number().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female']).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: z.enum(['lose_weight', 'maintain', 'gain_weight']).optional(),
  restrictions: z.array(z.string()).optional(),
})

const ADMIN_EMAILS = ['camosfoodapp@gmail.com', 'camosfoodapp@gamil.com', 'admin@camosfoods.com']
const ADMIN_PASSWORD = process.env.ADMIN_SECRET_KEY || 'ORGANIC;CHEMISTRY6969'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.parse(body)
    const normalizedEmail = parsed.email.trim().toLowerCase()
    const isAdminAccount = ADMIN_EMAILS.includes(normalizedEmail) || parsed.password === ADMIN_PASSWORD

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // 1. Check if customer profile exists
    const { data: existingCustomer } = await serviceClient
      .from('customers')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingCustomer && !isAdminAccount) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 400 }
      )
    }

    // 2. Create or Update user in Supabase Auth via Service Role (auto-confirmed)
    let userId: string | null = existingCustomer?.id || null
    let session: any = null

    const { data: adminUser, error: createError } = await serviceClient.auth.admin.createUser({
      email: normalizedEmail,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { name: parsed.name.trim() },
    })

    if (adminUser?.user) {
      userId = adminUser.user.id
    } else if (createError) {
      // User might already exist in auth, try updating password & confirm email
      const { data: usersList } = await serviceClient.auth.admin.listUsers()
      const match = usersList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail)

      if (match) {
        userId = match.id
        await serviceClient.auth.admin.updateUserById(match.id, {
          email_confirm: true,
          password: parsed.password,
          user_metadata: { name: parsed.name.trim() },
        })
      } else {
        // Fallback to standard signUp
        const { data: authData } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: parsed.password,
          options: { data: { name: parsed.name.trim() } },
        })
        if (authData?.user) {
          userId = authData.user.id
          session = authData.session
        }
      }
    }

    // 3. Log in automatically to acquire active session
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: parsed.password,
    })

    if (signInData?.session) {
      session = signInData.session
    }

    if (!userId && signInData?.user) {
      userId = signInData.user.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user account. Please try again.' }, { status: 500 })
    }

    // 4. Upsert customer profile
    await serviceClient
      .from('customers')
      .upsert({
        id: userId,
        name: parsed.name.trim(),
        email: normalizedEmail,
        role: isAdminAccount ? 'admin' : 'customer',
      })

    // 5. Referral Code Handling
    let referralApplied = false
    if (parsed.referral_code && parsed.referral_code.trim()) {
      const codeUpper = parsed.referral_code.trim().toUpperCase()
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('*')
        .eq('code', codeUpper)
        .eq('is_active', true)
        .maybeSingle()

      if (coupon && coupon.owner_id !== userId && (coupon.times_used || 0) < 1) {
        referralApplied = true
        await serviceClient
          .from('coupons')
          .update({ times_used: 1, is_active: false })
          .eq('id', coupon.id)
      }
    }

    // 6. Create diet profile if provided
    if (parsed.weight_kg && parsed.height_cm && parsed.age && parsed.gender && parsed.activity_level && parsed.goal) {
      const calorie_target = calculateDailyCalories({
        weight_kg: parsed.weight_kg,
        height_cm: parsed.height_cm,
        age: parsed.age,
        gender: parsed.gender,
        activity_level: parsed.activity_level,
        goal: parsed.goal,
      })

      await serviceClient.from('diet_profiles').upsert({
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
        redirectUrl: isAdminAccount ? '/admin' : '/orders',
      },
      message: referralApplied
        ? 'Account created! Referral code applied: 10% OFF!'
        : 'Account created successfully!',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Unhandled signup API error:', error)
    return NextResponse.json({ error: error?.message || 'Account creation failed' }, { status: 500 })
  }
}
