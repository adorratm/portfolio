'use client';

import { useLocaleContent } from '@/providers/LocaleProvider';
import type { Locale } from '@/lib/api/types';

/**
 * TR / EN dil seçici — admin paneli chrome metinleri backend'den gelir.
 */
export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocaleContent();

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-on-surface-variant">
        {t('locale.switch', 'Language')}:
      </span>
      {(['tr', 'en'] as Locale[]).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={`rounded px-2 py-1 font-mono text-xs uppercase transition-colors ${
            locale === loc
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:text-secondary'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
