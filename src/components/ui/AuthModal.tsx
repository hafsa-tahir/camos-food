'use client'

import { useState } from 'react'
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({ open, onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')

        if (data.data?.redirectUrl === '/admin' || data.data?.isAdmin || data.data?.customer?.role === 'admin') {
          toast.success('Welcome Admin! Access granted.')
          onClose()
          window.location.href = '/admin'
          return
        }

        toast.success('Signed in successfully!')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, referral_code: referralCode }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Signup failed')

        toast.success('Account created successfully!')
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#C7230F]">
      <div className="bg-[#FFFFEF] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative border-2 border-[#C7230F]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-[#C7230F]/20 flex items-center justify-center cursor-pointer text-[#C7230F]"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-black text-2xl text-[#C7230F] mb-1">
            {tab === 'login' ? 'Sign In to Order' : 'Create an Account'}
          </h2>
          <p className="text-xs font-bold text-[#C7230F]/70">
            {tab === 'login'
              ? 'Enter your credentials to continue checkout'
              : 'Join Camo’s Foods for exclusive deals'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white rounded-full p-1 mb-6 border border-[#C7230F]/20">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-full border-none font-black text-xs cursor-pointer transition-all ${
              tab === 'login'
                ? 'bg-[#C7230F] text-[#FFFFEF]'
                : 'bg-transparent text-[#C7230F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-full border-none font-black text-xs cursor-pointer transition-all ${
              tab === 'signup'
                ? 'bg-[#C7230F] text-[#FFFFEF]'
                : 'bg-transparent text-[#C7230F]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7230F]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#C7230F]/20 bg-white text-xs font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7230F]" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CAMO-89F3A1"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#C7230F]/20 bg-white text-xs font-mono font-black text-[#C7230F] outline-none focus:border-[#C7230F]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7230F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#C7230F]/20 bg-white text-xs font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C7230F]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#C7230F]/20 bg-white text-xs font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs py-3.5 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            {loading ? (
              'Processing...'
            ) : tab === 'login' ? (
              <>
                <LogIn size={16} /> Sign In
              </>
            ) : (
                <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
