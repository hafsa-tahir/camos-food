'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Plus, Minus, Flame, Beef, Wheat, Droplets, Clock, Truck, ShieldCheck, UtensilsCrossed } from 'lucide-react'
import { FoodItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { toast } from 'sonner'
import { REAL_MENU_ITEMS } from '@/lib/menuData'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const addItem = useCartStore((s) => s.addItem)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const cartItems = useCartStore((s) => s.items)

  const [item, setItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const toggleFav = useFavoritesStore((s) => s.toggleFavorite)
  const isFav = useFavoritesStore((s) => s.isFavorite(id))

  const cartItem = cartItems.find((i) => i.food_item.id === id)
  const qty = cartItem?.quantity || 0

  useEffect(() => {
    const local = REAL_MENU_ITEMS.find((i) => i.id === id)
    if (local) {
      setItem(local)
      if (local.variants && local.variants.length > 0) {
        setSelectedVariant(local.variants[0].name)
      }
      setLoading(false)
      return
    }

    fetch(`/api/menu/${id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setItem(data)
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0].name)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="bg-[#FFFFEF] min-h-screen flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C7230F]/20 border-t-[#C7230F] rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="bg-[#FFFFEF] min-h-screen flex flex-col items-center justify-center gap-4 p-6 font-sans text-center text-[#C7230F]">
        <div className="w-16 h-16 bg-[#C7230F]/10 rounded-full flex items-center justify-center text-[#C7230F]">
          <UtensilsCrossed size={32} />
        </div>
        <h1 className="text-2xl font-black">Dish Not Found</h1>
        <Link
          href="/menu"
          className="bg-[#C7230F] text-[#FFFFEF] px-7 py-3 rounded-full font-black text-sm no-underline shadow-md hover:bg-[#A31C0C] transition-colors"
        >
          Back to Menu
        </Link>
      </div>
    )
  }

  const originalPrice = Math.round(item.price * 1.25)
  const discountPercent = 20
  const totalMacros = item.protein_g + item.carbs_g + item.fat_g
  const proteinPct = totalMacros > 0 ? Math.round((item.protein_g / totalMacros) * 100) : 0
  const carbsPct = totalMacros > 0 ? Math.round((item.carbs_g / totalMacros) * 100) : 0
  const fatPct = totalMacros > 0 ? Math.round((item.fat_g / totalMacros) * 100) : 0

  const add = () => {
    addItem(item)
    toast.success(`Added ${item.name} to cart${selectedVariant ? ` (${selectedVariant})` : ''}`)
  }

  const related = REAL_MENU_ITEMS.filter(
    (i) => i.category === item.category && i.id !== item.id
  ).slice(0, 3)

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-28 pb-16 font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-white border-2 border-[#C7230F]/20 rounded-full px-5 py-2.5 cursor-pointer font-black text-xs sm:text-sm text-[#C7230F] hover:border-[#C7230F] transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12">
          {/* Left: Product Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-[#C7230F]/20 aspect-square max-h-[500px] shadow-lg">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#C7230F] font-black text-2xl">
                Camo's Foods
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <span className="bg-[#C7230F] text-[#FFFFEF] text-xs font-black px-3.5 py-1.5 rounded-xl">
                -{discountPercent}%
              </span>
              <span className="bg-[#FFFFEF] text-[#C7230F] text-xs font-black px-3.5 py-1.5 rounded-xl border border-[#C7230F]/20 capitalize">
                {item.category}
              </span>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (item) {
                  const added = toggleFav(item)
                  if (added) toast.success(`Saved ${item.name} to Favorites`)
                  else toast.info(`Removed ${item.name} from Favorites`)
                }
              }}
              aria-label="Favorites"
              className="absolute top-4 right-4 z-10 w-11 h-11 bg-[#FFFFEF] rounded-2xl border border-[#C7230F]/20 flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
            >
              <Heart
                size={20}
                className={isFav ? 'fill-[#C7230F] stroke-[#C7230F]' : 'stroke-[#C7230F] fill-none'}
              />
            </button>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[#C7230F] tracking-widest uppercase">
                CAMO'S · {item.category}
              </span>
              {item.tags && item.tags.length > 0 && (
                <span className="text-[11px] font-extrabold text-[#C7230F] bg-white border border-[#C7230F]/20 px-3 py-1 rounded-md">
                  ✦ {item.tags[0]}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C7230F] leading-tight">
              {item.name}
            </h1>

            {item.description && (
              <p className="text-sm sm:text-base text-[#C7230F]/80 leading-relaxed font-medium">
                {item.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#C7230F]">
                {formatPrice(item.price)}
              </span>
              <span className="text-base font-bold text-[#C7230F]/40 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="bg-[#C7230F]/10 text-[#C7230F] text-xs font-black px-3 py-1 rounded-full border border-[#C7230F]/20">
                Save {formatPrice(originalPrice - item.price)}
              </span>
            </div>

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div>
                <div className="text-xs font-black text-[#C7230F] uppercase tracking-wider mb-2">
                  Select Flavor / Option
                </div>
                <div className="flex gap-2 flex-wrap">
                  {item.variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariant(v.name)}
                      className={`px-4 py-2.5 rounded-full text-xs font-black border-2 transition-all cursor-pointer ${
                        selectedVariant === v.name
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F] shadow-md'
                          : 'bg-white text-[#C7230F] border-[#C7230F]/20 hover:border-[#C7230F]'
                      }`}
                    >
                      {v.name}
                      {v.price ? ` (+${formatPrice(v.price)})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex items-center gap-4 mt-2">
              {qty === 0 ? (
                <button
                  onClick={add}
                  className="inline-flex items-center gap-3 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] px-8 py-4 rounded-full font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border-none uppercase tracking-wider"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              ) : (
                <div className="h-12 bg-[#C7230F] rounded-full px-3 flex items-center gap-3">
                  <button
                    onClick={() => updateQty(item.id, qty - 1)}
                    className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full text-[#FFFFEF] flex items-center justify-center border-none cursor-pointer"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="text-[#FFFFEF] text-sm font-black min-w-[20px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={add}
                    className="w-7 h-7 bg-[#FFFFEF] rounded-full text-[#C7230F] flex items-center justify-center border-none cursor-pointer font-black"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: ShieldCheck, label: '100% Halal', sub: 'Verified' },
                { icon: Clock, label: 'Fresh Daily', sub: 'Slow Cooked' },
                { icon: Truck, label: 'Fast Delivery', sub: 'Under 45 min' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="bg-white border-2 border-[#C7230F]/15 rounded-2xl p-3 text-center"
                >
                  <f.icon size={20} className="text-[#C7230F] mx-auto mb-1" />
                  <div className="text-xs font-black text-[#C7230F]">{f.label}</div>
                  <div className="text-[10px] font-bold text-[#C7230F]/60">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Section */}
        <div className="bg-white rounded-3xl border-2 border-[#C7230F]/20 p-6 sm:p-10 mb-12 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-[#C7230F] mb-6">
            Nutrition & Macros
          </h2>

          <div className="flex items-center gap-4 bg-[#C7230F]/10 border border-[#C7230F]/20 rounded-2xl p-5 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#C7230F] flex items-center justify-center text-[#FFFFEF]">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#C7230F]">{item.calories} kcal</div>
              <div className="text-xs font-bold text-[#C7230F]/70">Energy per serving</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFFEF] border-2 border-[#C7230F]/20 rounded-2xl p-4 text-center">
              <Beef size={22} className="text-[#C7230F] mx-auto mb-2" />
              <div className="text-xl font-black text-[#C7230F]">{item.protein_g}g</div>
              <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider">PROTEIN</div>
            </div>

            <div className="bg-[#FFFFEF] border-2 border-[#C7230F]/20 rounded-2xl p-4 text-center">
              <Wheat size={22} className="text-[#C7230F] mx-auto mb-2" />
              <div className="text-xl font-black text-[#C7230F]">{item.carbs_g}g</div>
              <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider">CARBS</div>
            </div>

            <div className="bg-[#FFFFEF] border-2 border-[#C7230F]/20 rounded-2xl p-4 text-center">
              <Droplets size={22} className="text-[#C7230F] mx-auto mb-2" />
              <div className="text-xl font-black text-[#C7230F]">{item.fat_g}g</div>
              <div className="text-xs font-black text-[#C7230F]/70 uppercase tracking-wider">FAT</div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#C7230F] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} href={`/menu/${r.id}`} className="no-underline text-inherit block">
                  <div className="bg-white rounded-3xl p-3 border-2 border-[#C7230F]/20 shadow-xs hover:shadow-md transition-all">
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-3">
                      {r.image_url && (
                        <Image src={r.image_url} alt={r.name} fill className="object-cover" unoptimized />
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-[#C7230F] truncate mb-1">{r.name}</div>
                    <div className="font-black text-base text-[#C7230F]">{formatPrice(r.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
