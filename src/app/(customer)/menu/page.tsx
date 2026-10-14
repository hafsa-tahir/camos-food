'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, UtensilsCrossed, Calendar, CheckCircle2, Clock, Leaf, Sparkles } from 'lucide-react'
import { FoodItem, FOOD_CATEGORIES } from '@/lib/types'
import FoodCard from '@/components/ui/FoodCard'
import {
  getDishAvailability,
  getPakistanDayOfWeek,
  getPakistanFormattedDate,
  WEEKLY_SCHEDULE,
  DayOfWeek,
} from '@/lib/schedule'

function MenuContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [items, setFilteredItems] = useState<FoodItem[]>([])
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'calories_asc'>('default')
  const [availabilityMode, setAvailabilityMode] = useState<'all' | 'today_only'>('all')

  const [todayDay, setTodayDay] = useState<DayOfWeek>('Monday')
  const [todayFormatted, setTodayFormatted] = useState('')

  useEffect(() => {
    setTodayDay(getPakistanDayOfWeek())
    setTodayFormatted(getPakistanFormattedDate())
  }, [])

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then(({ data }) => {
        const menuData = (data?.items || []).filter(
          (i: FoodItem) => i.category !== 'subscription' && !i.name.toLowerCase().includes('plan')
        )
        setAllItems(menuData)
        setFilteredItems(menuData)
      })
      .catch((err) => console.error('Menu load error:', err))
      .finally(() => setLoading(false))
  }, [])

  const applyFilters = useCallback(() => {
    let result = [...allItems]

    // Availability Filter (Only Available Today vs All)
    if (availabilityMode === 'today_only') {
      result = result.filter((i) => {
        const avail = getDishAvailability(i, todayDay)
        return avail.isAvailableToday && i.status !== 'inactive'
      })
    }

    // Category Filter
    if (category !== 'all') {
      result = result.filter((i) => i.category === category)
    }

    // Search Query Filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'calories_asc') {
      result.sort((a, b) => a.calories - b.calories)
    } else {
      // Default: 1. Today's Specials (Desi & Diet) FIRST, then Daily Breakfast, then other dishes
      result.sort((a, b) => {
        const availA = getDishAvailability(a, todayDay)
        const availB = getDishAvailability(b, todayDay)

        const priorityA = availA.isSpecialToday ? 3 : availA.isBreakfast ? 2 : 1
        const priorityB = availB.isSpecialToday ? 3 : availB.isBreakfast ? 2 : 1

        if (priorityB !== priorityA) {
          return priorityB - priorityA
        }

        return (a.sort_order ?? 99) - (b.sort_order ?? 99)
      })
    }

    setFilteredItems(result)
  }, [allItems, category, search, sortBy, availabilityMode, todayDay])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const todayPlan = WEEKLY_SCHEDULE[todayDay]
  const todayAvailableCount = allItems.filter(
    (i) => getDishAvailability(i, todayDay).isAvailableToday && i.status !== 'inactive'
  ).length

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              LIVE SCHEDULE • {todayFormatted || todayDay}
            </span>
            <span className="bg-white text-[#C7230F] border border-[#C7230F]/20 font-bold text-xs px-3 py-1 rounded-full">
              Home Kitchen Operating Hours: 08:00 – 23:00
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#C7230F] tracking-tight mb-2">
            Our Menu & Daily Schedule
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#C7230F]/70 max-w-2xl">
            Because everything is prepared fresh from scratch, our kitchen features <strong>2 signature rotating specials today</strong> alongside our <strong>everyday fresh breakfast menu</strong>. Other dishes are prepared on their designated days.
          </p>
        </div>

        {/* Daily Schedule Notice Banner */}
        <div className="bg-white border-2 border-[#C7230F]/20 rounded-3xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center font-black shrink-0">
              <Calendar size={22} className="text-[#C7230F]" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#C7230F] flex items-center gap-2 flex-wrap">
                <span>Cooking Today ({todayDay}):</span>
                <span className="bg-[#C7230F]/10 text-[#C7230F] px-2.5 py-0.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5">
                  <UtensilsCrossed size={12} />
                  <span>{todayPlan.desiDishName}</span>
                </span>
                <span>&</span>
                <span className="bg-[#C7230F]/10 text-[#C7230F] px-2.5 py-0.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5">
                  <Leaf size={12} />
                  <span>{todayPlan.dietDishName}</span>
                </span>
                <span>+ All Breakfast</span>
              </div>
              <div className="text-xs text-[#C7230F]/70 font-semibold mt-0.5">
                Items not scheduled for today are clearly marked with their scheduled day and cannot be ordered today.
              </div>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setAvailabilityMode('today_only')
                setCategory('all')
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-full text-xs font-black transition-all border-2 cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                availabilityMode === 'today_only'
                  ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-sm'
                  : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30 hover:border-[#C7230F]'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Available Today ({todayAvailableCount})</span>
            </button>
            <button
              onClick={() => {
                setAvailabilityMode('all')
                setCategory('all')
              }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-full text-xs font-black transition-all border-2 cursor-pointer ${
                availabilityMode === 'all'
                  ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-sm'
                  : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30 hover:border-[#C7230F]'
              }`}
            >
              Full Menu ({allItems.length})
            </button>
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7230F]/60 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, ingredients, or tags..."
              className="w-full bg-white border-2 border-[#C7230F]/20 rounded-2xl pl-11 pr-11 py-3 text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#C7230F]/60 hover:text-[#C7230F]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <SlidersHorizontal
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7230F]/60 pointer-events-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full sm:w-auto bg-white border-2 border-[#C7230F]/20 rounded-2xl pl-11 pr-8 py-3 text-xs sm:text-sm font-black text-[#C7230F] outline-none cursor-pointer appearance-none focus:border-[#C7230F]"
            >
              <option value="default">Sort: Available Today First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="calories_asc">Calories: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => {
              setAvailabilityMode('today_only')
              setCategory('all')
            }}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-2 inline-flex items-center gap-1.5 cursor-pointer ${
              availabilityMode === 'today_only' && category === 'all'
                ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-md'
                : 'bg-white text-[#C7230F] border-[#C7230F]/20 hover:border-[#C7230F]'
            }`}
          >
            <Sparkles size={14} />
            <span>Today's Menu ({todayAvailableCount})</span>
          </button>
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = availabilityMode === 'all' && category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setAvailabilityMode('all')
                  setCategory(cat.value)
                }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-md'
                    : 'bg-white text-[#C7230F] border-[#C7230F]/20 hover:border-[#C7230F]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Result Counter */}
        {!loading && (
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-bold text-[#C7230F]/70 mb-6">
            <div>
              Showing {items.length} {items.length === 1 ? 'dish' : 'dishes'}
              {availabilityMode === 'today_only' ? ' (available today)' : ''}
              {search && ` for "${search}"`}
              {category !== 'all' &&
                ` in ${FOOD_CATEGORIES.find((c) => c.value === category)?.label}`}
            </div>
            {availabilityMode === 'all' && (
              <div className="text-[11px] font-semibold text-[#C7230F]/70 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[#C7230F]">
                  <CheckCircle2 size={12} />
                  <span>Available Today: {todayAvailableCount}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-neutral-600">
                  <Calendar size={12} />
                  <span>Scheduled for other days: {items.length - todayAvailableCount}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-[#C7230F]/15 h-96 animate-pulse"
              >
                <div className="w-full h-56 bg-[#C7230F]/10 rounded-2xl mb-4" />
                <div className="h-4 bg-[#C7230F]/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#C7230F]/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-[#C7230F]/20 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-[#C7230F]/10 rounded-full flex items-center justify-center text-[#C7230F] mx-auto mb-4">
              <UtensilsCrossed size={32} />
            </div>
            <h3 className="font-extrabold text-lg text-[#C7230F] mb-2">No dishes found</h3>
            <p className="text-xs text-[#C7230F]/70 mb-6 font-medium">
              {availabilityMode === 'today_only'
                ? "There are no dishes matching your current filter on today's schedule. Switch to 'Full Menu' to see the whole week."
                : 'Try adjusting your search query or selecting a different category.'}
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategory('all')
                setAvailabilityMode('all')
              }}
              className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-6 py-3 rounded-full cursor-pointer hover:bg-[#A31C0C] transition-colors uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FFFFEF] min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#C7230F]/20 border-t-[#C7230F] rounded-full animate-spin" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  )
}
