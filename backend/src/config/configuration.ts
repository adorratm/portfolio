import { registerAs } from '@nestjs/config';

/** .env değerlerindeki tırnak işaretlerini temizler */
function env(key: string, fallback = ''): string {
  const raw = process.env[key] ?? fallback;
  return raw.replace(/^["']|["']$/g, '').trim();
}

/**
 * Merkezi yapılandırma fabrikası.
 * Tüm modüller ConfigService üzerinden bu anahtarlara erişir.
 */
export default registerAs('app', () => {
  const port = parseInt(env('PORT', '3001'), 10);
  const apiPrefix = env('API_PREFIX', 'api/v1');
  const defaultCallback = `http://localhost:${port}/${apiPrefix}/auth/google/callback`;

  return {
    nodeEnv: env('NODE_ENV', 'development'),
    port,
    apiPrefix,
    adminUrl: env('ADMIN_URL', 'http://localhost:3002'),
    frontendUrl: env('FRONTEND_URL', 'http://localhost:3000'),
    jwt: {
      secret: env('JWT_SECRET', 'dev-only-secret'),
      expiresIn: env('JWT_EXPIRES_IN', '7d'),
    },
    google: {
      clientId: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET'),
      callbackUrl: env('GOOGLE_CALLBACK_URL', defaultCallback),
    },
    allowedAdminEmail: env('ALLOWED_ADMIN_EMAIL'),
    database: {
      host: env('DATABASE_HOST', 'localhost'),
      port: parseInt(env('DATABASE_PORT', '6432'), 10),
      username: env('DATABASE_USER', 'portfolio'),
      password: env('DATABASE_PASSWORD', 'portfolio_dev'),
      database: env('DATABASE_NAME', 'portfolio'),
    },
    redis: {
      host: env('REDIS_HOST', 'localhost'),
      port: parseInt(env('REDIS_PORT', '6379'), 10),
    },
    aws: {
      region: env('AWS_REGION', 'eu-central-1'),
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      bucket: env('AWS_S3_BUCKET', 'portfolio-media'),
    },
    bullBoardPath: env('BULL_BOARD_PATH', '/admin/queues'),
  };
});
