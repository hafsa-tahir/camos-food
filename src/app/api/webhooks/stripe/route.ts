import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-08-26.dahlia' })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id
    const couponId = session.metadata?.coupon_id

    if (!orderId) return NextResponse.json({ received: true })

    // Update order to paid
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', orderId)

    // Increment coupon usage + credit referrer
    if (couponId) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .single()

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ times_used: coupon.times_used + 1 })
          .eq('id', couponId)

        // Credit referrer's account
        await supabase.rpc('increment_credit', {
          customer_id: coupon.owner_id,
          amount: coupon.owner_reward_amount,
        })
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id
    if (orderId) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('status', 'pending')
    }
  }

  return NextResponse.json({ received: true })
}
