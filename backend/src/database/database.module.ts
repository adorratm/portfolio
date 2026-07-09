import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from '@database/seed.service';

/**
 * TypeORM bağlantı modülü.
 * Bağlantı PgBouncer üzerinden yapılır — prepared statement'lar kapalı.
 * @see docs/05-docker.md
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('app.database');
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          autoLoadEntities: true,
          synchronize: config.get('app.database.synchronize') === true,
          // PgBouncer transaction pooling — statement_timeout startup param desteklenmez
          extra: {
            max: 10,
          },
        };
      },
    }),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
