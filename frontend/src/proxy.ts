import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_TR_SEGMENT_REDIRECTS } from '@/i18n/paths';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Eski /tr/about → /tr/hakkimda (liste path'leri; UUID detay sayfa içinde 301). */
function redirectLegacyTrPaths(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/tr/')) return null;

  const rest = pathname.slice('/tr/'.length);
  if (!rest) return null;

  const [first, ...tail] = rest.split('/');
  const mapped = LEGACY_TR_SEGMENT_REDIRECTS[first ?? ''];
  if (!mapped || mapped === first) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/tr/${[mapped, ...tail].filter(Boolean).join('/')}`;
  return NextResponse.redirect(url, 301);
}

/** /en/en/projects, /tr/tr/projeler gibi çift locale URL'lerini düzelt. */
function redirectDoubledLocale(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(tr|en)\/\1(\/.*)?$/);
  if (!match) return null;

  const locale = match[1];
  const rest = match[2] ?? '';
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${rest}` || `/${locale}`;
  return NextResponse.redirect(url, 301);
}

export default function proxy(request: NextRequest) {
  const doubled = redirectDoubledLocale(request);
  if (doubled) return doubled;

  const legacy = redirectLegacyTrPaths(request);
  if (legacy) return legacy;
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(tr|en)/:path*'],
};
