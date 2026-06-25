import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from '@modules/auth/auth.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AdminUser } from '@modules/auth/entities/admin-user.entity';
import type { GoogleUserPayload } from '@modules/auth/auth.service';

/**
 * Auth endpoint'leri:
 * - GET /auth/google          → Google'a yönlendir
 * - GET /auth/google/callback → JWT üret, admin'e redirect
 * - GET /auth/me              → Oturum bilgisi
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Passport otomatik yönlendirir
  }

  /** OAuth ayar doğrulama — redirect_uri_mismatch debug için */
  @Get('google/config')
  googleConfig(): { callbackUrl: string; hint: string } {
    const callbackUrl = this.config.getOrThrow<string>('app.google.callbackUrl');
    return {
      callbackUrl,
      hint: 'Google Console → Authorized redirect URIs içine bu URL\'yi birebir ekleyin (Web application client).',
    };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: { user: GoogleUserPayload },
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.authService.upsertGoogleUser(req.user);
    const token = this.authService.signToken(user);
    const adminUrl = this.config.get<string>('app.adminUrl');

    // Token'ı query ile admin'e ilet — admin Next.js tarafında cookie'ye yazar
    res.redirect(`${adminUrl}/auth/callback?token=${token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AdminUser): AdminUser {
    return user;
  }
}
