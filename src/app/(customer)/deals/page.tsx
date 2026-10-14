'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Utensils,
  ShieldCheck,
  ShoppingBag,
  Check,
  X,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Truck,
  HeartHandshake,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'

type ActivePlanId = 'diet_5' | 'diet_7' | 'desi_5' | 'desi_7_chicken' | 'desi_7_beef'

interface MealDay {
  day: string
  title: string
  desc: string
  tag?: string
}

interface SubscriptionPlanCard {
  id: ActivePlanId
  category: 'diet' | 'desi'
  title: string
  badge: string
  daysCount: number
  price: number
  priceFormatted: string
  subtitle: string
  highlights: string[]
}

export default function DealsPage() {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const [activePlanId, setActivePlanId] = useState<ActivePlanId>('diet_5')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fridayChoice, setFridayChoice] = useState<'tacos' | 'bowl'>('tacos')

  // Close modal on Escape key press and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  const planCards: SubscriptionPlanCard[] = [
    {
      id: 'diet_5',
      category: 'diet',
      title: '5-Day Diet Plan',
      badge: 'Diet Subscription',
      daysCount: 5,
      price: 3550,
      priceFormatted: 'Rs 3,550',
      subtitle: 'Monday to Friday • Workweek Plan',
      highlights: ['Includes Friday Tacos', 'Chicken Fajita Bowl', 'High-Protein Chicken Wrap', 'High-Protein Burger'],
    },
    {
      id: 'diet_7',
      category: 'diet',
      title: '7-Day Diet Plan',
      badge: 'Diet Subscription',
      daysCount: 7,
      price: 5250,
      priceFormatted: 'Rs 5,250',
      subtitle: 'Monday to Sunday • Full Week Plan',
      highlights: ['Includes Friday Tacos', 'Garlic Chicken Fried Rice', 'Honey Garlic Mac & Cheese', 'All 7 Days Covered'],
    },
    {
      id: 'desi_5',
      category: 'desi',
      title: '5-Day Desi Plan',
      badge: 'Desi Subscription',
      daysCount: 5,
      price: 2800,
      priceFormatted: 'Rs 2,800',
      subtitle: 'Monday to Friday • Workweek Plan',
      highlights: ['Chicken Karahi', 'Kabab Masala', 'Qeema (Chicken/Beef)', 'Special Friday Pulao'],
    },
    {
      id: 'desi_7_chicken',
      category: 'desi',
      title: '7-Day Desi Plan (Chicken Qeema)',
      badge: 'Desi Subscription',
      daysCount: 7,
      price: 3750,
      priceFormatted: 'Rs 3,750',
      subtitle: 'Monday to Sunday • Full Week Plan',
      highlights: ['Chicken Qeema included', 'Saturday Special Pasta', 'Sunday Royal Biryani', 'Complete 7-Day Feast'],
    },
    {
      id: 'desi_7_beef',
      category: 'desi',
      title: '7-Day Desi Plan (Beef Qeema)',
      badge: 'Desi Subscription',
      daysCount: 7,
      price: 3900,
      priceFormatted: 'Rs 3,900',
      subtitle: 'Monday to Sunday • Full Week Plan',
      highlights: ['Beef Qeema included', 'Saturday Special Pasta', 'Sunday Royal Biryani', 'Complete 7-Day Feast'],
    },
  ]

  const diet5Days: MealDay[] = [
    { day: 'Monday', title: 'Chicken Fajita Rice Bowl', desc: 'Grilled chicken strips, seasoned rice, corn, beans & bell peppers', tag: 'High Protein' },
    { day: 'Tuesday', title: 'High-Protein Chicken Wrap', desc: 'Whole wheat tortilla stuffed with lean grilled chicken & fresh veggies', tag: 'Lean Choice' },
    { day: 'Wednesday', title: 'Chicken Chilli Dry + Rice', desc: 'Tender chicken strips wok-tossed with green chillies & steamed rice', tag: 'Balanced Calories' },
    { day: 'Thursday', title: 'High-Protein Chicken Burger', desc: 'Flame-grilled chicken patty, lettuce, tomato & low-calorie sauce', tag: 'Cheat Day Special' },
    { day: 'Friday', title: 'Tacos or High-Protein Bowl', desc: 'Crispy seasoned chicken tacos or fresh protein bowl (Your choice!)', tag: 'Included Friday Special' },
  ]

  const diet7Days: MealDay[] = [
    ...diet5Days,
    { day: 'Saturday', title: 'Crispy Garlic Chicken Fried Rice', desc: 'Garlic roasted chicken with egg fried brown rice', tag: 'Weekend Favourite' },
    { day: 'Sunday', title: 'Honey Garlic Butter Chicken Mac & Cheese', desc: 'High-protein macaroni pasta with glazed garlic butter chicken', tag: 'Weekend Special' },
  ]

  const desi5Days: MealDay[] = [
    { day: 'Monday', title: 'Chicken Karahi', desc: 'Authentic wok-cooked chicken karahi cooked in tomatoes & ginger', tag: 'Desi Favorite' },
    { day: 'Tuesday', title: 'Kabab Masala', desc: 'Tender spiced kababs simmered in rich gravy', tag: 'Traditional Spice' },
    { day: 'Wednesday', title: 'Qeema (Chicken / Beef)', desc: 'Slow-cooked minced meat with green peas & freshly ground spices', tag: 'Home Style' },
    { day: 'Thursday', title: 'Butter Chicken / Makhni Handi', desc: 'Velvety cream & butter gravy with tender boneless chicken', tag: 'Chef Choice' },
    { day: 'Friday', title: 'Special Pulao', desc: 'Fragrant chicken pulao infused with aromatic whole spices', tag: 'Friday Tradition' },
  ]

  const getDesi7Days = (qeemaType: 'chicken' | 'beef'): MealDay[] => [
    { day: 'Monday', title: 'Chicken Karahi', desc: 'Authentic wok-cooked chicken karahi cooked in tomatoes & ginger', tag: 'Desi Favorite' },
    { day: 'Tuesday', title: 'Kabab Masala', desc: 'Tender spiced kababs simmered in rich gravy', tag: 'Traditional Spice' },
    { day: 'Wednesday', title: qeemaType === 'beef' ? 'Beef Qeema' : 'Chicken Qeema', desc: `Slow-cooked minced ${qeemaType} with green peas & whole spices`, tag: `${qeemaType.toUpperCase()} SPECIAL` },
    { day: 'Thursday', title: 'Butter Chicken / Makhni Handi', desc: 'Velvety cream & butter gravy with tender boneless chicken', tag: 'Chef Choice' },
    { day: 'Friday', title: 'Special Pulao', desc: 'Fragrant chicken pulao infused with aromatic whole spices', tag: 'Friday Tradition' },
    { day: 'Saturday', title: 'Special Pasta', desc: 'Creamy savory pasta cooked with chicken & aromatic spices', tag: 'Saturday Favourite' },
    { day: 'Sunday', title: 'Royal Chicken Biryani', desc: 'Long-grain basmati rice cooked with tender marinated chicken', tag: 'Sunday Feast' },
  ]

  const selectedPlan = planCards.find((p) => p.id === activePlanId) || planCards[0]
  const currentMeals =
    activePlanId === 'diet_5'
      ? diet5Days
      : activePlanId === 'diet_7'
      ? diet7Days
      : activePlanId === 'desi_5'
      ? desi5Days
      : getDesi7Days(activePlanId === 'desi_7_beef' ? 'beef' : 'chicken')

  const handleSubscribe = (plan: SubscriptionPlanCard = selectedPlan) => {
    addItem({
      id: `subscription-${plan.id}-${Date.now()}`,
      name: plan.title,
      price: plan.price,
      image_url: '/items/chicken-fajita-rice-bowl.jpg',
      category: plan.category,
      calories: plan.category === 'diet' ? 450 : 650,
      protein_g: plan.category === 'diet' ? 42 : 30,
      carbs_g: 50,
      fat_g: 15,
      tags: ['subscription', plan.category],
      status: 'active',
      is_featured: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setIsModalOpen(false)
    toast.success(`${plan.title} added to cart! (${plan.priceFormatted})`)
    router.push('/cart')
  }

  const openScheduleModal = (planId: ActivePlanId) => {
    setActivePlanId(planId)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-20 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#C7230F]/10 text-[#C7230F] border border-[#C7230F]/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Utensils size={14} />
            <span>Weekly Subscription Plans</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#C7230F] tracking-tight mb-4">
            Weekly Meal Subscriptions
          </h1>
          <p className="text-sm sm:text-base text-[#C7230F]/80 max-w-2xl mx-auto leading-relaxed font-bold">
            Choose from our 4 official weekly subscription plans. Click on any plan below to view its complete day-by-day cooking schedule and subscribe!
          </p>
        </div>

        {/* 4 MENU PLAN CARDS SELECTION GRID */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <span className="text-xs font-black text-[#C7230F] uppercase tracking-widest bg-white border border-[#C7230F]/20 px-5 py-2 rounded-full shadow-xs">
              SELECT A PLAN TO VIEW SCHEDULE & MEALS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planCards.slice(0, 4).map((plan) => {
              const isSelected =
                activePlanId === plan.id ||
                (plan.id === 'desi_7_chicken' && activePlanId === 'desi_7_beef')

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between relative bg-white group hover:shadow-xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-[#C7230F] shadow-lg ring-2 ring-[#C7230F]/15'
                      : 'border-[#C7230F]/20 hover:border-[#C7230F]'
                  }`}
                >
                  <div>
                    {/* Top Row: Badge & Day count */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-[#C7230F] text-[#FFFFEF] shadow-xs">
                        {plan.badge}
                      </span>
                      <span className="text-xs font-black text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={11} />
                        <span>{plan.daysCount} Days</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xl text-[#C7230F] mb-1 leading-tight">
                      {plan.title}
                    </h3>

                    <div className="font-black text-2xl sm:text-3xl text-[#C7230F] mb-2 leading-none">
                      {plan.priceFormatted}
                    </div>

                    <p className="text-xs font-bold text-[#C7230F]/70 mb-5">
                      {plan.subtitle}
                    </p>

                    {/* Qeema Option for 7-Day Desi Plan */}
                    {plan.id === 'desi_7_chicken' && (
                      <div className="bg-[#FFFFEF] p-2.5 rounded-2xl border border-[#C7230F]/20 mb-4">
                        <div className="text-[10px] font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
                          Wednesday Qeema Choice:
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActivePlanId('desi_7_chicken')
                            }}
                            className={`flex-1 text-[10px] font-black py-1.5 rounded-xl border cursor-pointer transition-all ${
                              activePlanId === 'desi_7_chicken'
                                ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-xs'
                                : 'bg-white text-[#C7230F] border-[#C7230F]/20 hover:border-[#C7230F]'
                            }`}
                          >
                            Chicken (Rs 3,750)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActivePlanId('desi_7_beef')
                            }}
                            className={`flex-1 text-[10px] font-black py-1.5 rounded-xl border cursor-pointer transition-all ${
                              activePlanId === 'desi_7_beef'
                                ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-xs'
                                : 'bg-white text-[#C7230F] border-[#C7230F]/20 hover:border-[#C7230F]'
                            }`}
                          >
                            Beef (Rs 3,900)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Highlights */}
                    <div className="space-y-2 mb-6">
                      {plan.highlights.map((h, i) => (
                        <div key={i} className="text-xs text-[#C7230F]/90 font-bold flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-[#C7230F] shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-4 border-t border-[#C7230F]/15">
                    <button
                      type="button"
                      onClick={() => openScheduleModal(plan.id)}
                      className="w-full py-3 px-4 rounded-full font-black text-xs transition-all cursor-pointer border-2 border-[#C7230F] bg-white text-[#C7230F] hover:bg-[#C7230F] hover:text-[#FFFFEF] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Calendar size={14} />
                      <span>View Full Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan)}
                      className="w-full py-3 px-4 rounded-full font-black text-xs transition-all cursor-pointer border-none bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <ShoppingBag size={14} />
                      <span>Subscribe Now</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* HOW SUBSCRIPTIONS WORK & BENEFITS BANNER */}
        <div className="bg-white border-2 border-[#C7230F]/20 rounded-[36px] p-8 sm:p-12 mb-16 shadow-md">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-black text-[#C7230F] bg-[#C7230F]/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
              Hassle-Free Home Kitchen
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#C7230F] mt-2 mb-2">
              How Camo's Subscriptions Work
            </h2>
            <p className="text-xs sm:text-sm text-[#C7230F]/80 font-bold">
              Pure home-cooked food, prepared fresh every morning and delivered piping hot to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#FFFFEF] rounded-3xl border border-[#C7230F]/15">
              <div className="w-14 h-14 bg-[#C7230F] text-[#FFFFEF] rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-base text-[#C7230F] mb-1.5">
                Pick Your Weekly Plan
              </h3>
              <p className="text-xs text-[#C7230F]/75 font-semibold leading-relaxed">
                Choose between 5-Day workweek plans or 7-Day full-week plans in Desi Heritage or High-Protein Diet options.
              </p>
            </div>

            <div className="text-center p-6 bg-[#FFFFEF] rounded-3xl border border-[#C7230F]/15">
              <div className="w-14 h-14 bg-[#C7230F] text-[#FFFFEF] rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-base text-[#C7230F] mb-1.5">
                Cooked Fresh on Order
              </h3>
              <p className="text-xs text-[#C7230F]/75 font-semibold leading-relaxed">
                No frozen or reheated food. Every dish is slow-cooked fresh daily using 100% Halal premium meat and pure desi ghee.
              </p>
            </div>

            <div className="text-center p-6 bg-[#FFFFEF] rounded-3xl border border-[#C7230F]/15">
              <div className="w-14 h-14 bg-[#C7230F] text-[#FFFFEF] rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-base text-[#C7230F] mb-1.5">
                Daily Express Delivery
              </h3>
              <p className="text-xs text-[#C7230F]/75 font-semibold leading-relaxed">
                Delivered piping hot right to your doorstep or office at your preferred lunch or dinner time every single day.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-[#C7230F]/15 flex flex-wrap justify-center gap-6 text-xs text-[#C7230F] font-extrabold">
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} /> 100% Halal & Hygienic
            </span>
            <span className="flex items-center gap-2">
              <Truck size={16} /> Free Priority Daily Delivery
            </span>
            <span className="flex items-center gap-2">
              <HeartHandshake size={16} /> Pause or Skip Days Anytime
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE MODAL POPUP (FULL SCHEDULE & ORDER) ── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-[#FFFFEF] border-2 border-[#C7230F] rounded-[32px] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white px-6 sm:px-8 py-5 border-b-2 border-[#C7230F]/15 flex items-start justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="bg-[#C7230F] text-[#FFFFEF] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedPlan.badge}
                    </span>
                    <span className="text-xs font-black text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={11} />
                      <span>{selectedPlan.daysCount} Days Schedule</span>
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#C7230F] leading-tight">
                    {selectedPlan.title}
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/70 mt-0.5">
                    {selectedPlan.subtitle} • {selectedPlan.priceFormatted}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#C7230F] text-[#C7230F] hover:text-[#FFFFEF] border border-[#C7230F]/20 flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-xs"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Qeema Option inside Modal if Desi 7-day */}
              {selectedPlan.category === 'desi' && selectedPlan.daysCount === 7 && (
                <div className="bg-white px-6 sm:px-8 py-3 border-b border-[#C7230F]/15 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs font-black text-[#C7230F] uppercase tracking-wide">
                    Select Wednesday Dish:
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePlanId('desi_7_chicken')}
                      className={`text-xs font-black px-4 py-1.5 rounded-full border cursor-pointer transition-all ${
                        activePlanId === 'desi_7_chicken'
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-white text-[#C7230F] border-[#C7230F]/30 hover:border-[#C7230F]'
                      }`}
                    >
                      Chicken Qeema (Rs 3,750)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePlanId('desi_7_beef')}
                      className={`text-xs font-black px-4 py-1.5 rounded-full border cursor-pointer transition-all ${
                        activePlanId === 'desi_7_beef'
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-white text-[#C7230F] border-[#C7230F]/30 hover:border-[#C7230F]'
                      }`}
                    >
                      Beef Qeema (Rs 3,900)
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body - Scrollable Day-by-Day Schedule */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-[#C7230F] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Day-by-Day Meal Breakdown ({currentMeals.length} Days)</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#C7230F]/70">
                    Cooked Fresh Every Morning
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentMeals.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border-2 border-[#C7230F]/15 shadow-xs flex flex-col justify-between hover:border-[#C7230F]/40 transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="bg-[#C7230F] text-[#FFFFEF] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                            {item.day}
                          </span>
                          {item.tag && (
                            <span className="bg-[#FFFFEF] text-[#C7230F] font-black text-[10px] px-2 py-0.5 rounded-md border border-[#C7230F]/20">
                              {item.tag}
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-base text-[#C7230F] mb-1 leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#C7230F]/75 font-semibold leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Friday Customization inside Diet Plan */}
                      {selectedPlan.category === 'diet' && item.day === 'Friday' && (
                        <div className="bg-[#FFFFEF] p-2.5 rounded-xl border border-[#C7230F]/20 mt-3">
                          <div className="text-[10px] font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
                            Friday Preference:
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFridayChoice('tacos')}
                              className={`flex-1 text-[10px] font-black py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                fridayChoice === 'tacos'
                                  ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                                  : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                              }`}
                            >
                              Crispy Tacos
                            </button>
                            <button
                              type="button"
                              onClick={() => setFridayChoice('bowl')}
                              className={`flex-1 text-[10px] font-black py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                fridayChoice === 'bowl'
                                  ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                                  : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                              }`}
                            >
                              Protein Bowl
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Sticky Footer CTA */}
              <div className="bg-white px-6 sm:px-8 py-5 border-t-2 border-[#C7230F]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
                <div>
                  <div className="text-[10px] font-black text-[#C7230F]/70 uppercase tracking-wider">
                    Total Plan Price
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#C7230F] leading-none">
                    {selectedPlan.priceFormatted}
                  </div>
                  <div className="text-[11px] font-bold text-[#C7230F]/75 mt-0.5">
                    Includes all {selectedPlan.daysCount} meals, sides & packaging
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-full text-xs font-black border-2 border-[#C7230F]/30 bg-white text-[#C7230F] hover:bg-[#FFFFEF] uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubscribe(selectedPlan)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border-none uppercase tracking-wider"
                  >
                    <ShoppingBag size={16} />
                    <span>Subscribe & Order Plan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
