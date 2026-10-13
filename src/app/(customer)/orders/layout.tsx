import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders & Account',
  description: 'Track your live order delivery status and past food orders from Camo\'s Foods.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
