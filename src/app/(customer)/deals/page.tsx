'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Utensils, ShieldCheck, ShoppingBag, Check } from 'lucide-react'
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
  const [fridayChoice, setFridayChoice] = useState<'tacos' | 'bowl'>('tacos')

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

  const selectedPlan = planCards.find(p => p.id === activePlanId)!
  const currentMeals = activePlanId === 'diet_5' ? diet5Days
    : activePlanId === 'diet_7' ? diet7Days
    : activePlanId === 'desi_5' ? desi5Days
    : getDesi7Days(activePlanId === 'desi_7_beef' ? 'beef' : 'chicken')

  const handleSubscribe = () => {
    addItem({
      id: `subscription-${selectedPlan.id}-${Date.now()}`,
      name: selectedPlan.title,
      price: selectedPlan.price,
      image_url: '/hero-plate.jpg',
      category: selectedPlan.category,
      calories: selectedPlan.category === 'diet' ? 450 : 650,
      protein_g: selectedPlan.category === 'diet' ? 42 : 30,
      carbs_g: 50,
      fat_g: 15,
      tags: ['subscription', selectedPlan.category],
      status: 'active',
      is_featured: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    toast.success(`${selectedPlan.title} added to cart! (${selectedPlan.priceFormatted})`)
    router.push('/cart')
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
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
            Choose from our 4 official weekly subscription plans. Each day brings a different freshly prepped meal delivered right to your door.
          </p>
        </div>

        {/* 4 MENU PLAN CARDS SELECTION GRID */}
        <div className="mb-14">
          <div className="text-center mb-6">
            <span className="text-xs font-black text-[#C7230F] uppercase tracking-widest">
              SELECT ONE OF THE 4 WEEKLY MEAL PLANS BELOW
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {planCards.slice(0, 4).map((plan) => {
              const isSelected = activePlanId === plan.id || (plan.id === 'desi_7_chicken' && activePlanId === 'desi_7_beef')

              return (
                <div
                  key={plan.id}
                  onClick={() => setActivePlanId(plan.id)}
                  className={`rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#C7230F] bg-white shadow-xl scale-[1.02]'
                      : 'border-[#C7230F]/20 bg-white/60 hover:border-[#C7230F]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isSelected ? 'bg-[#C7230F] text-[#FFFFEF]' : 'bg-[#C7230F]/10 text-[#C7230F]'
                      }`}>
                        {plan.badge}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#C7230F] text-[#FFFFEF] flex items-center justify-center">
                          <Check size={14} />
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-lg text-[#C7230F] mb-1">
                      {plan.title}
                    </h3>

                    <div className="font-black text-2xl text-[#C7230F] mb-2">
                      {plan.priceFormatted}
                    </div>

                    <p className="text-xs font-bold text-[#C7230F]/70 mb-4">
                      {plan.subtitle}
                    </p>

                    {plan.id === 'desi_7_chicken' && (
                      <div className="bg-[#FFFFEF] p-2.5 rounded-2xl border border-[#C7230F]/20 mb-4">
                        <div className="text-[10px] font-black text-[#C7230F] uppercase tracking-wider mb-1.5">
                          Qeema Variant:
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActivePlanId('desi_7_chicken'); }}
                            className={`flex-1 text-[10px] font-black py-1.5 rounded-xl border cursor-pointer ${
                              activePlanId === 'desi_7_chicken' ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]' : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                            }`}
                          >
                            Chicken (Rs 3,750)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActivePlanId('desi_7_beef'); }}
                            className={`flex-1 text-[10px] font-black py-1.5 rounded-xl border cursor-pointer ${
                              activePlanId === 'desi_7_beef' ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]' : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                            }`}
                          >
                            Beef (Rs 3,900)
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-6">
                      {plan.highlights.map((h, i) => (
                        <div key={i} className="text-xs text-[#C7230F]/90 font-bold flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-[#C7230F] shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePlanId(plan.id)}
                    className={`w-full py-3 rounded-full font-black text-xs transition-colors cursor-pointer border-none uppercase tracking-wider ${
                      isSelected ? 'bg-[#C7230F] text-[#FFFFEF]' : 'bg-[#C7230F]/10 text-[#C7230F] hover:bg-[#C7230F] hover:text-[#FFFFEF]'
                    }`}
                  >
                    {isSelected ? 'Selected Plan' : 'View Schedule'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* DAY BY DAY MEAL SCHEDULE */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-black text-2xl sm:text-3xl text-[#C7230F]">
                {selectedPlan.title} — Schedule ({currentMeals.length} Days)
              </h2>
              <p className="text-xs sm:text-sm font-bold text-[#C7230F]/70 mt-1">
                {selectedPlan.priceFormatted} • Freshly prepared every morning
              </p>
            </div>
            <span className="text-xs font-black text-[#FFFFEF] bg-[#C7230F] px-4 py-2 rounded-full uppercase tracking-wider">
              {selectedPlan.daysCount} Days Included
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentMeals.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.day}
                    </span>
                    {item.tag && (
                      <span className="bg-[#FFFFEF] text-[#C7230F] font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-[#C7230F]/20">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-lg text-[#C7230F] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#C7230F]/80 leading-relaxed font-bold mb-4">
                    {item.desc}
                  </p>
                </div>

                {selectedPlan.category === 'diet' && item.day === 'Friday' && (
                  <div className="bg-[#FFFFEF] p-3 rounded-2xl border border-[#C7230F]/20 mt-2">
                    <div className="text-[11px] font-black text-[#C7230F] uppercase tracking-wider mb-2">Friday Preference:</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFridayChoice('tacos')}
                        className={`flex-1 text-[11px] font-black py-1.5 rounded-xl border cursor-pointer transition-colors ${
                          fridayChoice === 'tacos'
                            ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                            : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                        }`}
                      >
                        Tacos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFridayChoice('bowl')}
                        className={`flex-1 text-[11px] font-black py-1.5 rounded-xl border cursor-pointer transition-colors ${
                          fridayChoice === 'bowl'
                            ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                            : 'bg-white text-[#C7230F] border-[#C7230F]/20'
                        }`}
                      >
                        Bowl
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PLAN SUMMARY & CHECKOUT CTA BOX */}
        <div className="bg-[#C7230F] rounded-3xl p-8 sm:p-12 text-[#FFFFEF] shadow-2xl border-2 border-white/20 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={16} className="text-[#FFFFEF]" />
            <span>Official CAMOS FOODS Subscription</span>
          </div>

          <h2 className="font-black text-3xl sm:text-5xl text-white mb-3">
            {selectedPlan.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#FFFFEF]/90 max-w-lg mx-auto mb-8 font-medium">
            {selectedPlan.category === 'diet'
              ? 'Both prices include tacos on Friday. Each day brings a different meal, from our rice bowl and chicken wrap to weekend favourites.'
              : 'The 7-day plans include pasta on Saturday and biryani on Sunday. Fresh authentic home-style Desi meals every day.'}
          </p>

          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/20">
            <div className="text-left">
              <div className="text-xs text-[#FFFFEF]/80 font-black uppercase tracking-wider mb-1">TOTAL PLAN PRICE</div>
              <div className="font-black text-3xl sm:text-4xl text-white">
                {selectedPlan.priceFormatted}
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              style={{ color: '#C7230F', backgroundColor: '#FFFFEF' }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFFFEF] text-[#C7230F] font-black text-sm sm:text-base px-9 py-4 rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-white/80 cursor-pointer uppercase tracking-wider"
            >
              <ShoppingBag size={18} style={{ color: '#C7230F' }} />
              <span style={{ color: '#C7230F', fontWeight: 900 }}>Subscribe & Order Plan</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#FFFFEF]/90 font-bold">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Fresh Daily Delivery</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Balanced Nutrition</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} /> No Hidden Charges</span>
          </div>
        </div>

      </div>
    </div>
  )
}
