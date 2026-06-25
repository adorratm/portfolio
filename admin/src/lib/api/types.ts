/** Backend content bundle tipleri — admin ve frontend ile uyumlu */

export type Locale = 'tr' | 'en';

export interface ProfileContent {
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  bio: string;
  terminalLines: Array<{ label: string; value: string; link?: string }>;
}

export interface SiteSettings {
  siteTitle: string;
  brandName: string;
  brandSubtitle: string;
  navItems: Array<{ label: string; href: string; icon?: string }>;
  philosophyTitle: string | null;
  philosophyBody: string | null;
  statDeployments: string;
  statUptime: string;
  statDeploymentsLabel: string | null;
  statUptimeLabel: string | null;
  projectsSectionTitle: string | null;
  footerTagline: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status?: string;
  technologies: string[];
}

export interface TechStackItem {
  id: string;
  name: string;
  category: string;
}

export interface ContentBundle {
  locale: Locale;
  profile: ProfileContent | null;
  siteSettings: SiteSettings | null;
  projects: Project[];
  techStack: TechStackItem[];
  ui: {
    frontend: Record<string, string>;
    admin: Record<string, string>;
  };
}

export interface AdminContentBundles {
  locales: ContentBundle[];
}

export function label(
  labels: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return labels[key] ?? fallback;
}
