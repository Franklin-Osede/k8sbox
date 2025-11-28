import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: PrometheusMetricsService
 * Exposes Prometheus metrics for HPA
 */
@Injectable()
export class PrometheusMetricsService {
  private readonly register: promClient.Registry;
  private readonly requestCounter: promClient.Counter;
  private readonly requestDuration: promClient.Histogram;
  private readonly requestsPerSecond: promClient.Gauge;
  private readonly queueDepth: promClient.Gauge;
  private readonly activeConnections: promClient.Gauge;
  
  // Internal state for current values
  private currentRPS: number = 0;
  private currentQueueDepth: number = 0;
  private currentConnections: number = 0;

  constructor(private readonly logger: AppLoggerService) {
    // Create a Registry to register the metrics
    this.register = new promClient.Registry();

    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.register });

    // Custom metrics for HPA
    this.requestCounter = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.requestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    // Custom metric: Requests per second (for HPA)
    this.requestsPerSecond = new promClient.Gauge({
      name: 'requests_per_second',
      help: 'Current requests per second',
      registers: [this.register],
    });

    // Custom metric: Queue depth (for HPA)
    this.queueDepth = new promClient.Gauge({
      name: 'queue_depth',
      help: 'Current queue depth',
      registers: [this.register],
    });

    // Custom metric: Active connections (for HPA)
    this.activeConnections = new promClient.Gauge({
      name: 'active_connections',
      help: 'Current active connections',
      registers: [this.register],
    });

    this.logger.log('Prometheus metrics service initialized', 'PrometheusMetricsService');
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Increment request counter
   */
  incrementRequest(method: string, route: string, status: number): void {
    this.requestCounter.inc({ method, route, status: status.toString() });
  }

  /**
   * Record request duration
   */
  recordRequestDuration(method: string, route: string, duration: number): void {
    this.requestDuration.observe({ method, route }, duration);
  }

  /**
   * Set requests per second (for HPA)
   */
  setRequestsPerSecond(value: number): void {
    this.currentRPS = value;
    this.requestsPerSecond.set(value);
  }

  /**
   * Set queue depth (for HPA)
   */
  setQueueDepth(value: number): void {
    this.currentQueueDepth = value;
    this.queueDepth.set(value);
  }

  /**
   * Set active connections (for HPA)
   */
  setActiveConnections(value: number): void {
    this.currentConnections = value;
    this.activeConnections.set(value);
  }

  /**
   * Get current requests per second
   */
  getRequestsPerSecond(): number {
    return this.currentRPS;
  }

  /**
   * Get current queue depth
   */
  getQueueDepth(): number {
    return this.currentQueueDepth;
  }

  /**
   * Get current active connections
   */
  getActiveConnections(): number {
    return this.currentConnections;
  }
}

