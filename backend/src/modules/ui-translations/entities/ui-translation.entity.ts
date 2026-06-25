import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/**
 * UI metinleri — frontend ve admin paneli chrome'u.
 * CMS içeriğinden ayrı; buton, başlık, etiket gibi arayüz metinleri.
 */
@Entity('ui_translations')
export class UiTranslation extends BaseEntity {
  @Column({ type: 'varchar', length: 5, unique: true })
  locale!: Locale;

  /** Portfolyo sitesi arayüz metinleri */
  @Column({ name: 'frontend_labels', type: 'jsonb', default: {} })
  frontendLabels!: Record<string, string>;

  /** Admin paneli arayüz metinleri */
  @Column({ name: 'admin_labels', type: 'jsonb', default: {} })
  adminLabels!: Record<string, string>;
}
