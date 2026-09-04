import path from 'path';
import type { NextConfig } from 'next';
import withRspack from 'next-rspack';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const i18nRequestConfig = path.resolve(__dirname, './src/i18n/request.ts');

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.emrekilic.web.tr https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://plausible.io https://static.cloudflareinsights.com https://cloudflareinsights.com https://*.amazonaws.com",
      "frame-src 'self' https:",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: 'api.emrekilic.web.tr' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // next-intl, Next 16 + TURBOPACK ortamında yalnızca turbopack alias yazar.
  // next-rspack webpack resolve kullandığı için alias'ı burada da tanımlıyoruz.
  webpack(config) {
    config.resolve ??= {};
    const alias = config.resolve.alias;
    if (Array.isArray(alias)) {
      config.resolve.alias = [...alias, { name: 'next-intl/config', alias: i18nRequestConfig }];
    } else {
      config.resolve.alias = {
        ...alias,
        'next-intl/config': i18nRequestConfig,
      };
    }
    return config;
  },
};

export default withRspack(withNextIntl(nextConfig));
