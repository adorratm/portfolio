import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';

export type Locale = 'tr' | 'en';

@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ name: 'google_id', type: 'varchar', unique: true })
  googleId!: string;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;
}
