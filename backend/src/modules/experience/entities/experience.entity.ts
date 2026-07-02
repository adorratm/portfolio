import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * İş deneyimi kaydı — /experience zaman çizelgesi.
 * Her locale için ayrı satırlar.
 */
@Entity('experiences')
export class Experience extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column({ type: 'varchar' })
  company!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @Column({ name: 'employment_type', type: 'varchar', nullable: true })
  employmentType!: string | null;

  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  /** Görüntülenecek dönem metni, ör. "2021 — Günümüz" */
  @Column({ type: 'varchar' })
  period!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', default: [] })
  highlights!: string[];

  @Column({ type: 'jsonb', default: [] })
  technologies!: string[];

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
