import { Injectable } from '@nestjs/common';
import * as os from 'os';

export interface SystemMetrics {
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  uptimeSeconds: number;
  uptimeLabel: string;
  timestamp: string;
}

/**
 * Gerçek sistem metrikleri — admin dashboard Socket.io akışı.
 * os modülü ile CPU, RAM ve uptime okunur.
 */
@Injectable()
export class MetricsCollectorService {
  private previousCpuTimes = os.cpus().map((c) => c.times);

  collect(): SystemMetrics {
    const cpuPercent = this.getCpuUsagePercent();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const uptimeSeconds = os.uptime();

    return {
      cpuPercent: Math.round(cpuPercent),
      ramUsedGb: parseFloat((usedMem / 1024 ** 3).toFixed(1)),
      ramTotalGb: parseFloat((totalMem / 1024 ** 3).toFixed(1)),
      uptimeSeconds,
      uptimeLabel: this.formatUptime(uptimeSeconds),
      timestamp: new Date().toISOString(),
    };
  }

  private getCpuUsagePercent(): number {
    const cpus = os.cpus();
    let idleDiff = 0;
    let totalDiff = 0;

    cpus.forEach((cpu, i) => {
      const prev = this.previousCpuTimes[i];
      const idle = cpu.times.idle - prev.idle;
      const total =
        cpu.times.user -
        prev.user +
        (cpu.times.nice - prev.nice) +
        (cpu.times.sys - prev.sys) +
        (cpu.times.irq - prev.irq) +
        idle;
      idleDiff += idle;
      totalDiff += total;
    });

    this.previousCpuTimes = cpus.map((c) => ({ ...c.times }));

    if (totalDiff === 0) return 0;
    return ((totalDiff - idleDiff) / totalDiff) * 100;
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
}
