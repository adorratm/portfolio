import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AdminUser } from '@modules/auth/entities/admin-user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * JWT stratejisi — korumalı admin endpoint'leri için.
 * EntityManager ile kullanıcı varlığını doğrular.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) config: ConfigService,
    @InjectEntityManager() private readonly em: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('app.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AdminUser> {
    const user = await this.em.findOne(AdminUser, {
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Oturum geçersiz.');
    }

    return user;
  }
}
