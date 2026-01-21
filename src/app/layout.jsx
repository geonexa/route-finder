import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'OpenRouteFinder Maps - Route Planning & Travel Time Analysis',
    template: '%s | OpenRouteFinder Maps'
  },
  description: 'Free, open-source interactive map client for route planning, directions, and isochrones (travel time analysis). ',
  keywords: [
    'route planning',
    'directions',
    'isochrones',
    'travel time analysis',
    'openrouteservice',
    'geocoding',
    'route optimization',
    'navigation',
  ],
  authors: [{ name: 'GeoNexa', url: 'https://github.com/geonexa' }],
  creator: 'GeoNexa',
  publisher: 'GeoNexa',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'OpenRouteService Maps',
    title: 'OpenRouteService Maps - Route Planning & Travel Time Analysis',
    description: 'Free, open-source interactive map client for route planning, directions, and isochrones. Plan routes, find places, and analyze travel zones.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OpenRouteService Maps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenRouteService Maps - Route Planning & Travel Time Analysis',
    description: 'Free, open-source interactive map client for route planning, directions, and isochrones.',
    images: ['/og-image.png'],
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
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
