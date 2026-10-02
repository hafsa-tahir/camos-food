'use client'

import { useCartStore } from '@/store/cartStore'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const update = useCartStore((s) => s.updateQuantity)
  const remove = useCartStore((s) => s.removeItem)
  const total = useCartStore((s) => s.total())
  const totalCal = useCartStore((s) => s.totalCalories())

  if (items.length === 0) {
    return (
      <div className="bg-[#FFFFEF] min-h-screen flex flex-col items-center justify-center p-6 text-center text-[#C7230F] font-sans">
        <div className="w-20 h-20 bg-[#C7230F]/10 rounded-full flex items-center justify-center text-[#C7230F] mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">Your Cart is Empty</h1>
        <p className="text-sm font-bold text-[#C7230F]/70 mb-8 max-w-sm">
          Add some delicious gourmet halal dishes to get started with your order.
        </p>
        <Link
          href="/menu"
          className="bg-[#C7230F] text-[#FFFFEF] font-black text-sm px-8 py-3.5 rounded-full no-underline shadow-lg hover:bg-[#A31C0C] transition-colors uppercase tracking-wider"
        >
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C7230F] mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Cart Items List */}
          <div className="flex flex-col gap-4">
            {items.map(({ food_item: item, quantity: qty }) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-center border-2 border-[#C7230F]/20 shadow-xs"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative bg-[#FFFFEF] border border-[#C7230F]/20">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#C7230F] font-black text-xs">
                      Camo's
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div className="font-extrabold text-lg text-[#C7230F] mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs font-bold text-[#C7230F]/70 mb-4">
                    {item.calories} kcal · {item.category}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-[#FFFFEF] border-2 border-[#C7230F]/20 rounded-full px-3 py-1.5">
                      <button
                        onClick={() => update(item.id, qty - 1)}
                        className="w-7 h-7 bg-white border border-[#C7230F]/20 rounded-full flex items-center justify-center cursor-pointer text-[#C7230F]"
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="font-black text-sm text-[#C7230F] min-w-[20px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => update(item.id, qty + 1)}
                        className="w-7 h-7 bg-[#C7230F] rounded-full flex items-center justify-center cursor-pointer text-[#FFFFEF] border-none"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="font-black text-xl text-[#C7230F]">
                      {formatPrice(item.price * qty)}
                    </div>

                    <button
                      onClick={() => remove(item.id)}
                      className="bg-none border-none cursor-pointer flex items-center gap-1.5 text-[#C7230F]/70 hover:text-[#C7230F] text-xs font-extrabold"
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#C7230F]/20 shadow-md sticky top-28">
            <h2 className="font-black text-xl text-[#C7230F] mb-6 border-b border-[#C7230F]/15 pb-4">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-[#C7230F]/15 text-sm">
              {items.map(({ food_item: item, quantity: qty }) => (
                <div key={item.id} className="flex justify-between font-bold">
                  <span className="text-[#C7230F]/80">
                    {item.name} × {qty}
                  </span>
                  <span className="text-[#C7230F]">
                    {formatPrice(item.price * qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mb-3 text-sm">
              <span className="font-bold text-[#C7230F]/70">Total Energy</span>
              <span className="font-black text-[#C7230F]">{totalCal} kcal</span>
            </div>

            <div className="flex justify-between mb-8 text-lg">
              <span className="font-black text-[#C7230F]">Total</span>
              <span className="font-black text-2xl text-[#C7230F]">
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/cart/checkout"
              className="flex items-center justify-center gap-2 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-sm py-4 rounded-full no-underline shadow-lg transition-all uppercase tracking-wider"
            >
              Checkout <ArrowRight size={18} />
            </Link>

            <div className="text-center mt-4 text-xs font-bold text-[#C7230F]/70">
              Free home delivery on orders above PKR 1,000
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
