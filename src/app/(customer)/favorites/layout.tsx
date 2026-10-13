import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Favorites',
  description: 'View your saved favorite halal dishes and meals at Camo\'s Foods.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children
}
