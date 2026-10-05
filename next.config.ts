import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow Cloudflare Tunnels and local addresses in dev mode
  allowedDevOrigins: ['*.trycloudflare.com', 'localhost:3000', '127.0.0.1:3000'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.trycloudflare.com', 'localhost:3000', '127.0.0.1:3000'],
    },
  },
}

export default nextConfig
