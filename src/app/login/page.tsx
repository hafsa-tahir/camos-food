'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Invalid login credentials. Please check your email and password.')
      } else {
        if (data.data?.redirectUrl === '/admin' || data.data?.isAdmin || data.data?.customer?.role === 'admin') {
          toast.success('Welcome Admin! Access granted.')
          window.location.href = '/admin'
        } else {
          toast.success('Welcome back! Signed in successfully.')
          router.push('/orders')
          router.refresh()
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Please check your credentials.')
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
          <h1 className="text-3xl font-black text-[#C7230F] mb-2">Welcome Back</h1>
          <p className="text-sm font-bold text-[#C7230F]/70">Sign in to your Camo's Foods account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-[#C7230F]/20 shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-4 pr-12 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#C7230F]"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-sm py-4 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs font-bold text-[#C7230F]/70">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#C7230F] font-black no-underline hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
