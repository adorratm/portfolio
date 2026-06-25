'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/api/client';

/** CMS sayfalarında oturum kontrolü */
export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.replace('/login');
  }, [router]);
}
