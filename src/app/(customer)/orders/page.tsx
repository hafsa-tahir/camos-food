'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, User, Scale, Flame, Activity, TrendingDown, Target, Save, LogOut } from 'lucide-react'
import { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: '#C7230F', bg: '#FFFFEF', label: 'Pending' },
  paid: { icon: CheckCircle, color: '#C7230F', bg: '#FFFFEF', label: 'Paid' },
  preparing: { icon: Package, color: '#C7230F', bg: '#FFFFEF', label: 'Preparing' },
  delivered: { icon: CheckCircle, color: '#C7230F', bg: '#FFFFEF', label: 'Delivered' },
  cancelled: { icon: XCircle, color: '#C7230F', bg: '#FFFFEF', label: 'Cancelled' },
}

const GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, desc: '-500 kcal/day' },
  { value: 'maintain', label: 'Maintain Weight', icon: Activity, desc: 'Balanced calories' },
  { value: 'gain_weight', label: 'Gain Weight', icon: Target, desc: '+300 kcal/day' },
]

const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: 'light', label: 'Light', desc: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { value: 'active', label: 'Active', desc: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Physical job / training' },
]

export default function AccountOrdersPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Body Metrics Form
  const [metrics, setMetrics] = useState({
    weight: '70',
    height: '175',
    age: '25',
    gender: 'male',
    goal: 'maintain',
    activity: 'moderate',
  })
  const [savingMetrics, setSavingMetrics] = useState(false)

  // Load User Profile & Orders
  useEffect(() => {
    // Load local metrics if saved
    const savedMetrics = localStorage.getItem('camos_customer_body_metrics')
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics))
      } catch (e) {}
    }

    fetch('/api/profile')
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.customer) {
          setUser(res.data.customer)
        }
      })
      .catch(() => {})

    fetch('/api/orders')
      .then((r) => r.json())
      .then(({ data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [])

  // Calculate Daily Target
  const w = parseFloat(metrics.weight) || 70
  const h = parseFloat(metrics.height) || 175
  const a = parseFloat(metrics.age) || 25
  const bmr = metrics.gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
  const multiplier =
    { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[metrics.activity] || 1.55
  const goalAdj = { lose_weight: -500, maintain: 0, gain_weight: 300 }[metrics.goal] || 0
  const dailyCalories = Math.round(bmr * multiplier + goalAdj)
  const proteinG = Math.round((dailyCalories * 0.3) / 4)
  const carbsG = Math.round((dailyCalories * 0.4) / 4)
  const fatG = Math.round((dailyCalories * 0.3) / 9)

  const handleSaveMetrics = () => {
    setSavingMetrics(true)
    localStorage.setItem('camos_customer_body_metrics', JSON.stringify(metrics))
    setTimeout(() => {
      setSavingMetrics(false)
      toast.success('Body & fitness metrics saved to your account!')
    }, 400)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Signed out successfully')
    window.location.reload()
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-[#C7230F]/15 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C7230F] mb-2">
              My Account & Orders
            </h1>
            <p className="text-sm font-bold text-[#C7230F]/80">
              Manage your personal profile, health metrics, fitness goals, and order history.
            </p>
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-white text-[#C7230F] border-2 border-[#C7230F]/20 font-black text-xs px-5 py-2.5 rounded-full hover:border-[#C7230F] transition-colors cursor-pointer w-fit"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-6 py-2.5 rounded-full shadow-md hover:bg-[#A31C0C] transition-colors uppercase tracking-wider w-fit"
            >
              Sign In / Register
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Account Profile & Fitness Metrics (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#C7230F]/20 shadow-xs flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#C7230F] text-[#FFFFEF] flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={30} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl text-[#C7230F] truncate">
                    {user?.name || 'Valued Customer'}
                  </span>
                  <span className="bg-[#C7230F]/10 text-[#C7230F] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#C7230F]/20">
                    VERIFIED
                  </span>
                </div>
                <div className="text-xs font-bold text-[#C7230F]/70 truncate">
                  {user?.email || 'Guest User • Sign in to sync across devices'}
                </div>
              </div>
            </div>

            {/* Health & Body Metrics Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#C7230F]/20 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C7230F]/15">
                <div className="w-10 h-10 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <div>
                  <h2 className="font-black text-lg text-[#C7230F]">
                    Body & Fitness Metrics
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/70">
                    Track your height, weight, and fitness targets for tailored meal recommendations.
                  </p>
                </div>
              </div>

              {/* Height, Weight, Age, Gender Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div>
                  <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={metrics.weight}
                    onChange={(e) => setMetrics({ ...metrics, weight: e.target.value })}
                    className="w-full p-3 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-xs font-black text-[#C7230F] outline-none focus:border-[#C7230F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={metrics.height}
                    onChange={(e) => setMetrics({ ...metrics, height: e.target.value })}
                    className="w-full p-3 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-xs font-black text-[#C7230F] outline-none focus:border-[#C7230F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={metrics.age}
                    onChange={(e) => setMetrics({ ...metrics, age: e.target.value })}
                    className="w-full p-3 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-xs font-black text-[#C7230F] outline-none focus:border-[#C7230F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <div className="flex gap-1">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setMetrics({ ...metrics, gender: g })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black border-2 transition-all cursor-pointer uppercase ${
                          metrics.gender === g
                            ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                            : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal Selector */}
              <div className="mb-6">
                <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-2">
                  Select Your Goal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GOALS.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMetrics({ ...metrics, goal: value })}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        metrics.goal === value
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-sm'
                          : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                      }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <div className="font-black text-xs uppercase">{label}</div>
                      <div className="text-[10px] font-bold opacity-80 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div className="mb-6">
                <label className="block text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-2">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACTIVITY.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMetrics({ ...metrics, activity: value })}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        metrics.activity === value
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/20'
                      }`}
                    >
                      <span className="font-black text-xs uppercase">{label}</span>
                      <span className="text-[10px] font-bold opacity-80">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveMetrics}
                disabled={savingMetrics}
                className="w-full bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs py-3.5 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
              >
                <Save size={16} />
                <span>{savingMetrics ? 'Saving...' : 'Save Health Profile'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Calculated Target Card & Order History (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Calculated Calorie Target Card */}
            <div className="bg-[#C7230F] rounded-3xl p-6 sm:p-8 text-[#FFFFEF] shadow-xl border-2 border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-[#FFFFEF]">
                  <Flame size={22} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Daily Recommended Target</h3>
                  <p className="text-xs text-[#FFFFEF]/80 font-bold">Based on your saved height & weight metrics</p>
                </div>
              </div>

              <div className="font-black text-5xl text-white my-4 text-center">
                {dailyCalories} <span className="text-sm font-bold text-[#FFFFEF]/80 uppercase">kcal/day</span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-black/25 p-3 rounded-2xl border border-white/20 text-center">
                <div>
                  <div className="font-black text-lg text-white">{proteinG}g</div>
                  <div className="text-[10px] font-black text-[#FFFFEF]/80 uppercase">PROTEIN</div>
                </div>
                <div>
                  <div className="font-black text-lg text-white">{carbsG}g</div>
                  <div className="text-[10px] font-black text-[#FFFFEF]/80 uppercase">CARBS</div>
                </div>
                <div>
                  <div className="font-black text-lg text-white">{fatG}g</div>
                  <div className="text-[10px] font-black text-[#FFFFEF]/80 uppercase">FAT</div>
                </div>
              </div>
            </div>

            {/* Orders & Checkouts History Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#C7230F]/15">
                <h2 className="font-black text-lg text-[#C7230F]">
                  My Order & Checkout History
                </h2>
                <span className="text-xs font-black text-[#C7230F] bg-[#FFFFEF] px-3 py-1 rounded-full border border-[#C7230F]/20">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-[#C7230F]/10 animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 px-4 bg-[#FFFFEF] rounded-2xl border border-dashed border-[#C7230F]/20">
                  <Truck size={36} className="text-[#C7230F]/50 mx-auto mb-2" />
                  <h3 className="font-black text-sm text-[#C7230F] mb-1">No Orders Yet</h3>
                  <p className="text-xs font-bold text-[#C7230F]/70 mb-4 max-w-xs mx-auto">
                    Your order and checkout history will appear here once you place your first meal order.
                  </p>
                  <Link
                    href="/menu"
                    className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-6 py-2.5 rounded-full no-underline inline-block uppercase tracking-wider"
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto no-scrollbar">
                  {orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    const Icon = cfg.icon
                    return (
                      <div
                        key={order.id}
                        className="bg-[#FFFFEF] rounded-2xl p-4 border border-[#C7230F]/20 flex justify-between items-center"
                      >
                        <div>
                          <div className="text-[11px] font-black text-[#C7230F]/70 tracking-wider uppercase mb-0.5">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="font-black text-lg text-[#C7230F]">
                            {formatPrice(order.total)}
                          </div>
                          <div className="text-[10px] font-bold text-[#C7230F]/60 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-[#C7230F]/20 rounded-full px-3 py-1.5 shadow-xs">
                          <Icon size={14} className="text-[#C7230F]" />
                          <span className="text-[11px] font-black text-[#C7230F] uppercase tracking-wider">
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
