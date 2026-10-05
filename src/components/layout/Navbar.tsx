'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Heart, UtensilsCrossed, Menu, X, Sparkles, Tag, ShoppingCart, Award, ShieldAlert } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useState, useEffect } from 'react'
import CartDrawer from '@/components/ui/CartDrawer'

const BASE_NAV = [
  { href: '/', label: 'Home', icon: UtensilsCrossed },
  { href: '/menu', label: 'Menu', icon: ShoppingCart },
  { href: '/deals', label: 'Deals', icon: Tag },
  { href: '/coupons', label: 'Rewards', icon: Award },
]

export default function Navbar() {
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.itemCount())
  const favCount = useFavoritesStore((s) => s.items.length)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    setMounted(true)
    fetch('/api/profile')
      .then((r) => r.json())
      .then((res) => {
        const email = res.data?.customer?.email?.toLowerCase() || ''
        if (res.data?.customer?.role === 'admin' || email.includes('camosfoodapp') || email === 'admin@camosfoods.com') {
          setIsAdminUser(true)
        }
      })
      .catch(() => {})
  }, [])

  const navItems = isAdminUser
    ? [...BASE_NAV, { href: '/admin', label: 'Admin Dashboard', icon: ShieldAlert }]
    : BASE_NAV

  return (
    <>
      {/* Navbar with matching #FAFAFA Off-White background & Crimson #C7230F elements */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA] h-16 sm:h-20 md:h-24 flex items-center border-b border-[#C7230F]/15 transition-all max-w-full overflow-hidden">
        <div className="container mx-auto px-3 sm:px-6 md:px-12 flex items-center justify-between h-full w-full">
          {/* Transparent Logo without background */}
          <Link href="/" className="flex items-center text-none bg-transparent">
            <img
              src="/camos-logo-nobg.png"
              alt="Camo's Foods"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain block hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm lg:text-base transition-colors relative py-1.5 no-underline ${
                    active ? 'text-[#C7230F] font-black' : 'text-[#C7230F]/75 hover:text-[#C7230F] font-extrabold'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C7230F] rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6">
            <Link href="/favorites" aria-label="Favorites" className="hidden sm:block text-[#C7230F] hover:scale-110 transition-transform relative">
              <Heart size={21} strokeWidth={2.2} className={favCount > 0 ? "fill-[#C7230F] stroke-[#C7230F]" : ""} />
              {mounted && favCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C7230F] text-[#FFFFEF] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#FFFFEF]">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="bg-transparent border-none p-0 relative flex items-center justify-center cursor-pointer text-[#C7230F] hover:scale-110 transition-transform mr-1 sm:mr-0"
            >
              <ShoppingBag size={21} strokeWidth={2.2} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C7230F] text-[#FFFFEF] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#FFFFEF]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <a
              href="https://www.instagram.com/camosfoods?stkn=NHRuM3g5ZGRzYXR4"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden sm:block text-[#C7230F] hover:scale-110 transition-transform"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <Link href="/orders" aria-label="My Account & Orders" className="hidden sm:block text-[#C7230F] hover:scale-110 transition-transform">
              <User size={21} strokeWidth={2.2} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="md:hidden bg-[#C7230F]/10 border-none w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-[#C7230F]"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-[85vw] max-w-[320px] h-full bg-[#FFFFEF] shadow-2xl flex flex-col p-6 overflow-y-auto border-l-2 border-[#C7230F]">
            <div className="flex items-center justify-between mb-7 pb-4 border-b border-[#C7230F]/20">
              <img src="/camos-logo-nobg.png" alt="Camo's Foods" className="h-10 w-auto object-contain" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
                className="bg-[#C7230F]/10 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[#C7230F]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl no-underline text-sm transition-all ${
                      active ? 'bg-[#C7230F] text-[#FFFFEF] font-black' : 'text-[#C7230F] hover:bg-[#C7230F]/10 font-bold'
                    }`}
                  >
                    <Icon size={18} className={active ? 'stroke-[#FFFFEF]' : 'stroke-[#C7230F]'} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-[#C7230F]/20 flex flex-col gap-2.5">
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#C7230F] text-[#FFFFEF] font-extrabold text-sm py-3 rounded-full text-center no-underline shadow-md"
              >
                Order Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
