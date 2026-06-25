import { Controller, Get } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { MetricsCollectorService } from '@modules/metrics/metrics-collector.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly metrics: MetricsCollectorService,
  ) {}

  @Get()
  async check() {
    let dbOk = false;
    try {
      await this.em.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return {
      status: dbOk ? 'ok' : 'degraded',
      database: dbOk,
      metrics: this.metrics.collect(),
      timestamp: new Date().toISOString(),
    };
  }
}
