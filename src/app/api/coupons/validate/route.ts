import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // 1. Get logged-in user if any (via request cookies)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const rawCode = body.code || ''
    const subtotal = body.subtotal || 0

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 })
    }

    const cleanCode = rawCode.trim().toUpperCase()

    // 2. Query Supabase coupons table using Pure Service Role Client (bypasses RLS)
    const { data: coupon, error } = await serviceClient
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle()

    if (error || !coupon) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" is invalid or does not exist.` },
        { status: 404 }
      )
    }

    // 3. Check if ALREADY REDEEMED / EXPIRED / INACTIVE
    if (!coupon.is_active || (coupon.times_used || 0) >= (coupon.max_uses || 1)) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" has already been redeemed and is expired.` },
        { status: 400 }
      )
    }

    // 4. Prevent self-referral ONLY if the logged-in user is the code owner
    if (user && coupon.owner_id && coupon.owner_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code. Share it with a friend!' },
        { status: 400 }
      )
    }

    // 5. Calculate discount
    const discountPercent = (coupon.friend_discount_percent && coupon.friend_discount_percent > 0)
      ? coupon.friend_discount_percent
      : 10
    const discountAmount = Math.round((subtotal * discountPercent) / 100)

    return NextResponse.json({
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        owner_reward_percent: coupon.owner_reward_amount || 20,
        used_for: 'order',
      },
      message: `Referral code ${coupon.code} applied! Saved 10% (PKR ${discountAmount})!`,
    })
  } catch (err: any) {
    console.error('Coupon validation error:', err)
    return NextResponse.json(
      { error: 'Server error validating coupon code' },
      { status: 500 }
    )
  }
}
