import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '@modules/queue/queue.constants';

export interface MaintenanceJobData {
  task: string;
}

/**
 * Örnek BullMQ worker — altyapı iskeleti.
 * Gerçek iş mantığı ileride modüllere eklenebilir.
 */
@Processor(QUEUE_NAMES.MAINTENANCE)
export class MaintenanceProcessor extends WorkerHost {
  private readonly logger = new Logger(MaintenanceProcessor.name);

  async process(job: Job<MaintenanceJobData>): Promise<void> {
    this.logger.log(`Maintenance job çalıştı: ${job.data.task}`);
  }
}
