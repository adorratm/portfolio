'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setStoredToken } from '@/lib/api/client';
import { useLocaleContent } from '@/providers/LocaleProvider';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocaleContent();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setStoredToken(token);
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="font-mono text-secondary">
        {t('auth.callback', 'Signing in...')}
      </p>
    </div>
  );
}
