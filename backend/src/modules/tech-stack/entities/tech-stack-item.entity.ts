import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@database/base.entity';
import type { Locale } from '@common/types/locale';

@Entity('tech_stack_items')
@Index(['locale', 'slug'], { unique: true })
export class TechStackItem extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  @Index()
  locale!: Locale;

  @Column({ type: 'varchar' })
  slug!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ name: 'icon_name', type: 'varchar', nullable: true })
  iconName!: string | null;

  @Column({ name: 'image_key', type: 'varchar', nullable: true })
  imageKey!: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'proficiency_level', type: 'int', default: 80 })
  proficiencyLevel!: number;

  @Column({ name: 'years_experience', type: 'int', nullable: true })
  yearsExperience!: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished!: boolean;
}
