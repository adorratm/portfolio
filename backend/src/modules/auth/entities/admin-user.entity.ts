import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@database/base.entity';

/** Desteklenen diller — i18n içerik alanları bu enum ile işaretlenir */
export type Locale = 'tr' | 'en';

/**
 * Admin kullanıcı — Google OAuth ile oluşturulur.
 * Sadece ALLOWED_ADMIN_EMAIL ile eşleşen hesaplar kaydedilir.
 */
@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ name: 'google_id', unique: true })
  googleId!: string;

  @Column({ nullable: true })
  name!: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;
}
