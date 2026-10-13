import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Rewards & Discount Coupons',
  description:
    'Share your referral code to give friends 10% off and earn 20% off rewards. Redeem promo coupons on your favorite halal dishes at Camo\'s Foods.',
  alternates: {
    canonical: '/coupons',
  },
  openGraph: {
    title: 'Referral Rewards & Coupons — Camo\'s Foods',
    description: 'Double rewards referral program: earn discounts on every friend you refer.',
    url: 'https://www.camosfoods.com/coupons',
  },
}

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return children
}
