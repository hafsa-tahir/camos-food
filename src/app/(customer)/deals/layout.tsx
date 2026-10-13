import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Special Deals & Meal Subscriptions',
  description:
    'Save with daily food deals, student combos, family bundles, and weekly subscription plans from Camo\'s Foods. Freshly cooked halal meals delivered to your door.',
  alternates: {
    canonical: '/deals',
  },
  openGraph: {
    title: 'Deals & Offers — Camo\'s Foods',
    description: 'Explore the best discounts and combo offers on fresh halal food delivery.',
    url: 'https://www.camosfoods.com/deals',
  },
}

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children
}
