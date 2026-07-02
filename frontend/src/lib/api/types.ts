/** Backend content bundle tipleri — frontend ve admin paylaşır */

export type Locale = 'tr' | 'en';

export interface ProfileContent {
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  bio: string;
  terminalLines: Array<{ label: string; value: string; link?: string }>;
  imageUrl?: string | null;
  imageKey?: string | null;
}

export interface SiteSettings {
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

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  technologies: string[];
  externalUrl?: string | null;
  endpoint?: string | null;
  status?: string;
  sortOrder?: number;
  isFeatured?: boolean;
}

export interface TechStackItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl?: string | null;
  iconName?: string | null;
  proficiencyLevel: number;
  yearsExperience?: number | null;
  sortOrder?: number;
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
  headline: string;
  subtitle: string | null;
  summary: string;
  expertiseAreas: ExpertiseArea[];
  skillGroups: SkillGroup[];
  highlights: AboutHighlight[];
  resumeUrl: string | null;
  resumeLabel: string | null;
  imageUrl?: string | null;
  imageKey?: string | null;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  employmentType: string | null;
  location: string | null;
  period: string;
  description: string | null;
  highlights: string[];
  technologies: string[];
  isCurrent: boolean;
  sortOrder?: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  period: string;
  description: string | null;
  sortOrder?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string | null;
  credentialUrl: string | null;
  description: string | null;
  sortOrder?: number;
}

export interface UiLabels {
  frontend: Record<string, string>;
  admin: Record<string, string>;
}

/** GET /content/public/:locale yanıtı */
export interface ContentBundle {
  locale: Locale;
  profile: ProfileContent | null;
  siteSettings: SiteSettings | null;
  projects: Project[];
  techStack: TechStackItem[];
  about: AboutContent | null;
  experiences: Experience[];
  education: EducationItem[];
  certifications: Certification[];
  ui: UiLabels;
}

/** GET /content/admin/all yanıtı */
export interface AdminContentBundles {
  locales: ContentBundle[];
}

/** UI etiket okuma yardımcısı — key yoksa fallback döner */
export function label(
  labels: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return labels[key] ?? fallback;
}
