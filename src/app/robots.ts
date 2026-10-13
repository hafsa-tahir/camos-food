import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/cart/checkout', '/orders'],
      },
    ],
    sitemap: 'https://www.camosfoods.com/sitemap.xml',
  }
}
