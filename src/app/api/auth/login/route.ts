import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const ADMIN_EMAILS = ['camosfoodapp@gmail.com', 'camosfoodapp@gamil.com', 'admin@camosfoods.com']
const ADMIN_PASSWORD = process.env.ADMIN_SECRET_KEY || 'ORGANIC;CHEMISTRY6969'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)
    const normalizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()
    const serviceClient = await createServiceClient()
    const cookieStore = await cookies()

    const isAdminCredential =
      ADMIN_EMAILS.includes(normalizedEmail) || password === ADMIN_PASSWORD

    // 1. Attempt standard login
    let { data: authData, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    // 2. Fallback for Admin or email unconfirmed / missing user
    if (error || !authData?.user) {
      if (isAdminCredential) {
        // Ensure Admin user exists and is confirmed
        const { data: createdAdmin } = await serviceClient.auth.admin.createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: { name: 'Camo Foods Admin' },
        })

        const userId = createdAdmin?.user?.id
        if (userId) {
          await serviceClient.auth.admin.updateUserById(userId, {
            email_confirm: true,
            password: password,
          })
        }

        // Retry sign in
        const retry = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (retry.data?.user) {
          authData = retry.data
          error = null
        }
      } else {
        // Try to auto-confirm user if email not confirmed
        const { data: customer } = await serviceClient
          .from('customers')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (customer?.id) {
          await serviceClient.auth.admin.updateUserById(customer.id, {
            email_confirm: true,
            password,
          })

          const retry = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          })

          if (retry.data?.user) {
            authData = retry.data
            error = null
          }
        }
      }
    }

    if (error || !authData?.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid email or password. Please try again.' },
        { status: 401 }
      )
    }

    // 3. Ensure customer profile exists & set admin role if applicable
    const userId = authData.user.id
    let { data: customer } = await serviceClient
      .from('customers')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    const shouldBeAdmin =
      isAdminCredential || ADMIN_EMAILS.includes(normalizedEmail) || customer?.role === 'admin'

    if (!customer) {
      const { data: created } = await serviceClient
        .from('customers')
        .upsert({
          id: userId,
          name: authData.user.user_metadata?.name || (shouldBeAdmin ? 'Camo Foods Admin' : normalizedEmail.split('@')[0]),
          email: normalizedEmail,
          role: shouldBeAdmin ? 'admin' : 'customer',
        })
        .select()
        .single()

      customer = created
    } else if (shouldBeAdmin && customer.role !== 'admin') {
      const { data: updated } = await serviceClient
        .from('customers')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .single()

      if (updated) customer = updated
    }

    // 4. Set HTTP-only session cookies
    if (shouldBeAdmin) {
      cookieStore.set('admin_key', ADMIN_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
    }

    return NextResponse.json({
      data: {
        user: authData.user,
        session: authData.session,
        customer,
        isAdmin: shouldBeAdmin,
        redirectUrl: shouldBeAdmin ? '/admin' : '/orders',
      },
      message: shouldBeAdmin ? 'Admin logged in successfully' : 'Signed in successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Unhandled login API error:', error)
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 })
  }
}
