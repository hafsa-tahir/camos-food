import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calorie & Macro Calculator',
  description:
    'Calculate your daily BMR and TDEE calorie requirements. Get customized halal meal recommendations for weight loss, maintenance, or high-protein muscle building.',
  alternates: {
    canonical: '/diet',
  },
  openGraph: {
    title: 'Calorie & Macro Calculator — Camo\'s Foods',
    description: 'Personalized halal meal recommendations tailored to your fitness goals and calories.',
    url: 'https://www.camosfoods.com/diet',
  },
}

export default function DietLayout({ children }: { children: React.ReactNode }) {
  return children
}
