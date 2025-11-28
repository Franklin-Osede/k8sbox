import { Injectable } from '@nestjs/common';
import { HealthCheckHistoryEntity } from '../../domain/entities/health-check-history.entity';
import { HealthCheckResult } from '../../domain/value-objects/health-check-result.vo';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: HealthHistoryService
 * Stores and retrieves health check history
 */
@Injectable()
export class HealthHistoryService {
  private history: HealthCheckHistoryEntity[] = [];
  private readonly maxHistorySize: number;

  constructor(private readonly logger: AppLoggerService) {
    this.maxHistorySize = parseInt(process.env.HEALTH_HISTORY_SIZE || '100', 10);
  }

  /**
   * Record a health check in history
   */
  record(
    liveness: HealthCheckResult,
    readiness: HealthCheckResult,
    startup: HealthCheckResult,
  ): void {
    const record = HealthCheckHistoryEntity.create(liveness, readiness, startup);
    this.history.unshift(record); // Add to beginning

    // Keep only last N records
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get health check history
   */
  getHistory(limit: number = 10): HealthCheckHistoryEntity[] {
    return this.history.slice(0, limit);
  }

  /**
   * Get all history
   */
  getAllHistory(): HealthCheckHistoryEntity[] {
    return [...this.history];
  }

  /**
   * Get uptime statistics
   */
  getUptimeStats(): {
    totalChecks: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
    uptimePercentage: number;
  } {
    if (this.history.length === 0) {
      return {
        totalChecks: 0,
        healthyCount: 0,
        degradedCount: 0,
        unhealthyCount: 0,
        uptimePercentage: 100,
      };
    }

    const healthyCount = this.history.filter((h) => h.overallStatus === 'healthy').length;
    const degradedCount = this.history.filter((h) => h.overallStatus === 'degraded').length;
    const unhealthyCount = this.history.filter((h) => h.overallStatus === 'unhealthy').length;

    const uptimePercentage = (healthyCount / this.history.length) * 100;

    return {
      totalChecks: this.history.length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    };
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.logger.log('Health check history cleared', 'HealthHistoryService');
  }
}

