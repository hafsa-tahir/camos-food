'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Plus, Minus } from 'lucide-react'
import { FoodItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
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
    addItem(item)
    toast.success(`Added ${item.name} to cart`)
  }

  const originalPrice = discount ? Math.round(item.price / (1 - discount / 100)) : null

  return (
    <Link href={`/menu/${item.id}`} className="no-underline text-inherit block">
      <div className="bg-white rounded-[34px] p-3 pb-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 cursor-pointer font-sans flex flex-col group border border-[#C7230F]/15">
        {/* Media Container */}
        <div className="relative h-[270px] bg-[#FFFFEF] rounded-3xl border border-[#C7230F]/15 overflow-hidden flex flex-col justify-between p-3.5 box-border">
          {/* Top Badges */}
          <div className="flex items-center gap-2 z-10 justify-between w-full">
            <div className="flex items-center gap-2">
              {discount && discount > 0 ? (
                <span className="bg-[#C7230F] text-[#FFFFEF] text-xs font-black px-3.5 py-1.5 rounded-xl tracking-wide">
                  - {discount}%
                </span>
              ) : null}
              <span className="bg-[#FFFFEF] text-[#C7230F] text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-[#C7230F]/20 shadow-xs capitalize">
                {item.category || 'Special'}
              </span>
            </div>

            {item.status === 'inactive' && (
              <span className="bg-red-700 text-white font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md z-20">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Image */}
          <div className="absolute inset-0 z-0">
            {item.image_url ? (
              <>
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${item.status === 'inactive' ? 'grayscale opacity-60' : ''}`}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30 pointer-events-none" />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-[#C7230F] font-bold">Camo Foods</div>
            )}

            {item.status === 'inactive' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="bg-red-600 text-white font-black text-xs px-4 py-2 rounded-full uppercase tracking-widest border border-white/40 shadow-xl">
                  OUT OF STOCK
                </span>
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

            {item.status === 'inactive' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toast.error(`"${item.name}" is currently OUT OF STOCK.`)
                }}
                className="h-11 px-4 bg-gray-400 text-white font-black text-[11px] rounded-2xl border-none cursor-not-allowed uppercase tracking-wider"
              >
                OUT OF STOCK
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
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => updateQty(item.id, qty - 1)}
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
              {item.tags && item.tags.length > 0 && (
                <span className="text-[10px] font-bold text-[#C7230F] bg-[#FFFFEF] border border-[#C7230F]/20 px-2 py-0.5 rounded-md">
                  ✦ {item.tags[0]}
                </span>
              )}
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
