import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/** Locale yönlendirme — / → /tr */
export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(tr|en)/:path*'],
};
