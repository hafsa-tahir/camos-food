'use client'

import { useCartStore } from '@/store/cartStore'
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore((s) => s.total())
  const totalCal = useCartStore((s) => s.totalCalories())

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 98,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .25s',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '95vw',
          background: '#FAFAFA',
          zIndex: 99,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .3s cubic-bezier(.22,.61,.36,1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 48px rgba(199,35,15,.25)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#C7230F',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-[#C7230F]/15 flex items-center justify-between">
          <div>
            <div className="font-black text-xl text-[#C7230F]">Your Cart</div>
            <div className="text-xs font-bold text-[#C7230F]/70 mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} · {totalCal} kcal
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white border-2 border-[#C7230F]/20 rounded-xl flex items-center justify-center cursor-pointer text-[#C7230F]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-[#C7230F]/10 rounded-full flex items-center justify-center text-[#C7230F] mx-auto mb-4">
                <ShoppingBag size={32} />
              </div>
              <div className="font-black text-lg text-[#C7230F] mb-2">Your cart is empty</div>
              <div className="text-xs font-bold text-[#C7230F]/70 mb-6">Add some delicious food to get started</div>
              <button
                onClick={onClose}
                className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-6 py-3 rounded-full border-none cursor-pointer uppercase tracking-wider"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(({ food_item: item, quantity: qty }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 flex gap-3.5 items-center border-2 border-[#C7230F]/15 shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-[#FFFFEF] border border-[#C7230F]/15">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#C7230F] font-black text-[10px]">
                        Camo's
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-[#C7230F] truncate mb-0.5">
                      {item.name}
                    </div>
                    <div className="text-[11px] font-bold text-[#C7230F]/70 mb-2">
                      {item.calories} kcal each
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-[#C7230F]">
                        {formatPrice(item.price * qty)}
                      </div>
                      <div className="flex items-center gap-2 bg-[#FFFFEF] border border-[#C7230F]/20 rounded-full px-2 py-1">
                        <button
                          onClick={() => (qty === 1 ? removeItem(item.id) : updateQty(item.id, qty - 1))}
                          className="w-6 h-6 bg-white border border-[#C7230F]/20 rounded-full flex items-center justify-center cursor-pointer text-[#C7230F]"
                        >
                          <Minus size={11} strokeWidth={2.5} />
                        </button>
                        <span className="font-black text-xs text-[#C7230F] min-w-[16px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, qty + 1)}
                          className="w-6 h-6 bg-[#C7230F] rounded-full flex items-center justify-center cursor-pointer text-[#FFFFEF] border-none"
                        >
                          <Plus size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t-2 border-[#C7230F]/15 bg-[#FFFFEF]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-extrabold text-sm text-[#C7230F]/80">Total</span>
              <span className="font-black text-2xl text-[#C7230F]">{formatPrice(total)}</span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-[#C7230F] hover:bg-[#A31C0C] text-[#FFFFEF] font-black text-sm py-4 rounded-full no-underline shadow-lg uppercase tracking-wider w-full"
            >
              Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
