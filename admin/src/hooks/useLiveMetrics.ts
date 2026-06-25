'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

export interface SystemMetrics {
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  uptimeLabel: string;
  timestamp: string;
}

/**
 * Canlı sistem metrikleri hook'u.
 * Backend /metrics namespace'ine Socket.io ile bağlanır.
 */
export function useLiveMetrics(): SystemMetrics | null {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    const socket: Socket = io(`${WS_BASE}/metrics`, {
      transports: ['websocket'],
    });

    socket.on('metrics', (data: SystemMetrics) => {
      setMetrics(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return metrics;
}
