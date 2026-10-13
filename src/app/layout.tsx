import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.camosfoods.com'),
  title: {
    default: "Camo's Foods — Premium Halal Cuisine & Fast Food Delivery",
    template: "%s | Camo's Foods",
  },
  description:
    "Order delicious gourmet halal food delivered fast from Camo's Foods. Authentic heritage biryani, makhni handi, high-protein burgers, and fresh meal subscriptions.",
  keywords: [
    "Camo's Foods",
    "food delivery",
    "halal food",
    "biryani delivery",
    "order food online",
    "Karachi food delivery",
    "healthy meal plans",
    "high protein meals",
    "makhni handi",
  ],
  authors: [{ name: "Camo's Foods" }],
  creator: "Camo's Foods",
  publisher: "Camo's Foods",
  icons: {
    icon: '/camos-logo-nobg.png',
    apple: '/camos-logo-nobg.png',
  },
  alternates: {
    canonical: 'https://www.camosfoods.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://www.camosfoods.com',
    siteName: "Camo's Foods",
    title: "Camo's Foods — Premium Halal Cuisine & Fast Food Delivery",
    description:
      "Authentic slow-cooked Pakistani heritage dishes, gourmet burgers, and fresh meals delivered piping hot to your doorstep in 45 minutes.",
    images: [
      {
        url: '/hero-plate.jpg',
        width: 1024,
        height: 1024,
        alt: "Camo's Foods Gourmet Halal Cuisine",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Camo's Foods — Premium Halal Cuisine",
    description:
      "Authentic Pakistani flavors, made fresh and delivered fast. Order biryani, handi, and burgers online.",
    images: ['/hero-plate.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: "Camo's Foods",
  image: 'https://www.camosfoods.com/hero-plate.jpg',
  '@id': 'https://www.camosfoods.com',
  url: 'https://www.camosfoods.com',
  telephone: '+923285286882',
  priceRange: 'PKR',
  servesCuisine: ['Pakistani', 'Halal', 'Biryani', 'Fast Food'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Karachi',
    addressCountry: 'PK',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '23:00',
    },
  ],
  hasMenu: 'https://www.camosfoods.com/menu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FAFAFA',
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
