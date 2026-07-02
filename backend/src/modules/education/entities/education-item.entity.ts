import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * Eğitim kaydı — /education sayfası.
 * Her locale için ayrı satırlar.
 */
@Entity('education_items')
export class EducationItem extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column({ type: 'varchar' })
  institution!: string;

  @Column({ type: 'varchar' })
  degree!: string;

  @Column({ type: 'varchar', nullable: true })
  field!: string | null;

  /** Görüntülenecek dönem metni, ör. "2015 — 2019" */
  @Column({ type: 'varchar' })
  period!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
