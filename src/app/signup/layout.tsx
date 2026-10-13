import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create an account on Camo\'s Foods to get welcome discounts, save delivery addresses, and earn referral rewards.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
