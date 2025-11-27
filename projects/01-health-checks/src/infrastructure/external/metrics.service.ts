import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

/**
 * Infrastructure Service: MetricsService
 * Prometheus metrics collection
 */
@Injectable()
export class MetricsService {
  private readonly register: promClient.Registry;
  private readonly healthCheckCounter: promClient.Counter;
  private readonly healthCheckDuration: promClient.Histogram;
  private readonly memoryUsage: promClient.Gauge;
  private readonly cpuUsage: promClient.Gauge;

  constructor() {
    this.register = new promClient.Registry();
    promClient.collectDefaultMetrics({ register: this.register });

    // Health check metrics
    this.healthCheckCounter = new promClient.Counter({
      name: 'health_checks_total',
      help: 'Total number of health checks',
      labelNames: ['type', 'status'],
      registers: [this.register],
    });

    this.healthCheckDuration = new promClient.Histogram({
      name: 'health_check_duration_seconds',
      help: 'Duration of health checks in seconds',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.memoryUsage = new promClient.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      registers: [this.register],
    });

    this.cpuUsage = new promClient.Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.register],
    });
  }

  recordHealthCheck(type: string, status: 'healthy' | 'unhealthy', duration: number) {
    this.healthCheckCounter.inc({ type, status });
    this.healthCheckDuration.observe({ type }, duration);
  }

  updateMemoryUsage(bytes: number) {
    this.memoryUsage.set(bytes);
  }

  updateCpuUsage(percent: number) {
    this.cpuUsage.set(percent);
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}

