import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * Hero / profil bölümü — ana sayfa üst kısmı ve terminal (neofetch) alanı.
 * Her locale için ayrı satır (tr, en).
 */
@Entity('profile_content')
export class ProfileContent extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  locale!: Locale;

  @Column({ name: 'badge_text' })
  badgeText!: string;

  @Column({ name: 'headline_prefix' })
  headlinePrefix!: string;

  @Column({ name: 'headline_highlight' })
  headlineHighlight!: string;

  @Column({ type: 'text' })
  bio!: string;

  /** Terminal neofetch satırları — JSON array [{label, value, link?}] */
  @Column({ name: 'terminal_lines', type: 'jsonb', default: [] })
  terminalLines!: Array<{ label: string; value: string; link?: string }>;

  @Column({ name: 'is_published', default: true })
  isPublished!: boolean;
}
