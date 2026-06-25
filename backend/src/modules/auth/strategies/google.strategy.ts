import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Google OAuth 2.0 stratejisi.
 * Kimlik doğrulama sonrası validate() AuthService'e yönlendirilir.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly allowedEmail: string;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    const google = config.get('app.google');
    super({
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    });
    this.allowedEmail = config.get<string>('app.allowedAdminEmail', '');
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;

    if (!email || email !== this.allowedEmail) {
      return done(
        new UnauthorizedException(
          'Bu Google hesabı admin paneline erişim yetkisine sahip değil.',
        ),
        false,
      );
    }

    done(null, {
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
