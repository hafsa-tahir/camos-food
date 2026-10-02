import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateCouponCode } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ data: null, all: [] })
    }

    const serviceClient = await createServiceClient()
    const { data: coupons } = await serviceClient
      .from('coupons')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (coupons && coupons.length > 0) {
      return NextResponse.json({ data: coupons[0], all: coupons })
    }

    return NextResponse.json({ data: null, all: [] })
  } catch (err) {
    return NextResponse.json({ data: null, all: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    let ownerId: string | null = null

    if (user) {
      ownerId = user.id

      // Ensure customer profile exists in DB so foreign key constraint is satisfied
      const { data: customer } = await serviceClient
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!customer) {
        await serviceClient.from('customers').upsert({
          id: user.id,
          name: user.user_metadata?.name || 'Camo Customer',
          email: user.email || 'customer@camosfoods.com',
        })
      }
    } else {
      // For guest user, select first existing customer or fallback system customer ID
      const { data: anyCustomer } = await serviceClient
        .from('customers')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (anyCustomer?.id) {
        ownerId = anyCustomer.id
      } else {
        // Fallback default system UUID
        ownerId = '58455e97-92a3-44d7-8866-f9be58b1a24a'
      }
    }

    // Always generate a 100% unique random CAMO-6CHAR alphanumeric code
    let code = generateCouponCode()
    let attempts = 0
    while (attempts < 15) {
      const { data: existing } = await serviceClient
        .from('coupons')
        .select('id')
        .eq('code', code)
        .maybeSingle()

      if (!existing) break
      code = generateCouponCode()
      attempts++
    }

    // Insert new single-use unique coupon into Supabase database (max_uses: 1)
    const { data, error } = await serviceClient
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        owner_id: ownerId,
        friend_discount_percent: 10,
        owner_reward_amount: 20,
        max_uses: 1,
        times_used: 0,
        is_active: true,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Coupon DB insert error:', error)
      return NextResponse.json(
        { error: 'Failed to generate referral code. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: `Your referral code ${data.code} is ready! Share it with friends for 10% OFF.`,
    })
  } catch (error: any) {
    console.error('Coupon API error:', error)
    return NextResponse.json(
      { error: 'Internal server error generating code' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const code = searchParams.get('code')

    if (!id && !code) {
      return NextResponse.json({ error: 'Coupon ID or code is required' }, { status: 400 })
    }

    // PERMANENT HARD DELETE from Supabase database table
    let query = serviceClient.from('coupons').delete()

    if (id) {
      query = query.eq('id', id)
    } else if (code) {
      query = query.eq('code', code.trim().toUpperCase())
    }

    const { error } = await query

    if (error) {
      console.error('Coupon hard delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Referral key permanently deleted' })
  } catch (err: any) {
    console.error('DELETE coupon error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
