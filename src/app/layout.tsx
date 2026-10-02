import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "Camo's Foods — Premium Halal Cuisine",
  description: "Order delicious gourmet halal food delivered fast from Camo's Foods. Authentic recipes, weekly subscriptions, and daily deals.",
  keywords: "Camo's Foods, food delivery, halal food, biryani, order food online, Karachi food",
  icons: {
    icon: '/camos-logo-nobg.png',
    apple: '/camos-logo-nobg.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFEF',
              border: '2px solid #C7230F',
              color: '#C7230F',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              borderRadius: '16px',
              fontWeight: 800,
            },
          }}
        />
      </body>
    </html>
  )
}
