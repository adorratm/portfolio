import { Module } from '@nestjs/common';
import { HealthController } from '@modules/health/health.controller';
import { MetricsModule } from '@modules/metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [HealthController],
})
export class HealthModule {}
