'use client';

import { SocialIcon, type SocialLink } from '@/lib/social-icons';

function isEmailLink(link: SocialLink, url: string): boolean {
  return (
    link.type === 'E-posta' ||
    link.type === 'Email' ||
    (!url.includes('://') && url.includes('@'))
  );
}

function emailAddress(url: string): string {
  return url.replace(/^mailto:/i, '').trim();
}

function normalizeSocialUrl(link: SocialLink): string {
  const url = link.url.trim();
  if (!url) return '';

  if (isEmailLink(link, url)) {
    // href'de mailto kullanma — Cloudflare email-protection kırık link üretir
    return '';
  }

  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  size?: 'sm' | 'md';
}

export function SocialLinks({ links, className = '', size = 'md' }: SocialLinksProps) {
  const items = (links ?? []).filter((link) => link.url.trim().length > 0);
  if (items.length === 0) return null;

  const box =
    size === 'sm'
      ? 'h-8 w-8 text-sm'
      : 'h-9 w-9 text-base';

  const itemClass = `glow-hover flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant transition-all hover:border-primary hover:text-primary active:scale-95 ${box}`;

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`.trim()}>
      {items.map((social) => {
        const raw = social.url.trim();
        const mail = isEmailLink(social, raw) ? emailAddress(raw) : null;
        const href = normalizeSocialUrl(social);

        if (mail) {
          return (
            <button
              key={`${social.type}-${mail}`}
              type="button"
              title={social.type}
              aria-label={social.type}
              className={itemClass}
              onClick={() => {
                window.location.href = `mailto:${mail}`;
              }}
            >
              <SocialIcon link={social} />
            </button>
          );
        }

        if (!href) return null;

        return (
          <a
            key={`${social.type}-${href}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={social.type}
            aria-label={social.type}
            className={itemClass}
          >
            <SocialIcon link={social} />
          </a>
        );
      })}
    </div>
  );
}

export type { SocialLink };
