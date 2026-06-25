import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

@Entity('site_settings')
export class SiteSettings extends BaseEntity {
  @Column({ type: 'varchar', length: 5, unique: true })
  locale!: Locale;

  @Column({ name: 'site_title', type: 'varchar' })
  siteTitle!: string;

  @Column({ name: 'brand_name', type: 'varchar' })
  brandName!: string;

  @Column({ name: 'brand_subtitle', type: 'varchar' })
  brandSubtitle!: string;

  @Column({ name: 'nav_items', type: 'jsonb', default: [] })
  navItems!: Array<{ label: string; href: string; icon?: string }>;

  @Column({ name: 'philosophy_title', type: 'varchar', nullable: true })
  philosophyTitle!: string | null;

  @Column({ name: 'philosophy_body', type: 'text', nullable: true })
  philosophyBody!: string | null;

  @Column({ name: 'philosophy_pillars', type: 'jsonb', default: [] })
  philosophyPillars!: Array<{ label: string; color: string }>;

  @Column({ name: 'stat_deployments', type: 'varchar', default: '50+' })
  statDeployments!: string;

  @Column({ name: 'stat_uptime', type: 'varchar', default: '99.9%' })
  statUptime!: string;

  @Column({ name: 'stat_deployments_label', type: 'varchar', nullable: true })
  statDeploymentsLabel!: string | null;

  @Column({ name: 'stat_uptime_label', type: 'varchar', nullable: true })
  statUptimeLabel!: string | null;

  @Column({ name: 'projects_section_title', type: 'varchar', nullable: true })
  projectsSectionTitle!: string | null;

  @Column({ name: 'projects_view_all_label', type: 'varchar', nullable: true })
  projectsViewAllLabel!: string | null;

  @Column({ name: 'footer_tagline', type: 'varchar', nullable: true })
  footerTagline!: string | null;

  @Column({ name: 'social_links', type: 'jsonb', default: [] })
  socialLinks!: Array<{ type: string; url: string; icon: string }>;

  @Column({ name: 'contact_fab_label', type: 'varchar', nullable: true })
  contactFabLabel!: string | null;

  @Column({ name: 'contact_fab_url', type: 'varchar', nullable: true })
  contactFabUrl!: string | null;
}
