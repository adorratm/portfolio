import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

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

/**
 * Hakkımda / özgeçmiş özet bölümü — /about sayfasının üst kısmı.
 * Her locale için tek satır (tr, en). Sütun tipleri açık tanımlı
 * (ts-node emitDecoratorMetadata'ya güvenilmez).
 */
@Entity('about_content')
export class AboutContent extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  locale!: Locale;

  @Column({ type: 'varchar' })
  headline!: string;

  @Column({ type: 'varchar', nullable: true })
  subtitle!: string | null;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ name: 'expertise_areas', type: 'jsonb', default: [] })
  expertiseAreas!: ExpertiseArea[];

  @Column({ name: 'skill_groups', type: 'jsonb', default: [] })
  skillGroups!: SkillGroup[];

  @Column({ type: 'jsonb', default: [] })
  highlights!: AboutHighlight[];

  @Column({ name: 'resume_url', type: 'varchar', nullable: true })
  resumeUrl!: string | null;

  @Column({ name: 'resume_label', type: 'varchar', nullable: true })
  resumeLabel!: string | null;

  @Column({ name: 'image_key', type: 'varchar', nullable: true })
  imageKey!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
