'use client'

import { useEffect, useState } from 'react'
import { Tag, Copy, Check, RefreshCw, Eye, EyeOff, Trash2, Key, Sparkles, LogIn, UserCheck, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import AuthModal from '@/components/ui/AuthModal'

interface CouponItem {
  id?: string
  code: string
  friend_discount_percent: number
  owner_reward_amount: number
  times_used: number
  max_uses: number
  is_active: boolean
  used_for?: string | null
  created_at?: string
}

export default function CouponsPage() {
  const [codesList, setCodesList] = useState<CouponItem[]>([])
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState<string | null>(null)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [accountCredit, setAccountCredit] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data?.data?.customer) {
          setUser(data.data.customer)
          setAccountCredit(Number(data.data.customer.account_credit || 0))
          return data.data.customer
        }
      }
      setUser(null)
      setAccountCredit(0)
      return null
    } catch {
      setUser(null)
      setAccountCredit(0)
      return null
    } finally {
      setAuthChecked(true)
    }
  }

  const loadCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/coupons/mine').then((r) => r.json())
      if (res?.data && Array.isArray(res.data)) {
        setCodesList(res.data)
      } else {
        setCodesList([])
      }
      if (res?.account_credit !== undefined) {
        setAccountCredit(Number(res.account_credit))
      }
    } catch (e) {
      console.error('Failed to load coupons:', e)
      setCodesList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth().then((authedUser) => {
      if (authedUser) {
        loadCodes()
      } else {
        setLoading(false)
      }
    })
  }, [])

  const copyToClipboard = (rawCode: string) => {
    navigator.clipboard.writeText(rawCode)
    setCopiedCode(rawCode)
    toast.success(`Referral code ${rawCode} copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const generateCoupon = async () => {
    if (!user) {
      toast.error('Please log in or create an account to generate a referral code.')
      setAuthModalOpen(true)
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/coupons', { method: 'POST' })
      const data = await res.json()

      if (res.status === 401) {
        toast.error(data.error || 'Please log in or register to generate a referral key.')
        setUser(null)
        setAuthModalOpen(true)
        return
      }

      if (data?.data?.code) {
        const newCoupon: CouponItem = data.data
        setNewlyGeneratedCode(newCoupon.code)

        const updated = [newCoupon, ...codesList.filter((c) => c.code !== newCoupon.code)]
        setCodesList(updated)

        navigator.clipboard.writeText(newCoupon.code)
        toast.success(`Generated & Copied Key: ${newCoupon.code}`)
      } else if (data?.error) {
        toast.error(data.error)
      }
    } catch (e) {
      toast.error('Failed to generate coupon. Please check connection.')
    } finally {
      setGenerating(false)
    }
  }

  const deleteCoupon = async (item: CouponItem) => {
    if (!user) {
      toast.error('Please log in to manage your referral keys.')
      setAuthModalOpen(true)
      return
    }

    if (!confirm(`Are you sure you want to delete referral key "${item.code}"?`)) return
    try {
      const res = await fetch(`/api/coupons?${item.id ? `id=${item.id}` : `code=${item.code}`}`, {
        method: 'DELETE',
      }).then((r) => r.json())

      if (res?.message) {
        toast.success(`Deleted key ${item.code}`)
        setCodesList((prev) => prev.filter((c) => c.code !== item.code && c.id !== item.id))
      } else {
        toast.error(res?.error || 'Failed to delete key')
      }
    } catch (e) {
      toast.error('Error deleting coupon code')
    }
  }

  const toggleReveal = (key: string) => {
    setRevealedIds((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-[#FFFFEF] text-[#C7230F] pt-28 pb-16 px-4 sm:px-6 font-sans">
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={async () => {
          const authedUser = await checkAuth()
          if (authedUser) {
            loadCodes()
            toast.success('Signed in successfully! You can now generate your code.')
          }
        }}
      />

      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C7230F]/10 text-[#C7230F] font-black text-xs px-4 py-2 rounded-full uppercase tracking-wider mb-3 border border-[#C7230F]/20">
            <Sparkles size={14} />
            <span>DUAL REWARDS REFERRAL PROGRAM</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#C7230F] mb-3">
            Referral & Discount Keys
          </h1>
          <p className="text-xs sm:text-sm text-[#C7230F]/80 font-medium leading-relaxed">
            Generate unique promo codes to share with friends. When your friends redeem your key, they get <strong className="text-[#C7230F] font-extrabold">10% OFF</strong> and you earn <strong className="text-[#C7230F] font-extrabold">20% REWARD POINTS</strong>!
          </p>
        </div>

        {/* Reward Points & Balance Dashboard Card */}
        {user && (
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: '#C7230F' }}
            className="rounded-[2.5rem] border-2 p-6 sm:p-8 mb-10 shadow-md text-left max-w-3xl mx-auto overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#C7230F]/20">
              <div>
                <div className="flex items-center gap-2 text-[#C7230F] font-black text-xs uppercase tracking-wider mb-2">
                  <Sparkles size={16} />
                  <span>Your Camo Reward Balance</span>
                </div>
                <div className="font-serif font-black text-4xl sm:text-5xl text-[#C7230F]">
                  PKR {accountCredit}
                </div>
                <p className="text-xs font-bold text-[#C7230F]/70 mt-1">
                  Earned from friend referral orders • Spend instantly at checkout for cash discounts!
                </p>
              </div>

              <a
                href="/menu"
                style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg hover:bg-[#A31C0C] transition-all no-underline shrink-0"
              >
                <ShoppingBag size={15} style={{ color: '#FFFFEF' }} />
                <span style={{ color: '#FFFFEF' }}>Order Food & Use Points</span>
              </a>
            </div>

            {/* 3 Steps Explainer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="bg-[#FFFFEF] p-4 rounded-2xl border border-[#C7230F]/20">
                <span className="w-6 h-6 rounded-full bg-[#C7230F] text-[#FFFFEF] text-xs font-black flex items-center justify-center mb-2">
                  1
                </span>
                <div className="font-black text-xs text-[#C7230F] mb-1">Share Your Key</div>
                <p className="text-[11px] font-bold text-[#C7230F]/70 leading-normal">
                  Generate your personal referral code below and share it with your friends.
                </p>
              </div>

              <div className="bg-[#FFFFEF] p-4 rounded-2xl border border-[#C7230F]/20">
                <span className="w-6 h-6 rounded-full bg-[#C7230F] text-[#FFFFEF] text-xs font-black flex items-center justify-center mb-2">
                  2
                </span>
                <div className="font-black text-xs text-[#C7230F] mb-1">Friend Gets 10% OFF</div>
                <p className="text-[11px] font-bold text-[#C7230F]/70 leading-normal">
                  Friend applies your code at checkout and receives 10% instant discount.
                </p>
              </div>

              <div className="bg-[#FFFFEF] p-4 rounded-2xl border border-[#C7230F]/20">
                <span className="w-6 h-6 rounded-full bg-[#C7230F] text-[#FFFFEF] text-xs font-black flex items-center justify-center mb-2">
                  3
                </span>
                <div className="font-black text-xs text-[#C7230F] mb-1">You Earn 20% Reward</div>
                <p className="text-[11px] font-bold text-[#C7230F]/70 leading-normal">
                  20% of their order total is credited directly to your Camo Reward Balance!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Action Card */}
        <div
          style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199, 35, 15, 0.25)', color: '#C7230F' }}
          className="rounded-[2.5rem] border-2 p-6 sm:p-10 mb-12 shadow-sm text-center max-w-xl mx-auto"
        >
          <div
            style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md"
          >
            <Key size={30} style={{ color: '#FFFFEF' }} />
          </div>

          <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-xl sm:text-2xl mb-2">
            Generate Your Unique Key
          </h2>
          <p style={{ color: '#C7230F' }} className="text-xs sm:text-sm mb-6 font-bold opacity-80">
            Each key is linked to your account to track redemptions and automatically credit your 20% rewards.
          </p>

          {!authChecked ? (
            <div className="h-12 w-48 mx-auto bg-[#C7230F]/10 rounded-full animate-pulse" />
          ) : !user ? (
            <div className="bg-[#FFFFEF] border-2 border-[#C7230F]/20 rounded-2xl p-6 text-center shadow-xs">
              <p className="text-xs sm:text-sm font-bold text-[#C7230F] mb-4 leading-relaxed">
                You must have an account and be logged in to generate referral keys. This allows us to track your code and reward your account whenever your friends order!
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full shadow-lg hover:bg-[#A31C0C] transition-all transform hover:scale-105 border-none cursor-pointer uppercase tracking-wider font-black text-xs sm:text-sm"
              >
                <LogIn size={16} style={{ color: '#FFFFEF' }} />
                <span>Sign In / Create Account to Generate</span>
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-[#C7230F]/10 text-[#C7230F] px-4 py-1.5 rounded-full text-xs font-black mb-5 border border-[#C7230F]/20">
                <UserCheck size={14} />
                <span>Account: {user.name || user.email}</span>
              </div>

              <div>
                <button
                  onClick={generateCoupon}
                  disabled={generating}
                  style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full shadow-lg hover:bg-[#A31C0C] transition-all transform hover:scale-105 border-none cursor-pointer uppercase tracking-wider disabled:opacity-50 font-black text-sm"
                >
                  <RefreshCw size={16} style={{ color: '#FFFFEF' }} className={generating ? 'animate-spin' : ''} />
                  <span style={{ color: '#FFFFEF', fontWeight: 900 }}>
                    {generating ? 'Generating Code...' : 'Generate New Referral Key'}
                  </span>
                </button>
              </div>

              {newlyGeneratedCode && (
                <div
                  style={{ backgroundColor: '#FFFFEF', borderColor: '#C7230F' }}
                  className="mt-6 p-4 border-2 rounded-2xl flex items-center justify-between gap-3 animate-fade-in"
                >
                  <div className="text-left">
                    <span style={{ color: '#C7230F' }} className="block text-[10px] font-black uppercase tracking-wider">
                      New Key Ready
                    </span>
                    <span style={{ color: '#C7230F' }} className="font-mono font-black text-lg tracking-wider">
                      {newlyGeneratedCode}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newlyGeneratedCode)}
                    style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                    className="font-black text-xs px-4 py-2 rounded-xl border-none cursor-pointer flex items-center gap-1.5 shadow-xs hover:bg-[#A31C0C]"
                  >
                    {copiedCode === newlyGeneratedCode ? <Check size={14} style={{ color: '#FFFFEF' }} /> : <Copy size={14} style={{ color: '#FFFFEF' }} />}
                    <span style={{ color: '#FFFFEF', fontWeight: 900 }}>
                      {copiedCode === newlyGeneratedCode ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Saved Keys List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#C7230F]/20">
            <h3 style={{ color: '#C7230F' }} className="font-serif font-black text-xl flex items-center gap-2">
              <Tag size={20} style={{ color: '#C7230F' }} />
              <span>Your Active Keys</span>
            </h3>
            {user && (
              <span style={{ color: '#C7230F' }} className="text-xs font-black opacity-80">
                {codesList.length} Key{codesList.length !== 1 ? 's' : ''} Generated
              </span>
            )}
          </div>

          {!authChecked || loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-white rounded-2xl animate-pulse border border-[#C7230F]/10" />
              ))}
            </div>
          ) : !user ? (
            <div
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199, 35, 15, 0.25)', color: '#C7230F' }}
              className="rounded-2xl p-8 border-2 text-center shadow-xs"
            >
              <Key size={32} className="mx-auto mb-3 opacity-60 text-[#C7230F]" />
              <h4 className="font-serif font-black text-lg text-[#C7230F] mb-1">
                Track Your Personal Referral Keys
              </h4>
              <p className="text-xs sm:text-sm font-medium text-[#C7230F]/80 max-w-md mx-auto mb-5">
                Sign in to view all your active promo codes, track redemptions, and view your earned rewards balance.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#A31C0C] border-none cursor-pointer shadow-sm transition-all"
              >
                <LogIn size={14} style={{ color: '#FFFFEF' }} />
                <span>Log In to View Keys</span>
              </button>
            </div>
          ) : codesList.length === 0 ? (
            <div
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199, 35, 15, 0.2)', color: '#C7230F' }}
              className="rounded-2xl p-8 border text-center font-bold text-xs sm:text-sm"
            >
              You haven't generated any referral keys yet. Click the button above to create your first code!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {codesList.map((c, idx) => {
                const itemKey = c.id || c.code || `key-${idx}`
                const isRevealed = !!revealedIds[itemKey]
                const isRedeemed = c.times_used >= 1 || !c.is_active

                return (
                  <div
                    key={itemKey}
                    style={{ backgroundColor: '#FFFFFF', borderColor: isRedeemed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(199, 35, 15, 0.25)' }}
                    className="rounded-2xl p-5 border-2 flex flex-col justify-between shadow-xs hover:border-[#C7230F] transition-all gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: 'rgba(199, 35, 15, 0.12)', color: '#C7230F' }}
                          className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider"
                        >
                          10% OFF FRIEND
                        </span>
                        <span
                          style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                          className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider"
                        >
                          20% REWARD
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReveal(itemKey)}
                          style={{ color: '#C7230F' }}
                          className="hover:opacity-80 bg-transparent border-none cursor-pointer p-1"
                          title={isRevealed ? 'Mask Key' : 'Reveal Key'}
                        >
                          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => deleteCoupon(c)}
                          className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg border border-red-200 cursor-pointer transition-colors"
                          title="Delete Referral Key"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: '#FFFFEF', borderColor: 'rgba(199, 35, 15, 0.2)' }}
                      className="flex items-center justify-between p-3 rounded-xl border"
                    >
                      <span style={{ color: '#C7230F' }} className="font-mono font-black text-base tracking-wider">
                        {isRevealed ? c.code : `${c.code.slice(0, 4)}••••${c.code.slice(-2)}`}
                      </span>

                      <button
                        onClick={() => copyToClipboard(c.code)}
                        style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                        className="font-black text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1 hover:bg-[#A31C0C]"
                      >
                        {copiedCode === c.code ? <Check size={13} style={{ color: '#FFFFEF' }} /> : <Copy size={13} style={{ color: '#FFFFEF' }} />}
                        <span style={{ color: '#FFFFEF', fontWeight: 900 }}>
                          {copiedCode === c.code ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                      <span style={{ color: '#C7230F' }}>
                        Redemptions: <strong style={{ color: '#C7230F', fontWeight: 900 }}>{c.times_used || 0} / 1</strong>
                      </span>
                      <div>
                        {isRedeemed ? (
                          <span className="text-emerald-800 font-black bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Check size={12} />
                            REDEEMED • 20% CREDITED
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            ACTIVE • READY TO SHARE
                          </span>
                        )}
                      </div>
                    </div>

                    {isRedeemed ? (
                      <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        ✓ Friend placed an order using this code! Your 20% reward credit has been added to your Reward Balance above.
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-[#C7230F]/70 bg-[#FFFFEF] p-2.5 rounded-xl border border-[#C7230F]/15">
                        Share this key with a friend. Once they complete an order, you will earn 20% of their order total in Reward Points!
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
