'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ArrowRight, Trash2, UtensilsCrossed } from 'lucide-react'
import { useFavoritesStore } from '@/store/favoritesStore'
import FoodCard from '@/components/ui/FoodCard'

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false)
  const favorites = useFavoritesStore((s) => s.items)
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FFFFEF] pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-10 w-48 bg-[#C7230F]/10 rounded-2xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white rounded-3xl animate-pulse border border-[#C7230F]/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFFEF] text-[#C7230F] pt-28 pb-16 px-4 sm:px-6 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#C7230F]/20 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C7230F]/10 text-[#C7230F] font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-2">
              <Heart size={14} className="fill-[#C7230F]" />
              <span>SAVED CRAVINGS</span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#C7230F]">
              My Favorite Dishes
            </h1>
            <p className="text-sm text-[#C7230F]/80 font-medium mt-1">
              Your personal selection of top Pakistani meals for quick ordering
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="inline-flex items-center gap-2 text-xs font-black text-[#C7230F] bg-white border border-[#C7230F]/25 px-4 py-2.5 rounded-xl hover:bg-[#C7230F] hover:text-[#FFFFEF] transition-colors cursor-pointer self-start md:self-auto shadow-xs"
            >
              <Trash2 size={14} />
              <span>Clear All Favorites</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-[#C7230F]/20 p-8 sm:p-16 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-[#C7230F]/10 text-[#C7230F] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#C7230F]/20">
              <Heart size={36} strokeWidth={1.8} />
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#C7230F] mb-3">
              No Favorite Dishes Yet
            </h2>
            <p className="text-xs sm:text-sm text-[#C7230F]/80 leading-relaxed mb-8 max-w-md mx-auto font-medium">
              Tap the heart icon on any food item to save your favorite biryani, karahi, and snacks here for quick 1-tap ordering.
            </p>
            <Link
              href="/menu"
              style={{ color: '#FFFFEF', backgroundColor: '#C7230F' }}
              className="inline-flex items-center gap-2 bg-[#C7230F] text-[#FFFFEF] font-black text-xs sm:text-sm px-8 py-3.5 rounded-full no-underline shadow-lg hover:bg-[#A31C0C] transition-colors uppercase tracking-wider border-2 border-[#C7230F]"
            >
              <span style={{ color: '#FFFFEF', fontWeight: 900 }}>Browse Full Menu</span>
              <ArrowRight size={16} style={{ color: '#FFFFEF' }} />
            </Link>
          </div>
        ) : (
          /* Food Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
