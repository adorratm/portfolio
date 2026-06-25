'use client';

import { getGoogleLoginUrl } from '@/lib/api/client';
import { useLocaleContent } from '@/providers/LocaleProvider';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

/**
 * Google giriş — tüm metinler backend adminLabels'den gelir.
 */
export default function LoginPage() {
  const { t, loading } = useLocaleContent();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-secondary">
        ...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="absolute top-6 right-6">
        <LocaleSwitcher />
      </div>

      <div className="text-center">
        <h1 className="mb-2 font-mono text-2xl font-bold text-primary">
          {t('login.title', 'Root@Portfolio Admin')}
        </h1>
        <p className="max-w-md text-on-surface-variant">
          {t('login.subtitle', 'Sign in with Google.')}
        </p>
      </div>

      <a
        href={getGoogleLoginUrl()}
        className="flex items-center gap-3 rounded-lg bg-primary-container px-8 py-4 font-bold text-on-primary-container transition-all hover:shadow-[0_0_15px_rgba(189,147,249,0.4)]"
      >
        {t('login.googleButton', 'Sign in with Google')}
      </a>
    </div>
  );
}
