import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '@modules/queue/queue.constants';
import { MaintenanceProcessor } from '@modules/queue/processors/maintenance.processor';
import { QueueService } from '@modules/queue/queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('app.redis.host'),
          port: config.get('app.redis.port'),
        },
      }),
    }),
    BullModule.registerQueue({ name: QUEUE_NAMES.MAINTENANCE }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAMES.MAINTENANCE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [MaintenanceProcessor, QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
