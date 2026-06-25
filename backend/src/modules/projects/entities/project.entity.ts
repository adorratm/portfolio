import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

export type ProjectStatus = 'active' | 'staging' | 'archived';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ name: 'image_key', type: 'varchar', nullable: true })
  imageKey!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'external_url', type: 'varchar', nullable: true })
  externalUrl!: string | null;

  @Column({ name: 'endpoint', type: 'varchar', nullable: true })
  endpoint!: string | null;

  @Column({ type: 'jsonb', default: [] })
  technologies!: string[];

  @Column({ type: 'varchar', default: 'active' })
  status!: ProjectStatus;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_featured', type: 'boolean', default: true })
  isFeatured!: boolean;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
