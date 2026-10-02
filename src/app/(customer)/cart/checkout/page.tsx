'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Tag, ShieldCheck, ShoppingBag, CreditCard, Banknote, QrCode, Copy, Check, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import AuthModal from '@/components/ui/AuthModal'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore((s) => s.total())
  const totalCal = useCartStore((s) => s.totalCalories())

  const [user, setUser] = useState<any>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'cod'>('jazzcash')
  const [transactionId, setTransactionId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [copiedNum, setCopiedNum] = useState(false)

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)

  const jazzcashNumber = '03040266618'
  const jazzcashName = 'Muhammad Ali'

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in')
        return res.json()
      })
      .then((data) => {
        if (data.data?.customer) {
          setUser(data.data.customer)
          if (data.data.customer.address) {
            setAddress(data.data.customer.address)
          }
        }
      })
      .catch(() => {
        setUser(null)
        setAuthModalOpen(true)
      })
  }, [])

  const copyAccountNum = () => {
    navigator.clipboard.writeText(jazzcashNumber)
    setCopiedNum(true)
    toast.success(`JazzCash Number ${jazzcashNumber} copied!`)
    setTimeout(() => setCopiedNum(false), 2000)
  }

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success('Payment screenshot selected!')
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid coupon')

      setAppliedCoupon(data.data)
      toast.success(`Coupon applied! Saved PKR ${data.data.discount_amount}`)
    } catch (err: any) {
      toast.error(err.message || 'Could not apply coupon')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const finalTotal = appliedCoupon ? Math.max(0, total - appliedCoupon.discount_amount) : total

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (!address.trim()) {
      toast.error('Please enter a delivery address')
      return
    }

    if (paymentMethod === 'jazzcash') {
      if (!transactionId.trim()) {
        toast.error('Please enter your 12-digit JazzCash Transaction ID (TID)')
        return
      }
      if (!proofFile && !proofPreview) {
        toast.error('Please upload your JazzCash transaction screenshot proof')
        return
      }
    }

    setLoadingOrder(true)

    try {
      const payload = {
        items: items.map((i) => ({
          food_item_id: i.food_item.id,
          quantity: i.quantity,
        })),
        delivery_address: address,
        notes: `[Payment Method: ${paymentMethod === 'jazzcash' ? 'JazzCash Direct' : 'Cash on Delivery (COD)'}] ${
          paymentMethod === 'jazzcash' ? `(JazzCash TID: ${transactionId.trim()})` : ''
        } ${notes.trim()}`,
        ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      toast.success(
        paymentMethod === 'jazzcash'
          ? 'Order placed! JazzCash payment proof submitted for verification.'
          : 'Order placed successfully! Cash on delivery.'
      )
      clearCart()
      router.push('/orders?success=true')
    } catch (err: any) {
      toast.error(err.message || 'Error processing checkout')
    } finally {
      setLoadingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#FFFFEF] min-h-screen flex flex-col items-center justify-center p-6 text-center text-[#C7230F] font-sans">
        <div className="w-20 h-20 bg-[#C7230F]/10 rounded-full flex items-center justify-center text-[#C7230F] mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-black mb-3">Your Cart is Empty</h1>
        <p className="text-sm font-bold text-[#C7230F]/70 mb-8">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/menu"
          className="bg-[#C7230F] text-[#FFFFEF] font-black text-sm px-8 py-3.5 rounded-full no-underline shadow-lg uppercase tracking-wider"
        >
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFFEF] min-h-screen text-[#C7230F] pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-12 font-sans">
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          fetch('/api/profile')
            .then((res) => res.json())
            .then((data) => {
              if (data.data?.customer) setUser(data.data.customer)
            })
        }}
      />

      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#C7230F] mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column — Details & Payment */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h2 className="font-extrabold text-lg text-[#C7230F]">
                  Delivery Address & Instructions
                </h2>
              </div>

              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete delivery address (Street, House/Apt No., Area, City)"
                className="w-full p-4 rounded-2xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-sm font-bold text-[#C7230F] outline-none focus:border-[#C7230F] mb-4"
              />

              <div>
                <label className="block text-xs font-black text-[#C7230F] mb-1.5 uppercase tracking-wider">
                  Order Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave at front gate, extra spicy..."
                  className="w-full p-3.5 rounded-xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-xs font-bold text-[#C7230F] outline-none focus:border-[#C7230F]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-[#C7230F]">
                    Select Payment Method
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/70">Choose JazzCash Direct Transfer or Cash on Delivery</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'jazzcash'
                      ? 'border-[#C7230F] bg-[#FFFFEF] shadow-xs'
                      : 'border-[#C7230F]/20 bg-white hover:border-[#C7230F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={22} className="text-[#C7230F]" />
                    <div>
                      <div className="font-black text-xs text-[#C7230F]">JazzCash Transfer / QR</div>
                      <div className="text-[11px] font-bold text-[#C7230F]/70">Direct Mobile Transfer</div>
                    </div>
                  </div>
                  {paymentMethod === 'jazzcash' && <Check size={16} className="text-[#C7230F]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-[#C7230F] bg-[#FFFFEF] shadow-xs'
                      : 'border-[#C7230F]/20 bg-white hover:border-[#C7230F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote size={22} className="text-[#C7230F]" />
                    <div>
                      <div className="font-black text-xs text-[#C7230F]">Cash & Carry / COD</div>
                      <div className="text-[11px] font-bold text-[#C7230F]/70">Pay Cash Upon Delivery</div>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && <Check size={16} className="text-[#C7230F]" />}
                </button>
              </div>

              {/* JAZZCASH BOX */}
              {paymentMethod === 'jazzcash' && (
                <div className="bg-[#C7230F] rounded-2xl p-6 text-[#FFFFEF] mb-4 shadow-xl border-2 border-white/20">
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/20 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#FFFFEF]" />
                      <span className="font-black text-xs tracking-wider uppercase">JazzCash Official Account</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-black">VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center mb-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[11px] text-[#FFFFEF]/80 font-black uppercase tracking-wider">Account Title Name</div>
                        <div className="font-black text-xl text-white">{jazzcashName}</div>
                      </div>

                      <div>
                        <div className="text-[11px] text-[#FFFFEF]/80 font-black uppercase tracking-wider">JazzCash Account Number</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-black text-2xl text-white tracking-widest bg-black/30 px-3 py-1 rounded-xl border border-white/20">
                            {jazzcashNumber}
                          </span>
                          <button
                            type="button"
                            onClick={copyAccountNum}
                            className="p-2 rounded-xl bg-[#FFFFEF] text-[#C7230F] cursor-pointer border-none font-black"
                          >
                            {copiedNum ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 text-center text-[#C7230F] shadow-md">
                      <div className="text-[10px] font-black text-[#C7230F] uppercase tracking-wider mb-2">
                        SCAN TO PAY VIA JAZZCASH APP
                      </div>
                      <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=03040266618`}
                          alt="JazzCash Scannable QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] font-bold text-[#C7230F]/70 mt-1.5">
                        JazzCash: {jazzcashNumber}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <div>
                      <label className="block text-xs font-black text-white mb-1.5 uppercase tracking-wider">
                        JazzCash Transaction ID (TID) *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'jazzcash'}
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter 12-digit TID e.g. 104829501928"
                        className="w-full p-3.5 rounded-xl bg-white text-[#C7230F] font-black text-sm outline-none placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-white mb-1.5 uppercase tracking-wider">
                        Upload Payment Screenshot Proof *
                      </label>
                      <div className="relative border-2 border-dashed border-white/40 hover:border-white rounded-xl p-4 bg-black/20 text-center transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          required={paymentMethod === 'jazzcash'}
                          onChange={handleProofChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-white font-black">
                          <Upload size={16} />
                          <span>{proofFile ? proofFile.name : 'Click to Upload Transaction Screenshot'}</span>
                        </div>
                      </div>

                      {proofPreview && (
                        <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-white/30">
                          <img src={proofPreview} alt="Payment Proof Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-[#FFFFEF] rounded-2xl p-4 border border-[#C7230F]/20 text-xs font-bold text-[#C7230F]">
                  <div className="font-black mb-1">Cash on Delivery / Cash & Carry</div>
                  <div>Pay cash to our delivery driver upon order arrival or at restaurant pickup counter.</div>
                </div>
              )}
            </div>

            {/* Promo Code Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C7230F]/10 text-[#C7230F] flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-[#C7230F]">
                    Promo or Referral Code
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/70">Enter your code to get 10% OFF your order</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CAMO4ZXKM"
                  className="flex-1 p-3.5 rounded-xl border-2 border-[#C7230F]/20 bg-[#FFFFEF] text-xs font-mono font-black text-[#C7230F] outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-[#C7230F] text-[#FFFFEF] font-black text-xs px-6 py-3.5 rounded-xl border-none cursor-pointer hover:bg-[#A31C0C] transition-colors disabled:opacity-50"
                >
                  {validatingCoupon ? 'Validating...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="mt-3 bg-[#FFFFEF] p-3 rounded-xl flex justify-between items-center text-xs border border-[#C7230F]/30">
                  <span className="font-extrabold text-[#C7230F]">
                    Code '{appliedCoupon.code}' Applied! (10% OFF)
                  </span>
                  <span className="font-black text-[#C7230F]">
                    - PKR {appliedCoupon.discount_amount}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingOrder}
              style={{ color: '#C7230F', backgroundColor: '#FFFFEF' }}
              className="w-full bg-[#FFFFEF] text-[#C7230F] font-black text-base py-4 rounded-full border-2 border-[#C7230F] shadow-xl hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2.5 uppercase tracking-wider"
            >
              {loadingOrder ? (
                'Processing Order...'
              ) : (
                <>
                  <CreditCard size={20} style={{ color: '#C7230F' }} />
                  <span style={{ color: '#C7230F', fontWeight: 900 }}>
                    Place Order ({formatPrice(finalTotal)})
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Right Column — Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-[#C7230F]/20 shadow-md sticky top-28">
            <h2 className="font-black text-xl text-[#C7230F] mb-4 pb-3 border-b border-[#C7230F]/15">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4 pb-4 border-b border-[#C7230F]/15">
              {items.map(({ food_item: item, quantity: qty }) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div>
                    <div className="font-black text-[#C7230F]">{item.name}</div>
                    <div className="text-[11px] font-bold text-[#C7230F]/70">Qty: {qty} × {formatPrice(item.price)}</div>
                  </div>
                  <div className="font-black text-[#C7230F]">
                    {formatPrice(item.price * qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-[#C7230F]/70 font-bold">
                <span>Subtotal</span>
                <span className="font-black text-[#C7230F]">{formatPrice(total)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#C7230F] font-extrabold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-black">- {formatPrice(appliedCoupon.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#C7230F]/70 font-bold">
                <span>Total Energy</span>
                <span className="font-black text-[#C7230F]">{totalCal} kcal</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#C7230F]/15">
              <span className="font-extrabold text-base text-[#C7230F]">Payable Total</span>
              <span className="font-black text-2xl text-[#C7230F]">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
