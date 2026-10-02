import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-08-26.dahlia' })

const orderSchema = z.object({
  items: z.array(z.object({
    food_item_id: z.string().min(1),
    quantity: z.number().int().positive(),
  })),
  coupon_code: z.string().optional(),
  deal_id: z.string().min(1).optional(),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
})

function calcDiscount(subtotal: number, type: 'percentage' | 'flat', value: number, max?: number | null): number {
  let d = type === 'percentage' ? (subtotal * value) / 100 : value
  if (max) d = Math.min(d, max)
  return Math.min(d, subtotal)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = orderSchema.parse(body)

    // Fetch food items (supports both DB UUIDs and string IDs like camos-chicken-pulao)
    const { REAL_MENU_ITEMS } = await import('@/lib/menuData')
    const itemIds = parsed.items.map((i) => i.food_item_id)

    let dbFoodItems: any[] = []
    const validUuids = itemIds.filter((id) => /^[0-9a-fA-F-]{36}$/.test(id))

    if (validUuids.length > 0) {
      try {
        const { data } = await supabase
          .from('food_items')
          .select('*')
          .in('id', validUuids)
        if (data) dbFoodItems = data
      } catch (e) {
        // Continue to fallback
      }
    }

    const foodItems: any[] = itemIds
      .map((id) => {
        const dbMatch = dbFoodItems.find((f) => f.id === id)
        if (dbMatch) return dbMatch

        const realMatch = REAL_MENU_ITEMS.find((f) => f.id === id || f.name.toLowerCase() === id.toLowerCase())
        if (realMatch) return realMatch

        // Weekly Subscription Packages are ALWAYS AVAILABLE
        if (id.startsWith('sub_') || id.startsWith('subscription') || id.includes('weekly') || id.includes('package') || id.includes('diet') || id.includes('desi')) {
          let packageTitle = 'Weekly Subscription Package'
          let packagePrice = 3750

          if (id.includes('diet_5')) { packageTitle = '5-Day Diet Plan'; packagePrice = 3550; }
          else if (id.includes('diet_7')) { packageTitle = '7-Day Diet Plan'; packagePrice = 5250; }
          else if (id.includes('desi_5')) { packageTitle = '5-Day Desi Plan'; packagePrice = 2800; }
          else if (id.includes('desi_7_beef')) { packageTitle = 'Desi 7-Day Package (Beef Qeema)'; packagePrice = 3900; }
          else if (id.includes('desi_7_chicken')) { packageTitle = 'Desi 7-Day Package (Chicken Qeema)'; packagePrice = 3750; }
          else if (id.includes('chinese_7')) { packageTitle = 'Chinese 7-Day Package'; packagePrice = 4200; }
          else if (id.includes('fast_food_7')) { packageTitle = 'Fast Food 7-Day Package'; packagePrice = 4500; }
          else if (id.includes('weight_loss_7')) { packageTitle = 'Weight Loss 7-Day Package'; packagePrice = 3950; }

          return {
            id,
            name: packageTitle,
            price: packagePrice,
            calories: 550,
            category: 'subscription',
            status: 'active',
          }
        }

        return null
      })
      .filter(Boolean)

    if (foodItems.length !== itemIds.length) {
      return NextResponse.json({ error: 'Some items are unavailable' }, { status: 400 })
    }

    // Calculate subtotal
    const subtotal = parsed.items.reduce((sum, cartItem) => {
      const food = foodItems.find((f) => f.id === cartItem.food_item_id)!
      return sum + food.price * cartItem.quantity
    }, 0)

    let discountAmount = 0
    let couponId: string | null = null
    let dealId: string | null = null

    const serviceClient = await createServiceClient()

    // Apply coupon discount
    if (parsed.coupon_code) {
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('*')
        .eq('code', parsed.coupon_code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle()

      if (coupon && coupon.owner_id !== user.id && (coupon.times_used || 0) < 1) {
        const discountPercent = (coupon.friend_discount_percent && coupon.friend_discount_percent > 0) ? coupon.friend_discount_percent : 10
        discountAmount += calcDiscount(subtotal, 'percentage', discountPercent)
        couponId = coupon.id

        // Immediately expire single-use coupon in database upon redemption
        await serviceClient
          .from('coupons')
          .update({
            times_used: 1,
            is_active: false,
          })
          .eq('id', coupon.id)
      }
    }

    // Apply deal discount
    if (parsed.deal_id) {
      const { data: deal } = await supabase
        .from('deals')
        .select('*')
        .eq('id', parsed.deal_id)
        .eq('is_active', true)
        .single()

      if (deal && subtotal >= (deal.min_order_amount || 0)) {
        discountAmount += calcDiscount(subtotal, deal.discount_type, deal.discount_value, deal.max_discount_amount)
        dealId = deal.id
      }
    }

    discountAmount = Math.min(discountAmount, subtotal)
    const total = subtotal - discountAmount

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        coupon_id: couponId,
        deal_id: dealId,
        subtotal,
        discount_amount: discountAmount,
        total,
        status: 'pending',
        delivery_address: parsed.delivery_address,
        notes: parsed.notes,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Fetch all DB food items so non-UUID food_item_ids map cleanly to a DB food_items UUID
    const { data: allDbFoodItems } = await serviceClient.from('food_items').select('*')

    // Insert order items
    const orderItems = parsed.items.map((cartItem) => {
      const food = foodItems.find((f) => f.id === cartItem.food_item_id)!
      let targetFoodItemId = cartItem.food_item_id

      if (!/^[0-9a-fA-F-]{36}$/.test(targetFoodItemId)) {
        const dbMatch = allDbFoodItems?.find((f) => f.name.toLowerCase() === food.name.toLowerCase())
        if (dbMatch) {
          targetFoodItemId = dbMatch.id
        } else if (allDbFoodItems && allDbFoodItems.length > 0) {
          targetFoodItemId = allDbFoodItems[0].id
        }
      }

      return {
        order_id: order.id,
        food_item_id: targetFoodItemId,
        quantity: cartItem.quantity,
        price_at_order: food.price,
        name_at_order: food.name,
        calories_at_order: food.calories,
      }
    })

    await serviceClient.from('order_items').insert(orderItems)

    // Check if any item is a weekly subscription and register into weekly_subscriptions
    const subscriptionItems = foodItems.filter(
      (f) => f.category === 'subscription' || f.name.includes('Weekly') || f.name.includes('Package')
    )
    if (subscriptionItems.length > 0) {
      const { data: custData } = await supabase.from('customers').select('*').eq('id', user.id).single()
      for (const subItem of subscriptionItems) {
        try {
          await serviceClient.from('weekly_subscriptions').insert({
            user_name: custData?.name || user.email?.split('@')[0] || 'Customer',
            phone: custData?.phone || '0328 5286882',
            email: custData?.email || user.email,
            package_plan: subItem.name,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            notes: `Subscribed via Order #${order.id.slice(0, 8)} (${parsed.notes || 'No extra notes'})`,
          })
        } catch (subErr) {
          console.warn('Subscription table insert note:', subErr)
        }
      }
    }

    // Get customer email
    const { data: customer } = await supabase
      .from('customers')
      .select('email, name')
      .eq('id', user.id)
      .single()

    let checkoutUrl: string | null = null

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      try {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = parsed.items.map((cartItem) => {
          const food = foodItems.find((f) => f.id === cartItem.food_item_id)!
          return {
            price_data: {
              currency: 'pkr',
              product_data: {
                name: food.name,
                ...(food.description ? { description: food.description } : {}),
              },
              unit_amount: Math.round(food.price * 100),
            },
            quantity: cartItem.quantity,
          }
        })

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          customer_email: customer?.email,
          metadata: { order_id: order.id, user_id: user.id, coupon_id: couponId || '' },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        }

        if (discountAmount > 0) {
          const stripeCoupon = await stripe.coupons.create({
            amount_off: Math.round(discountAmount * 100),
            currency: 'pkr',
            name: 'FoodApp Discount',
          })
          sessionParams.discounts = [{ coupon: stripeCoupon.id }]
        }

        const session = await stripe.checkout.sessions.create(sessionParams)
        checkoutUrl = session.url

        await supabase
          .from('orders')
          .update({ stripe_session_id: session.id })
          .eq('id', order.id)
      } catch (stripeErr) {
        console.warn('Stripe session creation bypassed/failed:', stripeErr)
      }
    }

    return NextResponse.json({
      data: {
        order_id: order.id,
        checkout_url: checkoutUrl,
        subtotal,
        discount_amount: discountAmount,
        total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = await createServiceClient()

  let customerIds: string[] = [user.id]
  if (user.email) {
    const { data: matchedCust } = await serviceClient
      .from('customers')
      .select('id')
      .eq('email', user.email)
    if (matchedCust && matchedCust.length > 0) {
      customerIds = Array.from(new Set([...customerIds, ...matchedCust.map((c) => c.id)]))
    }
  }

  const { data, error } = await serviceClient
    .from('orders')
    .select('*, order_items(*, food_items(name, image_url))')
    .in('customer_id', customerIds)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
