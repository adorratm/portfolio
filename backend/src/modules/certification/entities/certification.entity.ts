import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * Sertifika / başarı kaydı — /education sayfası sertifikalar bölümü.
 * Her locale için ayrı satırlar.
 */
@Entity('certifications')
export class Certification extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  issuer!: string;

  /** Görüntülenecek tarih metni, ör. "2023" */
  @Column({ name: 'issue_date', type: 'varchar', nullable: true })
  issueDate!: string | null;

  @Column({ name: 'credential_url', type: 'varchar', nullable: true })
  credentialUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
