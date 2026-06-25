import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AdminUser } from '@modules/auth/entities/admin-user.entity';
import { JwtPayload } from '@modules/auth/strategies/jwt.strategy';

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Kimlik doğrulama servisi.
 * TypeORM Repository kullanılmaz — tüm DB işlemleri EntityManager üzerinden.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  /** Google OAuth sonrası kullanıcıyı oluşturur veya günceller */
  async upsertGoogleUser(payload: GoogleUserPayload): Promise<AdminUser> {
    let user = await this.em.findOne(AdminUser, {
      where: { email: payload.email },
    });

    if (!user) {
      user = this.em.create(AdminUser, {
        email: payload.email,
        googleId: payload.googleId,
        name: payload.name,
        avatarUrl: payload.avatarUrl,
        lastLoginAt: new Date(),
      });
    } else {
      user.googleId = payload.googleId;
      user.name = payload.name;
      user.avatarUrl = payload.avatarUrl;
      user.lastLoginAt = new Date();
    }

    return this.em.save(AdminUser, user);
  }

  /** JWT access token üretir */
  signToken(user: AdminUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string): Promise<AdminUser | null> {
    return this.em.findOne(AdminUser, { where: { id: userId } });
  }
}
