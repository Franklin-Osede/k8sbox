import { HealthCheckResult } from '../value-objects/health-check-result.vo';

/**
 * Domain Entity: HealthCheckHistory
 * Represents a historical health check record
 */
export class HealthCheckHistoryEntity {
  constructor(
    public readonly timestamp: Date,
    public readonly liveness: HealthCheckResult,
    public readonly readiness: HealthCheckResult,
    public readonly startup: HealthCheckResult,
    public readonly overallStatus: 'healthy' | 'degraded' | 'unhealthy',
  ) {}

  static create(
    liveness: HealthCheckResult,
    readiness: HealthCheckResult,
    startup: HealthCheckResult,
  ): HealthCheckHistoryEntity {
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (!liveness.isHealthy) {
      overallStatus = 'unhealthy';
    } else if (!readiness.isHealthy || !startup.isHealthy) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return new HealthCheckHistoryEntity(
      new Date(),
      liveness,
      readiness,
      startup,
      overallStatus,
    );
  }
}

