import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@/components/seo/Analytics';
import { getSiteUrl } from '@/lib/seo';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Emre Kılıç | Portfolio',
  description: 'Backend mimarı portfolyo sitesi',
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

/**
 * Kök layout — fontlar ve global stiller.
 * Locale-spesifik layout: app/[locale]/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
