import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

/** AI arama botları — trafiği getirir; Cloudflare AI Crawl Control’de de açık olmalı. */
const AI_SEARCH_BOTS = [
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'Applebot-Extended',
  'Amazonbot',
] as const;

/** Model eğitimi — engelli kalabilir. */
const AI_TRAINING_BOTS = [
  'GPTBot',
  'Google-Extended',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'Meta-ExternalAgent',
] as const;

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/_next/'],
      })),
      ...AI_TRAINING_BOTS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
