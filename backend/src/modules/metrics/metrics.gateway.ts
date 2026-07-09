import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MetricsCollectorService } from '@modules/metrics/metrics-collector.service';

/**
 * Admin dashboard canlı metrik gateway'i.
 * Namespace: /metrics — her 3 saniyede sistem metrikleri yayınlanır.
 */
@WebSocketGateway({
  namespace: '/metrics',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class MetricsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  private intervalId?: NodeJS.Timeout;

  constructor(private readonly collector: MetricsCollectorService) {}

  afterInit(): void {
    this.intervalId = setInterval(() => {
      const metrics = this.collector.collect();
      this.server.emit('metrics', metrics);
    }, 3000);
  }

  onModuleDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
