'use client';

import { LocaleProvider } from '@/providers/LocaleProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
