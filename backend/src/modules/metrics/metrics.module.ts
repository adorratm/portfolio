import { Module } from '@nestjs/common';
import { MetricsCollectorService } from '@modules/metrics/metrics-collector.service';
import { MetricsGateway } from '@modules/metrics/metrics.gateway';

@Module({
  providers: [MetricsCollectorService, MetricsGateway],
  exports: [MetricsCollectorService],
})
export class MetricsModule {}
