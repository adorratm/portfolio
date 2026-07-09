import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';

/**
 * Uygulama giriş noktası.
 * - Global validation pipe (DTO doğrulama)
 * - CORS (frontend + admin)
 * - Cookie parser (OAuth callback sonrası JWT cookie)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3001);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  const adminUrl = config.get<string>('app.adminUrl');
  const frontendUrl = config.get<string>('app.frontendUrl');

  // Nginx / Cloudflare arkasında Socket.IO ve proxy header'ları
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter?.getInstance) {
    httpAdapter.getInstance().set('trust proxy', 1);
  }

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: [adminUrl, frontendUrl].filter(Boolean),
    credentials: true,
  });

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend çalışıyor: http://localhost:${port}/${apiPrefix}`);
}

void bootstrap();
