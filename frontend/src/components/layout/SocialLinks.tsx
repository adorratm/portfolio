'use client';

import { SocialIcon, type SocialLink } from '@/lib/social-icons';

function normalizeSocialUrl(link: SocialLink): string {
  const url = link.url.trim();
  if (!url) return '';

  const isEmail =
    link.type === 'E-posta' ||
    link.type === 'Email' ||
    (!url.includes('://') && url.includes('@'));

  if (isEmail) {
    return url.startsWith('mailto:') ? url : `mailto:${url}`;
  }

  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function validLinks(links: SocialLink[]): SocialLink[] {
  return links.filter((link) => normalizeSocialUrl(link).length > 0);
}

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  size?: 'sm' | 'md';
}

export function SocialLinks({ links, className = '', size = 'md' }: SocialLinksProps) {
  const items = validLinks(links);
  if (items.length === 0) return null;

  const box =
    size === 'sm'
      ? 'h-8 w-8 text-sm'
      : 'h-9 w-9 text-base';

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`.trim()}>
      {items.map((social) => {
        const href = normalizeSocialUrl(social);
        return (
          <a
            key={`${social.type}-${href}`}
            href={href}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            title={social.type}
            aria-label={social.type}
            className={`glow-hover flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant transition-all hover:border-primary hover:text-primary active:scale-95 ${box}`}
          >
            <SocialIcon link={social} />
          </a>
        );
      })}
    </div>
  );
}

export type { SocialLink };
