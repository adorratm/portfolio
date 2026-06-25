import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

/** Teknoloji yığını öğesi — tech stack sayfası */
@Entity('tech_stack_items')
export class TechStackItem extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column()
  category!: string;

  @Column({ name: 'icon_name', nullable: true })
  iconName!: string | null;

  @Column({ name: 'proficiency_level', default: 80 })
  proficiencyLevel!: number;

  @Column({ name: 'years_experience', nullable: true })
  yearsExperience!: number | null;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_published', default: true })
  isPublished!: boolean;
}
