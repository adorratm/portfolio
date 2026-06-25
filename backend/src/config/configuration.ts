import { registerAs } from '@nestjs/config';

/**
 * Merkezi yapılandırma fabrikası.
 * Tüm modüller ConfigService üzerinden bu anahtarlara erişir.
 */
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  adminUrl: process.env.ADMIN_URL ?? 'http://localhost:3002',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ??
      'http://localhost:3001/api/v1/auth/google/callback',
  },
  allowedAdminEmail: process.env.ALLOWED_ADMIN_EMAIL ?? '',
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '6432', 10),
    username: process.env.DATABASE_USER ?? 'portfolio',
    password: process.env.DATABASE_PASSWORD ?? 'portfolio_dev',
    database: process.env.DATABASE_NAME ?? 'portfolio',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  aws: {
    region: process.env.AWS_REGION ?? 'eu-central-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.AWS_S3_BUCKET ?? 'portfolio-media',
  },
  bullBoardPath: process.env.BULL_BOARD_PATH ?? '/admin/queues',
}));
