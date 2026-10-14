'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Phone,
  ChefHat,
  Timer,
  Moon,
  Award,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Flame,
  Beef,
  CheckCircle2,
  Leaf,
  Dumbbell,
  Check,
  Coffee,
} from 'lucide-react'
import { FoodItem } from '@/lib/types'
import FoodCard from '@/components/ui/FoodCard'
import { toast } from 'sonner'
import {
  WEEKLY_SCHEDULE,
  getPakistanDayOfWeek,
  getPakistanFormattedDate,
  DayOfWeek,
} from '@/lib/schedule'
import { REAL_MENU_ITEMS, enrichFoodItem } from '@/lib/menuData'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function HomepageClient() {
  const addItem = useCartStore((s) => s.addItem)
  const [popular, setPopular] = useState<FoodItem[]>([])
  const [allMenu, setAllMenu] = useState<FoodItem[]>([])
  const [todayDay, setTodayDay] = useState<DayOfWeek>('Monday')
  const [todayFormatted, setTodayFormatted] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setTodayDay(getPakistanDayOfWeek())
    setTodayFormatted(getPakistanFormattedDate())

    setLoading(true)
    setError(null)
    fetch('/api/menu')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch menu items')
        return r.json()
      })
      .then(({ data }) => {
        if (data?.items && Array.isArray(data.items)) {
          setAllMenu(data.items)
          const featured = data.items.filter((i: FoodItem) => i.is_featured)
          setPopular(featured.length > 0 ? featured.slice(0, 3) : data.items.slice(0, 3))
        } else {
          setPopular([])
        }
      })
      .catch((err) => {
        console.error('Menu fetch error:', err)
        setError('Unable to load featured dishes. Please try again later.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Thank you for subscribing!')
    setEmail('')
  }

  const todayPlan = WEEKLY_SCHEDULE[todayDay]

  const resolveItem = (id: string, name: string) => {
    const fromApi = allMenu.find((i) => i.id === id || i.name.toLowerCase() === name.toLowerCase())
    if (fromApi) return fromApi
    const fromReal = REAL_MENU_ITEMS.find((i) => i.id === id || i.name.toLowerCase() === name.toLowerCase())
    return fromReal ? enrichFoodItem(fromReal) : null
  }

  const todayDesi = resolveItem(todayPlan.desiDishId, todayPlan.desiDishName)
  const todayDiet = resolveItem(todayPlan.dietDishId, todayPlan.dietDishName)

  return (
    <div className="bg-[#FFFFEF] min-h-screen font-sans text-[#C7230F] overflow-x-hidden relative">

      {/* ── MAIN HERO CONTAINER ── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-[50px] relative z-10 pt-24 md:pt-28">
        
        {/* HERO MAIN */}
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 items-center mt-5">
          {/* Left Text Content */}
          <div className="z-10">
            <h1 className="font-serif text-[42px] sm:text-[58px] lg:text-[70px] font-black text-[#C7230F] leading-[1.08] mb-[25px] tracking-[-1px]">
              Taste You'll <br /> Crave Again
            </h1>
            <p className="text-[17px] leading-[1.7] text-[#C7230F]/80 mb-[35px] max-w-[460px] font-medium">
              Authentic Pakistani flavors, made fresh and delivered fast. Every dish crafted to bring the comfort of home straight to your door.
            </p>

            <Link
              href="/menu"
              style={{ color: '#FFFFEF', backgroundColor: '#C7230F' }}
              className="inline-flex items-center gap-[15px] bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] px-[45px] py-[16px] rounded-[50px] font-black text-[17px] shadow-[0_12px_25px_rgba(199,35,15,0.3)] hover:shadow-[0_18px_35px_rgba(199,35,15,0.4)] hover:-translate-y-[3px] transition-all duration-300 mb-[45px] no-underline border-2 border-[#C7230F]"
            >
              <span style={{ color: '#FFFFEF', fontWeight: 900 }}>Order Now</span>
              <ArrowRight size={20} style={{ color: '#FFFFEF' }} />
            </Link>

            {/* Features Row */}
            <div className="flex gap-4 sm:gap-[35px] items-center">
              <div className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-[54px] h-[54px] bg-[#C7230F]/10 group-hover:bg-[#C7230F] group-hover:text-[#FFFFEF] rounded-full flex items-center justify-center text-[#C7230F] text-xl transition-all duration-300 group-hover:scale-105 border border-[#C7230F]/20">
                  <Award size={20} />
                </div>
                <span className="text-[14px] font-bold text-[#C7230F]">4.9★ Rated</span>
              </div>

              <div className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-[54px] h-[54px] bg-[#C7230F]/10 group-hover:bg-[#C7230F] group-hover:text-[#FFFFEF] rounded-full flex items-center justify-center text-[#C7230F] text-xl transition-all duration-300 group-hover:scale-105 border border-[#C7230F]/20">
                  <Moon size={20} />
                </div>
                <span className="text-[14px] font-bold text-[#C7230F]">100% Halal</span>
              </div>

              <div className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-[54px] h-[54px] bg-[#C7230F]/10 group-hover:bg-[#C7230F] group-hover:text-[#FFFFEF] rounded-full flex items-center justify-center text-[#C7230F] text-xl transition-all duration-300 group-hover:scale-105 border border-[#C7230F]/20">
                  <Timer size={20} />
                </div>
                <span className="text-[14px] font-bold text-[#C7230F]">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="relative flex justify-center items-center z-5 mt-8 lg:mt-0">
            <div className="w-[300px] sm:w-[420px] lg:w-[520px] h-[300px] sm:h-[420px] lg:h-[520px] rounded-full border-[8px] md:border-[12px] border-[#C7230F] shadow-[0_25px_60px_rgba(199,35,15,0.2)] overflow-hidden relative z-6 bg-[#FFFFEF] group">
              <Image
                src="/hero-plate.jpg"
                alt="Chicken Biryani"
                fill
                unoptimized
                priority
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </main>

        {/* BOTTOM INFO BAR */}
        <div className="my-[60px] relative z-10">
          <div className="bg-[#C7230F] rounded-[60px] py-[22px] px-[30px] md:px-[50px] flex flex-col md:flex-row justify-between items-center shadow-[0_10px_30px_rgba(199,35,15,0.25)] gap-4 md:gap-0 text-[#FFFFEF]">
            <div className="flex items-center gap-[16px] flex-1 justify-center md:border-r border-[#FFFFEF]/25 w-full md:w-auto py-2">
              <div className="bg-[#FFFFEF] w-[48px] h-[48px] rounded-full flex justify-center items-center text-[#C7230F] shadow-xs">
                <ChefHat size={20} className="text-[#C7230F]" />
              </div>
              <span className="text-[18px] font-bold text-[#FFFFEF]">Authentic Heritage Recipes</span>
            </div>

            <div className="flex items-center gap-[16px] flex-1 justify-center md:border-r border-[#FFFFEF]/25 w-full md:w-auto py-2">
              <div className="bg-[#FFFFEF] w-[48px] h-[48px] rounded-full flex justify-center items-center text-[#C7230F] shadow-xs">
                <ShieldCheck size={20} className="text-[#C7230F]" />
              </div>
              <span className="text-[18px] font-bold text-[#FFFFEF]">Zero Preservatives</span>
            </div>

            <div className="flex items-center gap-[16px] flex-1 justify-center w-full md:w-auto py-2">
              <div className="bg-[#FFFFEF] w-[48px] h-[48px] rounded-full flex justify-center items-center text-[#C7230F] shadow-xs">
                <Truck size={20} className="text-[#C7230F]" />
              </div>
              <span className="text-[18px] font-bold text-[#FFFFEF]">Express 45-Min Doorstep</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TODAY'S FRESH KITCHEN MENU (24-HOUR ROTATING DAILY SPECIALS) ── */}
      <section className="py-12 md:py-20 bg-[#FFFFEF] border-y-2 border-[#C7230F]/15">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[50px]">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-4 py-2 rounded-full uppercase tracking-wider mb-3 shadow-md">
              <Clock size={13} className="text-[#FFFFEF]" />
              <span>TODAY'S KITCHEN SCHEDULE • {todayFormatted || todayDay}</span>
            </div>
            <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-[#C7230F] mb-3">
              Today's Fresh Menu
            </h2>
            <p className="text-xs sm:text-sm text-[#C7230F]/80 font-semibold leading-relaxed">
              As a dedicated home kitchen, our lunch & dinner menu rotates daily so every dish is prepared fresh from scratch on order. Here is what's cooking hot today:
            </p>
          </div>

          {/* 2 Main Daily Specials (Desi & Diet) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* 1. Today's Desi Special */}
            {todayDesi && (
              <div className="bg-white border-2 border-[#C7230F] rounded-[36px] p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <UtensilsCrossed size={13} />
                    <span>TODAY'S DESI SPECIAL</span>
                  </span>
                  <span className="text-xs font-black text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/30 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Cooked Every {todayDay}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5 items-center my-2">
                  <div className="relative w-full sm:w-[140px] h-[140px] rounded-2xl overflow-hidden bg-[#FFFFEF] border-2 border-[#C7230F]/20 shrink-0">
                    <Image
                      src={todayDesi.image_url || '/items/chicken-karahi.jpg'}
                      alt={todayDesi.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-2xl text-[#C7230F] leading-tight mb-2">
                      {todayDesi.name}
                    </h3>
                    <p className="text-xs text-[#C7230F]/80 font-medium leading-relaxed mb-3 line-clamp-2">
                      {todayPlan.desiTagline || todayDesi.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-[#C7230F]">
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Flame size={12} /> {todayDesi.calories} kcal
                      </span>
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Dumbbell size={12} /> {todayDesi.protein_g}g Protein
                      </span>
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={12} /> 100% Halal
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#C7230F]/15 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#C7230F]/70 uppercase">Price Today</div>
                    <div className="text-2xl font-black text-[#C7230F] leading-none">
                      {formatPrice(todayDesi.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/menu/${todayDesi.id}`}
                      className="text-xs font-black text-[#C7230F] bg-white border border-[#C7230F]/30 px-4 py-2.5 rounded-full hover:bg-[#FFFFEF] transition-all no-underline"
                    >
                      View Dish
                    </Link>
                    <button
                      onClick={() => {
                        addItem(todayDesi)
                        toast.success(`Added ${todayDesi.name} to cart!`)
                      }}
                      className="inline-flex items-center gap-2 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs px-6 py-3 rounded-full cursor-pointer border-none shadow-md hover:shadow-lg transition-all uppercase tracking-wider"
                    >
                      <ShoppingBag size={15} /> Order for Today
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Today's Diet Special (Brand Crimson & Off-White Palette - No Green!) */}
            {todayDiet && (
              <div className="bg-white border-2 border-[#C7230F] rounded-[36px] p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="bg-[#A31C0C] text-[#FFFFEF] font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Leaf size={13} />
                    <span>TODAY'S DIET SPECIAL</span>
                  </span>
                  <span className="text-xs font-black text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/30 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Cooked Every {todayDay}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5 items-center my-2">
                  <div className="relative w-full sm:w-[140px] h-[140px] rounded-2xl overflow-hidden bg-[#FFFFEF] border-2 border-[#C7230F]/20 shrink-0">
                    <Image
                      src={todayDiet.image_url || '/items/chicken-fajita-rice-bowl.jpg'}
                      alt={todayDiet.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-2xl text-[#C7230F] leading-tight mb-2">
                      {todayDiet.name}
                    </h3>
                    <p className="text-xs text-[#C7230F]/80 font-medium leading-relaxed mb-3 line-clamp-2">
                      {todayPlan.dietTagline || todayDiet.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-[#C7230F]">
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Flame size={12} /> {todayDiet.calories} kcal
                      </span>
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Dumbbell size={12} /> {todayDiet.protein_g}g Protein
                      </span>
                      <span className="bg-[#FFFFEF] border border-[#C7230F]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={12} /> High Protein
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#C7230F]/15 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#C7230F]/70 uppercase">Price Today</div>
                    <div className="text-2xl font-black text-[#C7230F] leading-none">
                      {formatPrice(todayDiet.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/menu/${todayDiet.id}`}
                      className="text-xs font-black text-[#C7230F] bg-white border border-[#C7230F]/30 px-4 py-2.5 rounded-full hover:bg-[#FFFFEF] transition-all no-underline"
                    >
                      View Dish
                    </Link>
                    <button
                      onClick={() => {
                        addItem(todayDiet)
                        toast.success(`Added ${todayDiet.name} to cart!`)
                      }}
                      className="inline-flex items-center gap-2 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs px-6 py-3 rounded-full cursor-pointer border-none shadow-md hover:shadow-lg transition-all uppercase tracking-wider"
                    >
                      <ShoppingBag size={15} /> Order for Today
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Everyday Breakfast Banner (Crimson & Off-White Palette) */}
          <div className="bg-white border-2 border-[#C7230F]/20 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md mb-8">
            <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center font-black text-2xl shrink-0 border border-[#C7230F]/20 shadow-xs">
                <Coffee size={28} className="text-[#C7230F]" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1 flex-wrap">
                  <span className="bg-[#C7230F] text-[#FFFFEF] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    AVAILABLE DAILY
                  </span>
                  <span className="text-xs font-bold text-[#C7230F]">
                    08:00 AM – 11:00 PM
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl sm:text-2xl text-[#C7230F] mb-1">
                  Desi Breakfast & Steaming Chai
                </h3>
                <p className="text-xs text-[#C7230F]/80 font-medium max-w-xl">
                  Cheese Omelets, Golden French Toast, Layered Paratha Anda Chai, and Stacked Pancakes are freshly cooked and available every day of the week!
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/menu?category=breakfast"
                className="bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-xs px-7 py-3.5 rounded-full uppercase tracking-wider no-underline shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>Order Breakfast</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Weekly Subscriptions Banner Footer */}
          <div className="text-center">
            <Link
              href="/deals"
              className="group inline-flex items-center gap-2 text-xs font-black text-[#C7230F] bg-white border-2 border-[#C7230F]/30 px-6 py-2.5 rounded-full hover:bg-[#C7230F] hover:text-[#FFFFEF] transition-all no-underline shadow-xs uppercase tracking-wider"
            >
              <span className="group-hover:text-[#FFFFEF] transition-colors">Want all 7 days planned? View Weekly Subscriptions on Deals Page</span>
              <ArrowRight size={14} className="group-hover:text-[#FFFFEF] transition-colors" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 md:py-24 bg-[#FFFFEF]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[50px]">
          <h2 className="font-serif font-black text-3xl md:text-4xl text-[#C7230F] text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <UtensilsCrossed size={22} />, title: '1. Pick Your Favorite Meal', desc: 'Browse our menu of authentic slow-cooked biryani, karahi, and freshly made wraps.' },
              { icon: <ShoppingBag size={22} />, title: '2. Customize & Apply Rewards', desc: 'Select portion sizes, customize your order, and apply your referral promo code for 10% OFF.' },
              { icon: <Truck size={22} />, title: '3. Express Hot Delivery', desc: 'Relax while our kitchen prepares your order fresh and delivers it piping hot in 45 minutes.' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border-2 border-[#C7230F]/20 rounded-2xl p-7 shadow-sm hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C7230F] flex items-center justify-center text-[#FFFFEF] mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-base text-[#C7230F] mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-[#C7230F]/80 leading-relaxed mb-4">{desc}</p>
                <Link href="/menu" className="text-xs font-bold text-[#C7230F] no-underline inline-flex items-center gap-1 hover:underline">
                  Explore Menu <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ITEMS ── */}
      <section className="py-16 md:py-24 bg-[#FFFFEF]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[50px]">
          <h2 className="font-serif font-black text-3xl md:text-4xl text-[#C7230F] text-center mb-12">
            Popular Items
          </h2>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-[#C7230F]/10 h-80 animate-pulse">
                  <div className="w-full h-44 bg-[#C7230F]/10 rounded-2xl mb-4" />
                  <div className="h-4 bg-[#C7230F]/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#C7230F]/10 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-[#C7230F]/10 border border-[#C7230F] rounded-2xl p-6 text-center text-[#C7230F] max-w-md mx-auto my-4">
              <p className="text-sm font-semibold mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-[#C7230F] text-[#FFFFEF] font-bold px-4 py-2 rounded-full cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Data List */}
          {!loading && !error && popular.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {!loading && !error && popular.length === 0 && (
            <div className="text-center py-10 text-[#C7230F]/80 font-medium">
              No featured items available right now.
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#C7230F] text-[#FFFFEF] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full no-underline shadow-lg hover:bg-[#A31C0C] transition-colors uppercase tracking-wider"
            >
              View Full Menu <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HERITAGE / KITCHEN SECTION ── */}
      <section className="relative my-8 sm:my-12">
        <div
          style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
          className="py-12 md:py-16 border-y border-[#C7230F] shadow-xl"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-[50px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14">
            
            {/* Left Content Column */}
            <div className="flex-1 text-center md:text-left">
              <span
                style={{ color: '#FFFFEF' }}
                className="inline-block font-black text-xs sm:text-sm tracking-widest uppercase mb-2 opacity-90"
              >
                AUTHENTIC PAKISTANI HERITAGE
              </span>

              <h2
                style={{ color: '#FFFFEF' }}
                className="font-serif font-black text-3xl sm:text-4xl leading-tight mb-4"
              >
                Cooked the Way It's Meant to Be
              </h2>

              <p
                style={{ color: '#FFFFEF' }}
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-6 max-w-xl font-normal opacity-90"
              >
                Generations of recipes, passed down and perfected. Every pot is slow-cooked with the same care as a home-cooked family meal — never rushed, never shortcut.
              </p>

              {/* 3 Bullet Features */}
              <div style={{ color: '#FFFFEF' }} className="flex flex-col gap-3 mb-8 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 justify-center md:justify-start font-bold">
                  <span style={{ backgroundColor: '#FFFFEF' }} className="w-2 h-2 rounded-full" />
                  <span style={{ color: '#FFFFEF' }}>Hand-picked spices — sourced from local markets</span>
                </div>
                <div className="flex items-center gap-2.5 justify-center md:justify-start font-bold">
                  <span style={{ backgroundColor: '#FFFFEF' }} className="w-2 h-2 rounded-full" />
                  <span style={{ color: '#FFFFEF' }}>Slow-cooked — every dish, hours in the making</span>
                </div>
                <div className="flex items-center gap-2.5 justify-center md:justify-start font-bold">
                  <span style={{ backgroundColor: '#FFFFEF' }} className="w-2 h-2 rounded-full" />
                  <span style={{ color: '#FFFFEF' }}>Zero shortcuts — nothing frozen, nothing rushed</span>
                </div>
              </div>

              <div>
                <Link
                  href="/menu"
                  style={{ color: '#C7230F', backgroundColor: '#FFFFEF' }}
                  className="inline-flex items-center gap-2 font-black text-xs sm:text-sm px-8 py-3.5 rounded-full no-underline shadow-lg hover:scale-105 transition-all uppercase tracking-wide border-2 border-[#FFFFEF]"
                >
                  <span style={{ color: '#C7230F', fontWeight: 900 }}>See Our Kitchen</span>
                  <ArrowRight size={16} style={{ color: '#C7230F' }} />
                </Link>
              </div>
            </div>

            {/* Right Food Showcase Image */}
            <div className="flex-none w-full md:w-80 lg:w-[380px] relative h-56 sm:h-64 md:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFFEF]">
              <Image
                src="/items/makhni-handi.jpg"
                alt="Slow Cooked Heritage Handi"
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── BIRYANI CTA BANNER (RESTORED HOOKED FEATURED SECTION) ── */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 bg-[#FFFFEF]">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#C7230F]/30 bg-cover bg-center p-6 sm:p-10 md:p-14 text-center"
            style={{ backgroundImage: "url('/biryani-cta-bg.jpg')" }}
          >
            {/* Crisp backdrop overlay for guaranteed text legibility */}
            <div
              style={{ backgroundColor: 'rgba(255, 255, 239, 0.94)' }}
              className="absolute inset-0 backdrop-blur-[1px] pointer-events-none"
            />

            {/* Floating Dynamic Starburst Badges */}
            <div className="absolute -top-2 left-0 sm:top-3 sm:left-3 md:top-4 md:left-6 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 -rotate-6 z-10">
              <StarburstBadge src="/items/chicken-biryani.jpg" alt="Chicken Biryani" id="tl" />
            </div>
            <div className="absolute -top-2 right-0 sm:top-3 sm:right-3 md:top-4 md:right-6 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rotate-12 z-10">
              <StarburstBadge src="/hero-plate.jpg" alt="Royal Biryani" id="tr" />
            </div>
            <div className="absolute -bottom-2 left-0 sm:bottom-3 sm:left-3 md:bottom-4 md:left-6 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rotate-6 z-10">
              <StarburstBadge src="/biryani.png" alt="Biryani Pot Dish" id="bl" />
            </div>
            <div className="absolute -bottom-2 right-0 sm:bottom-3 sm:right-3 md:bottom-4 md:right-6 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 -rotate-12 z-10">
              <StarburstBadge src="/items/chicken-biryani.jpg" alt="Special Chicken Biryani" id="br" />
            </div>

            {/* Central Content */}
            <div className="relative z-20 max-w-xl mx-auto px-10 sm:px-24 md:px-32 py-4 sm:py-6 flex flex-col items-center">
              <span
                style={{ color: '#C7230F' }}
                className="font-black text-[11px] sm:text-sm md:text-base tracking-widest uppercase mb-1"
              >
                ONE BITE & YOUR TASTE BUDS ARE
              </span>
              
              <h2
                style={{ color: '#C7230F' }}
                className="font-black text-4xl sm:text-6xl md:text-7xl tracking-tight mb-2 sm:mb-3 drop-shadow-sm select-none"
              >
                HOOKED!
              </h2>

              <p
                style={{ color: '#C7230F' }}
                className="text-xs sm:text-sm md:text-base leading-relaxed max-w-md mb-5 sm:mb-6 font-bold"
              >
                Fragrant basmati rice, tender slow-cooked chicken, and authentic royal spices. Once you open the box, there's no turning back.
              </p>

              <div>
                <Link
                  href="/menu"
                  style={{ color: '#FFFFEF', backgroundColor: '#C7230F' }}
                  className="inline-flex items-center gap-2 font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg hover:bg-[#A31C0C] transition-all transform hover:-translate-y-0.5 no-underline uppercase tracking-wide border-2 border-[#C7230F]"
                >
                  <span style={{ color: '#FFFFEF', fontWeight: 900 }}>ORDER YOUR POT NOW</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── REFERRAL BANNER ── */}
      <section className="py-12 md:py-20 bg-[#FFFFEF]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[50px] max-w-4xl">
          <div
            style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
            className="relative rounded-[2.5rem] p-8 sm:p-14 text-center shadow-2xl overflow-hidden border-2 border-white/20"
          >
            
            <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
              
              <div
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFEF' }}
                className="inline-flex items-center gap-2 border border-white/30 font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest mb-4"
              >
                <span>DUAL REWARDS REFERRAL PROGRAM</span>
              </div>

              <h2
                style={{ color: '#FFFFEF' }}
                className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
              >
                Refer a Friend, Double Rewards
              </h2>

              <p
                style={{ color: '#FFFFEF' }}
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-6 font-normal max-w-lg opacity-90"
              >
                Share your unique code with a friend. Your friend can use it to get <strong style={{ color: '#FFFFEF' }} className="font-extrabold">10% OFF</strong> their food order (earning you <strong style={{ color: '#FFFFEF' }} className="font-extrabold">20% OFF</strong>), or use it when signing up (giving both of you <strong style={{ color: '#FFFFEF' }} className="font-extrabold">10% OFF</strong>)!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full text-left">
                <div
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#FFFFEF' }}
                  className="p-4 rounded-2xl border"
                >
                  <div style={{ color: '#FFFFEF' }} className="font-bold text-xs uppercase tracking-wider mb-1">Option 1: Food Order</div>
                  <div style={{ color: '#FFFFEF' }} className="text-xs font-normal opacity-90">
                    Friend gets <strong>10% OFF</strong> order • You earn <strong>20% OFF</strong> reward
                  </div>
                </div>
                <div
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#FFFFEF' }}
                  className="p-4 rounded-2xl border"
                >
                  <div style={{ color: '#FFFFEF' }} className="font-bold text-xs uppercase tracking-wider mb-1">Option 2: Account Sign-Up</div>
                  <div style={{ color: '#FFFFEF' }} className="text-xs font-normal opacity-90">
                    Both of you receive <strong>10% OFF</strong> upon new registration
                  </div>
                </div>
              </div>

              <div>
                <Link
                  href="/coupons"
                  style={{ color: '#C7230F', backgroundColor: '#FFFFEF' }}
                  className="inline-flex items-center gap-2.5 font-black text-sm sm:text-base px-9 py-4 rounded-full no-underline shadow-2xl hover:scale-105 transition-all uppercase tracking-wide border-2 border-white/80"
                >
                  <span style={{ color: '#C7230F', fontWeight: 900 }}>Get Referral Code</span>
                  <ArrowRight size={18} style={{ color: '#C7230F' }} />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
        className="border-t border-[#C7230F] pt-12 md:pt-16 pb-8"
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-[50px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-[#FFFFEF]/20">
            <div>
              <div
                style={{ backgroundColor: '#FFFFEF' }}
                className="inline-block px-5 py-2.5 rounded-2xl mb-4 shadow-md border border-[#FFFFEF]/40"
              >
                <img src="/camos-logo-nobg.png" alt="Camo's Foods" className="h-10 md:h-12 w-auto object-contain" />
              </div>
              <div style={{ color: '#FFFFEF' }} className="flex flex-col gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold">
                  <Clock size={16} style={{ color: '#FFFFEF' }} className="shrink-0" />
                  <span style={{ color: '#FFFFEF' }}>Everyday 08:00 – 23:00</span>
                </div>
                <a
                  href="tel:03285286882"
                  style={{ color: '#FFFFEF' }}
                  className="flex items-center gap-2 font-black no-underline hover:underline"
                >
                  <Phone size={16} style={{ color: '#FFFFEF' }} className="shrink-0" />
                  <span style={{ color: '#FFFFEF' }}>0328 5286882</span>
                </a>
                <a
                  href="https://www.instagram.com/camosfoods?stkn=NHRuM3g5ZGRzYXR4"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#FFFFEF', color: '#C7230F' }}
                  className="inline-flex items-center gap-2 font-black text-xs px-4 py-2 rounded-xl no-underline hover:scale-105 transition-all w-fit shadow-xs mt-1 border border-[#FFFFEF]"
                >
                  <InstagramIcon size={16} style={{ color: '#C7230F' }} />
                  <span style={{ color: '#C7230F', fontWeight: 900 }}>@camosfoods on Instagram</span>
                </a>
              </div>
            </div>

            <div>
              <div style={{ color: '#FFFFEF' }} className="font-bold text-base mb-2">Newsletter</div>
              <p style={{ color: '#FFFFEF' }} className="text-xs sm:text-sm mb-4 leading-relaxed opacity-90">
                Get exclusive deals and new menu items first.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 flex-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  style={{ backgroundColor: '#FFFFEF', color: '#C7230F' }}
                  className="flex-1 min-w-[200px] border border-[#FFFFEF] font-bold rounded-full px-4 py-2.5 text-xs outline-none"
                />
                <button
                  type="submit"
                  style={{ color: '#C7230F', backgroundColor: '#FFFFEF' }}
                  className="font-black text-xs px-6 py-2.5 rounded-full border-none cursor-pointer hover:bg-white transition-colors"
                >
                  <span style={{ color: '#C7230F', fontWeight: 900 }}>Subscribe</span>
                </button>
              </form>
            </div>
          </div>

          <div style={{ color: '#FFFFEF' }} className="pt-4 border-t border-[#FFFFEF]/10 flex justify-between flex-wrap gap-2 text-xs opacity-80">
            <p style={{ color: '#FFFFEF' }}>© Camo's Foods 2025. All rights reserved.</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Use'].map((l) => (
                <a key={l} href="#" style={{ color: '#FFFFEF' }} className="no-underline hover:underline">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StarburstBadge({ src, alt, id, className = "" }: { src: string; alt: string; id: string; className?: string }) {
  const pathD = "M 50.00,2.00 L 59.83,12.78 L 74.00,10.60 L 76.88,24.81 L 90.60,26.00 L 86.60,39.83 L 98.00,50.00 L 86.60,60.17 L 90.60,74.00 L 76.88,75.19 L 74.00,89.40 L 59.83,87.22 L 50.00,98.00 L 40.17,87.22 L 26.00,89.40 L 23.12,75.19 L 9.40,74.00 L 13.40,60.17 L 2.00,50.00 L 13.40,39.83 L 9.40,26.00 L 23.12,24.81 L 26.00,10.60 L 40.17,12.78 Z";
  
  return (
    <div className={`relative filter drop-shadow-[0_4px_10px_rgba(199,35,15,0.25)] hover:scale-105 transition-transform duration-300 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id={`star-clip-${id}`}>
            <path d={pathD} />
          </clipPath>
        </defs>

        <path
          d={pathD}
          fill="#C7230F"
          stroke="#FFFFEF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <image
          href={src}
          x="3"
          y="3"
          width="94"
          height="94"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#star-clip-${id})`}
        />
      </svg>
    </div>
  );
}

function InstagramIcon({ size = 18, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}