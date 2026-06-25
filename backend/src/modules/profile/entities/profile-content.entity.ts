import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * Hero / profil bölümü — ana sayfa üst kısmı ve terminal (neofetch) alanı.
 * Her locale için ayrı satır (tr, en).
 * Sütun tipleri açık tanımlı (tsx emitDecoratorMetadata desteklemez).
 */
@Entity('profile_content')
export class ProfileContent extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  locale!: Locale;

  @Column({ name: 'badge_text', type: 'varchar' })
  badgeText!: string;

  @Column({ name: 'headline_prefix', type: 'varchar' })
  headlinePrefix!: string;

  @Column({ name: 'headline_highlight', type: 'varchar' })
  headlineHighlight!: string;

  @Column({ type: 'text' })
  bio!: string;

  @Column({ name: 'terminal_lines', type: 'jsonb', default: [] })
  terminalLines!: Array<{ label: string; value: string; link?: string }>;

  @Column({ name: 'image_key', type: 'varchar', nullable: true })
  imageKey!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
