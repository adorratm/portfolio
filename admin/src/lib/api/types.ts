/** Backend content bundle tipleri — admin ve frontend ile uyumlu */

export type Locale = 'tr' | 'en';

export interface ProfileContent {
  locale?: Locale;
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  bio: string;
  terminalLines: Array<{ label: string; value: string; link?: string }>;
  imageKey?: string | null;
  imageUrl?: string | null;
  isPublished?: boolean;
}

export interface SiteSettings {
  locale?: Locale;
  siteTitle: string;
  brandName: string;
  brandSubtitle: string;
  navItems: Array<{ label: string; href: string; icon?: string }>;
  philosophyTitle: string | null;
  philosophyBody: string | null;
  philosophyPillars: Array<{ label: string; color: string }>;
  statDeployments: string;
  statUptime: string;
  statDeploymentsLabel: string | null;
  statUptimeLabel: string | null;
  projectsSectionTitle: string | null;
  projectsViewAllLabel: string | null;
  footerTagline: string | null;
  contactFabLabel: string | null;
  contactFabUrl: string | null;
  socialLinks: Array<{ type: string; url: string; icon: string }>;
}

export type ProjectStatus = 'active' | 'staging' | 'archived';

export interface Project {
  id: string;
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  externalUrl?: string | null;
  endpoint?: string | null;
  technologies: string[];
  status: ProjectStatus;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface TechStackItem {
  id: string;
  locale: Locale;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  iconName: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  proficiencyLevel: number;
  yearsExperience: number | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface ExpertiseArea {
  title: string;
  description: string;
  icon?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface AboutHighlight {
  label: string;
  value: string;
}

export interface AboutContent {
  locale?: Locale;
  headline: string;
  subtitle: string | null;
  summary: string;
  expertiseAreas: ExpertiseArea[];
  skillGroups: SkillGroup[];
  highlights: AboutHighlight[];
  resumeUrl: string | null;
  resumeLabel: string | null;
  imageKey?: string | null;
  imageUrl?: string | null;
  isPublished?: boolean;
}

export interface Experience {
  id: string;
  locale: Locale;
  company: string;
  role: string;
  employmentType: string | null;
  location: string | null;
  period: string;
  description: string | null;
  highlights: string[];
  technologies: string[];
  isCurrent: boolean;
  sortOrder: number;
  isPublished: boolean;
}

export interface EducationItem {
  id: string;
  locale: Locale;
  institution: string;
  degree: string;
  field: string | null;
  period: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface Certification {
  id: string;
  locale: Locale;
  name: string;
  issuer: string;
  issueDate: string | null;
  credentialUrl: string | null;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface ContentBundle {
  locale: Locale;
  profile: ProfileContent | null;
  siteSettings: SiteSettings | null;
  projects: Project[];
  techStack: TechStackItem[];
  about?: AboutContent | null;
  experiences?: Experience[];
  education?: EducationItem[];
  certifications?: Certification[];
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
