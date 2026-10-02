'use client'

import { useEffect, useState } from 'react'
import { Tag, Copy, Check, RefreshCw, Eye, EyeOff, Trash2, Key, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

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

  const loadCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/coupons/mine').then((r) => r.json())
      if (res?.data && Array.isArray(res.data)) {
        setCodesList(res.data)
      }
    } catch (e) {
      console.error('Failed to load coupons:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCodes()
  }, [])

  const copyToClipboard = (rawCode: string) => {
    navigator.clipboard.writeText(rawCode)
    setCopiedCode(rawCode)
    toast.success(`Referral code ${rawCode} copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const generateCoupon = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/coupons', { method: 'POST' }).then((r) => r.json())
      if (res?.data?.code) {
        const newCoupon: CouponItem = res.data
        setNewlyGeneratedCode(newCoupon.code)

        const updated = [newCoupon, ...codesList.filter((c) => c.code !== newCoupon.code)]
        setCodesList(updated)

        navigator.clipboard.writeText(newCoupon.code)
        toast.success(`Generated & Copied Key: ${newCoupon.code}`)
      } else if (res?.error) {
        toast.error(res.error)
      }
    } catch (e) {
      toast.error('Failed to generate coupon. Please check connection.')
    } finally {
      setGenerating(false)
    }
  }

  const deleteCoupon = async (item: CouponItem) => {
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
            Generate unique promo codes to share with friends. When your friends redeem your key, they get <strong className="text-[#C7230F] font-extrabold">10% OFF</strong> and you earn <strong className="text-[#C7230F] font-extrabold">20% OFF</strong>!
          </p>
        </div>

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
            Each key is saved directly to our database and works across all customer accounts.
          </p>

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
        </div>

        {/* Saved Keys List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#C7230F]/20">
            <h3 style={{ color: '#C7230F' }} className="font-serif font-black text-xl flex items-center gap-2">
              <Tag size={20} style={{ color: '#C7230F' }} />
              <span>Your Active Keys</span>
            </h3>
            <span style={{ color: '#C7230F' }} className="text-xs font-black opacity-80">
              {codesList.length} Key{codesList.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-white rounded-2xl animate-pulse border border-[#C7230F]/10" />
              ))}
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

                return (
                  <div
                    key={itemKey}
                    style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199, 35, 15, 0.25)' }}
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
                        Redemptions: <strong style={{ color: '#C7230F', fontWeight: 900 }}>{c.times_used || 0} / 1 (Single Use)</strong>
                      </span>
                      <div>
                        {c.times_used >= 1 || !c.is_active ? (
                          <span className="text-red-700 font-black bg-red-100 border border-red-200 px-2.5 py-1 rounded-md">
                            EXPIRED (REDEEMED)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
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
