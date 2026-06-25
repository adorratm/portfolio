import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

export type ProjectStatus = 'active' | 'staging' | 'archived';

/**
 * Portfolyo projeleri — ana sayfa kartları + admin registry tablosu.
 */
@Entity('projects')
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  category!: string;

  @Column({ name: 'image_key', nullable: true })
  imageKey!: string | null;

  @Column({ name: 'image_url', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'external_url', nullable: true })
  externalUrl!: string | null;

  @Column({ name: 'endpoint', nullable: true })
  endpoint!: string | null;

  @Column({ type: 'jsonb', default: [] })
  technologies!: string[];

  @Column({ type: 'varchar', default: 'active' })
  status!: ProjectStatus;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_featured', default: true })
  isFeatured!: boolean;

  @Column({ name: 'is_published', default: true })
  isPublished!: boolean;
}
