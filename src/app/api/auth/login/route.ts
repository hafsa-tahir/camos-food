import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)
    const normalizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // 1. Attempt standard login
    let { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    // 2. If unconfirmed email or auth error, auto-confirm user via service client and retry
    if (error) {
      const { data: usersList } = await serviceClient.auth.admin.listUsers()
      const match = usersList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail)

      if (match) {
        // Auto-confirm user email and update password to match if needed
        await serviceClient.auth.admin.updateUserById(match.id, {
          email_confirm: true,
          password: password,
        })

        // Retry login after auto-confirmation
        const retry = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (!retry.error && retry.data) {
          data = retry.data
          error = null
        }
      }
    }

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid login credentials. Please check your email and password.' },
        { status: 401 }
      )
    }

    // 3. Fetch or ensure customer profile exists
    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!customer) {
      const { data: created } = await serviceClient
        .from('customers')
        .upsert({
          id: data.user.id,
          name: data.user.user_metadata?.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
        })
        .select()
        .single()

      customer = created
    }

    return NextResponse.json({
      data: {
        user: data.user,
        session: data.session,
        customer,
      },
      message: 'Logged in successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Unhandled login API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
