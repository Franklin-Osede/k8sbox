/**
 * Domain Entity: HealthStatus
 * Represents the health status of the application
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

export class HealthStatusEntity {
  constructor(
    public readonly status: HealthStatus,
    public readonly timestamp: Date,
    public readonly details?: Record<string, any>,
  ) {}

  isHealthy(): boolean {
    return this.status === HealthStatus.HEALTHY;
  }

  isUnhealthy(): boolean {
    return this.status === HealthStatus.UNHEALTHY;
  }

  isDegraded(): boolean {
    return this.status === HealthStatus.DEGRADED;
  }
}

