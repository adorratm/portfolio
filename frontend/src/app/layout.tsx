import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seo';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Emre Kılıç | Portfolio',
  description: 'Backend mimarı portfolyo sitesi',
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

/**
 * Kök layout — yalnızca children.
 * html/body ve lang: app/[locale]/layout.tsx (SSR'da locale'e bağlı).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
