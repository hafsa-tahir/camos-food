'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', referral_code: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          referral_code: form.referral_code.trim() || undefined,
        }),
      })

      const res = await response.json()

      if (!response.ok || res.error) {
        toast.error(res.error || 'Signup failed. Please try again.')
      } else {
        toast.success(res.message || 'Account created successfully!')
        if (res.data?.redirectUrl === '/admin') {
          window.location.href = '/admin'
        } else {
          router.push('/orders')
          router.refresh()
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <img src="/camos-logo-nobg.png" alt="Camo's Foods" className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-3xl font-black text-[#C7230F] mb-2">Create Account</h1>
          <p className="text-sm font-bold text-[#C7230F]/70">Join Camo's Foods for exclusive perks & rewards</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-[#C7230F]/20 shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Ahmed Khan"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Referral Code (Optional — Get 10% OFF)
              </label>
              <input
                type="text"
                value={form.referral_code}
                onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toUpperCase() }))}
                placeholder="e.g. CAMO-89F3A1"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-mono font-black text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-sm py-4 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider disabled:opacity-50 mt-2"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs font-bold text-[#C7230F]/70">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C7230F] font-black no-underline hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
