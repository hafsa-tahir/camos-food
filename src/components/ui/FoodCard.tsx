'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Plus, Minus, Calendar } from 'lucide-react'
import { FoodItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { getDishAvailability } from '@/lib/schedule'
import { toast } from 'sonner'

interface FoodCardProps {
  item: FoodItem
  discount?: number
}

export default function FoodCard({ item, discount }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const cartItems = useCartStore((s) => s.items)
  const cartItem = cartItems.find((i) => i.food_item.id === item.id)
  const qty = cartItem?.quantity || 0

  const toggleFav = useFavoritesStore((s) => s.toggleFavorite)
  const isFav = useFavoritesStore((s) => s.isFavorite(item.id))

  // Dynamic daily schedule availability
  const availability = getDishAvailability(item)
  const isAvailable = availability.isAvailableToday && item.status !== 'inactive'

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleFav(item)
    if (added) {
      toast.success(`Saved ${item.name} to Favorites`)
    } else {
      toast.info(`Removed ${item.name} from Favorites`)
    }
  }

  const add = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isAvailable) {
      toast.info(
        availability.cookedOnDay
          ? `"${item.name}" is cooked fresh on ${availability.cookedOnDay}s! Available every ${availability.cookedOnDay}.`
          : `"${item.name}" is not available today.`
      )
      return
    }
    addItem(item)
    toast.success(`Added ${item.name} to cart`)
  }

  const originalPrice = discount ? Math.round(item.price / (1 - discount / 100)) : null

  return (
    <Link href={`/menu/${item.id}`} className="no-underline text-inherit block">
      <div className={`bg-white rounded-[34px] p-3 pb-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 cursor-pointer font-sans flex flex-col group border ${isAvailable ? 'border-[#C7230F]/20' : 'border-gray-200'}`}>
        {/* Media Container */}
        <div className="relative h-[270px] bg-[#FFFFEF] rounded-3xl border border-[#C7230F]/15 overflow-hidden flex flex-col justify-between p-3.5 box-border">
          {/* Top Badges */}
          <div className="flex items-center gap-2 z-10 justify-between w-full flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {discount && discount > 0 ? (
                <span className="bg-[#C7230F] text-[#FFFFEF] text-xs font-black px-3.5 py-1.5 rounded-xl tracking-wide">
                  - {discount}%
                </span>
              ) : null}

              {/* Special / Breakfast / Category Badge */}
              {availability.isSpecialToday ? (
                <span className="bg-[#C7230F] text-[#FFFFEF] text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xs uppercase tracking-wide">
                  ✦ {availability.badgeLabel}
                </span>
              ) : availability.isBreakfast ? (
                <span className="bg-[#2E7D32] text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xs uppercase tracking-wide">
                  🍳 Daily Breakfast
                </span>
              ) : (
                <span className="bg-[#FFFFEF] text-[#C7230F] text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#C7230F]/20 shadow-xs capitalize">
                  {item.category || 'Special'}
                </span>
              )}
            </div>

            {/* NOT AVAILABLE Notice */}
            {!isAvailable && (
              <span className="bg-neutral-800/90 text-white font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md backdrop-blur-xs">
                {availability.cookedOnDay ? `ON ${availability.cookedOnDay.toUpperCase()}` : 'NOT AVAILABLE'}
              </span>
            )}
          </div>

          {/* Image & Overlay */}
          <div className="absolute inset-0 z-0">
            {item.image_url ? (
              <>
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? 'grayscale-[55%] opacity-75' : ''}`}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-[#C7230F] font-bold">Camo Foods</div>
            )}

            {/* Overlay Banner for Unavailable Items */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-4 text-center z-10">
                <span className="bg-[#C7230F] text-white font-black text-xs px-4 py-2 rounded-full uppercase tracking-wider shadow-xl border border-white/30 mb-1.5">
                  NOT AVAILABLE TODAY
                </span>
                {availability.cookedOnDay && (
                  <span className="bg-white/95 text-[#C7230F] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1">
                    <Calendar size={12} />
                    Available on {availability.cookedOnDay}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Row inside Media Box */}
          <div className="flex items-center justify-end w-full z-10 gap-2">
            <button
              onClick={handleHeartClick}
              aria-label="Favorites"
              className="w-11 h-11 bg-[#FFFFEF] rounded-2xl border border-[#C7230F]/20 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition-transform"
            >
              <Heart
                size={18}
                className={isFav ? 'fill-[#C7230F] stroke-[#C7230F]' : 'stroke-[#C7230F] fill-none'}
                strokeWidth={2}
              />
            </button>

            {!isAvailable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toast.info(
                    availability.cookedOnDay
                      ? `"${item.name}" is cooked fresh on ${availability.cookedOnDay}s! Available every ${availability.cookedOnDay}.`
                      : `"${item.name}" is not available today.`
                  )
                }}
                className="h-11 px-3.5 bg-neutral-900/90 text-white font-black text-[11px] rounded-2xl border border-white/20 cursor-pointer hover:bg-neutral-800 transition-colors uppercase tracking-wider shadow-md backdrop-blur-xs"
              >
                {availability.cookedOnDay ? `On ${availability.cookedOnDay}` : 'Not Available'}
              </button>
            ) : qty === 0 ? (
              <button
                onClick={add}
                aria-label="Add to cart"
                className="w-11 h-11 bg-[#C7230F] hover:bg-[#A31C0C] group/btn rounded-2xl border-none flex items-center justify-center cursor-pointer shadow-xs transition-colors"
              >
                <ShoppingBag size={18} className="stroke-[#FFFFEF] transition-colors" strokeWidth={2} />
              </button>
            ) : (
              <div
                className="h-11 bg-[#C7230F] rounded-2xl px-2 flex items-center gap-1.5"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    updateQty(item.id, qty - 1)
                  }}
                  className="w-5.5 h-5.5 bg-white/20 hover:bg-white/30 rounded-full text-[#FFFFEF] flex items-center justify-center border-none cursor-pointer"
                >
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <span className="text-[#FFFFEF] text-xs font-bold min-w-[14px] text-center">
                  {qty}
                </span>
                <button
                  onClick={add}
                  className="w-5.5 h-5.5 bg-[#FFFFEF] rounded-full text-[#C7230F] flex items-center justify-center border-none cursor-pointer font-bold"
                >
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Details */}
        <div className="mt-4 px-1 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[11px] font-extrabold text-[#C7230F] tracking-wider uppercase">
                CAMO'S · {item.category || 'SPECIAL'}
              </span>
              {availability.isSpecialToday ? (
                <span className="text-[10px] font-black text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/30 px-2 py-0.5 rounded-md">
                  🟢 Available Today
                </span>
              ) : availability.isBreakfast ? (
                <span className="text-[10px] font-black text-[#2E7D32] bg-[#2E7D32]/10 border border-[#2E7D32]/30 px-2 py-0.5 rounded-md">
                  🍳 Fresh Daily
                </span>
              ) : availability.cookedOnDay ? (
                <span className="text-[10px] font-black text-neutral-600 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-md">
                  📅 {availability.cookedOnDay}
                </span>
              ) : null}
            </div>
            <div className="text-lg font-extrabold text-[#C7230F] leading-tight truncate">
              {item.name}
            </div>
            {item.description && (
              <p className="text-xs text-[#C7230F]/70 leading-snug mt-0.5 line-clamp-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-xl font-black text-[#C7230F] leading-none">
              {formatPrice(item.price)}
            </div>
            {originalPrice && (
              <div className="text-xs text-[#C7230F]/40 line-through mt-0.5">
                {formatPrice(originalPrice)}
              </div>
            )}
            <div className="text-[11px] font-bold text-[#C7230F]/70 mt-0.5">
              {item.calories ? `${item.calories} kcal` : 'Fresh Daily'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
