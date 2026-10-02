'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, SlidersHorizontal, X, UtensilsCrossed } from 'lucide-react'
import { FoodItem, FOOD_CATEGORIES } from '@/lib/types'
import FoodCard from '@/components/ui/FoodCard'

export default function MenuPage() {
  const [items, setFilteredItems] = useState<FoodItem[]>([])
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'calories_asc'>('default')

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
    if (category !== 'all') {
      result = result.filter((i) => i.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
    if (sortBy === 'calories_asc') result.sort((a, b) => a.calories - b.calories)
    setFilteredItems(result)
  }, [allItems, category, search, sortBy])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#C7230F] tracking-tight mb-2">
            Our Menu
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#C7230F]/70">
            Fresh halal cuisine prepared daily with authentic home-style flavors.
          </p>
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
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="calories_asc">Calories: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all border-2 ${
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
          <div className="text-xs sm:text-sm font-bold text-[#C7230F]/70 mb-6">
            Showing {items.length} {items.length === 1 ? 'dish' : 'dishes'}
            {search && ` for "${search}"`}
            {category !== 'all' &&
              ` in ${FOOD_CATEGORIES.find((c) => c.value === category)?.label}`}
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
              Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategory('all')
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
