'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBehance,
  faDiscord,
  faDribbble,
  faFacebook,
  faGithub,
  faGitlab,
  faInstagram,
  faLinkedin,
  faMedium,
  faStackOverflow,
  faTelegram,
  faTiktok,
  faTwitch,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe, faLink } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

export type SocialIconKey =
  | 'github'
  | 'linkedin'
  | 'x-twitter'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'telegram'
  | 'whatsapp'
  | 'discord'
  | 'medium'
  | 'dribbble'
  | 'behance'
  | 'stack-overflow'
  | 'gitlab'
  | 'twitch'
  | 'tiktok'
  | 'email'
  | 'website'
  | 'link';

export type SocialLink = { type: string; url: string; icon: string };

export const SOCIAL_PRESETS: Array<{ name: string; icon: SocialIconKey }> = [
  { name: 'GitHub', icon: 'github' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'X (Twitter)', icon: 'x-twitter' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Telegram', icon: 'telegram' },
  { name: 'WhatsApp', icon: 'whatsapp' },
  { name: 'Discord', icon: 'discord' },
  { name: 'Medium', icon: 'medium' },
  { name: 'Dribbble', icon: 'dribbble' },
  { name: 'Behance', icon: 'behance' },
  { name: 'Stack Overflow', icon: 'stack-overflow' },
  { name: 'GitLab', icon: 'gitlab' },
  { name: 'Twitch', icon: 'twitch' },
  { name: 'TikTok', icon: 'tiktok' },
  { name: 'E-posta', icon: 'email' },
  { name: 'Web Sitesi', icon: 'website' },
];

const ICON_MAP: Record<SocialIconKey, IconDefinition> = {
  github: faGithub,
  linkedin: faLinkedin,
  'x-twitter': faXTwitter,
  instagram: faInstagram,
  youtube: faYoutube,
  facebook: faFacebook,
  telegram: faTelegram,
  whatsapp: faWhatsapp,
  discord: faDiscord,
  medium: faMedium,
  dribbble: faDribbble,
  behance: faBehance,
  'stack-overflow': faStackOverflow,
  gitlab: faGitlab,
  twitch: faTwitch,
  tiktok: faTiktok,
  email: faEnvelope,
  website: faGlobe,
  link: faLink,
};

const TYPE_TO_ICON: Record<string, SocialIconKey> = Object.fromEntries(
  SOCIAL_PRESETS.map((p) => [p.name, p.icon]),
) as Record<string, SocialIconKey>;

function isSocialIconKey(value: string): value is SocialIconKey {
  return value in ICON_MAP;
}

export function resolveSocialIconKey(link: SocialLink): SocialIconKey {
  const raw = link.icon?.trim().toLowerCase();
  if (raw && isSocialIconKey(raw)) return raw;

  const byType = TYPE_TO_ICON[link.type];
  if (byType) return byType;

  return 'link';
}

export function SocialIcon({
  link,
  className,
}: {
  link: SocialLink;
  className?: string;
}) {
  const key = resolveSocialIconKey(link);
  return <FontAwesomeIcon icon={ICON_MAP[key]} className={className} />;
}
