import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu — Authentic Halal Dishes & Fast Food',
  description:
    'Explore the full Camo\'s Foods menu: slow-cooked chicken biryani, heritage handi, high-protein gourmet burgers, fresh wraps, and desserts. Order online for express delivery in Karachi.',
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: 'Menu — Camo\'s Foods',
    description:
      'Fresh halal cuisine prepared daily with authentic home-style flavors. Slow-cooked biryani, handi, and gourmet burgers.',
    url: 'https://www.camosfoods.com/menu',
  },
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children
}
