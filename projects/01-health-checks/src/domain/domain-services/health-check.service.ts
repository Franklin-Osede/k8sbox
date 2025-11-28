import { Injectable } from '@nestjs/common';
import { HealthCheckResult } from '../value-objects/health-check-result.vo';
import { HealthStatusEntity, HealthStatus } from '../entities/health-status.entity';
import { DependencyStatus } from '../value-objects/dependency-status.vo';
import { AppLoggerService } from '../../infrastructure/external/logger.service';
import { CircuitBreakerService } from '../../infrastructure/external/circuit-breaker.service';

/**
 * Domain Service: HealthCheckService
 * Core business logic for health checks
 */
@Injectable()
export class HealthCheckDomainService {
  private initializationComplete = false;
  private readonly startupTimeout: number;
  private readonly dependencyTimeout: number;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.startupTimeout = parseInt(process.env.STARTUP_TIMEOUT_MS || '5000', 10);
    this.dependencyTimeout = parseInt(process.env.DEPENDENCY_TIMEOUT_MS || '2000', 10);
    
    // Simulate initialization completion after timeout
    setTimeout(() => {
      this.initializationComplete = true;
      this.logger.log('Application initialization completed', 'HealthCheckDomainService');
    }, this.startupTimeout);
  }

  /**
   * Performs a liveness check
   * Liveness: Is the application running?
   */
  checkLiveness(): HealthCheckResult {
    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
      const memoryLimitMB = parseInt(process.env.MEMORY_LIMIT_MB || '512', 10);

      if (memoryUsageMB > memoryLimitMB * 0.9) {
        this.logger.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`, 'HealthCheckDomainService');
        return HealthCheckResult.healthy('Application is alive', {
          memoryUsageMB: memoryUsageMB.toFixed(2),
          warning: 'High memory usage',
        });
      }

      return HealthCheckResult.healthy('Application is alive', {
        memoryUsageMB: memoryUsageMB.toFixed(2),
        uptime: process.uptime(),
      });
    } catch (error) {
      this.logger.error('Liveness check failed', error.stack, 'HealthCheckDomainService');
      return HealthCheckResult.unhealthy('Liveness check failed');
    }
  }

  /**
   * Performs a readiness check
   * Readiness: Is the application ready to serve traffic?
   */
  async checkReadiness(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now();
      const dependencies = await this.checkDependencies();
      const duration = Date.now() - startTime;

      const unhealthyDeps = dependencies.filter(dep => !dep.healthy);
      
      if (unhealthyDeps.length > 0) {
        const errorMessages = unhealthyDeps.map(dep => `${dep.name}: ${dep.error}`).join(', ');
        this.logger.warn(`Dependencies unhealthy: ${errorMessages}`, 'HealthCheckDomainService');
        
        return HealthCheckResult.unhealthy('Dependencies are not ready', {
          dependencies: dependencies.map(dep => ({
            name: dep.name,
            healthy: dep.healthy,
            responseTime: dep.responseTime,
            error: dep.error,
          })),
          duration,
        });
      }

      return HealthCheckResult.healthy('Application is ready', {
        dependencies: dependencies.map(dep => ({
          name: dep.name,
          healthy: dep.healthy,
          responseTime: dep.responseTime,
        })),
        duration,
      });
    } catch (error) {
      this.logger.error('Readiness check failed', error.stack, 'HealthCheckDomainService');
      return HealthCheckResult.unhealthy('Readiness check failed', {
        error: error.message,
      });
    }
  }

  /**
   * Performs a startup check
   * Startup: Has the application finished initializing?
   */
  async checkStartup(): Promise<HealthCheckResult> {
    try {
      if (!this.initializationComplete) {
        const elapsed = Date.now() - (process.uptime() * 1000);
        const remaining = Math.max(0, this.startupTimeout - elapsed);
        
        return HealthCheckResult.unhealthy('Application is still initializing', {
          elapsed: Math.floor(elapsed / 1000),
          remaining: Math.floor(remaining / 1000),
        });
      }

      return HealthCheckResult.healthy('Application has started', {
        initializationTime: this.startupTimeout,
      });
    } catch (error) {
      this.logger.error('Startup check failed', error.stack, 'HealthCheckDomainService');
      return HealthCheckResult.unhealthy('Startup check failed');
    }
  }

  /**
   * Creates a health status entity from check results
   */
  createHealthStatus(
    liveness: HealthCheckResult,
    readiness: HealthCheckResult,
    startup: HealthCheckResult,
  ): HealthStatusEntity {
    let status: HealthStatus;

    if (!liveness.isHealthy) {
      status = HealthStatus.UNHEALTHY;
    } else if (!readiness.isHealthy || !startup.isHealthy) {
      status = HealthStatus.DEGRADED;
    } else {
      status = HealthStatus.HEALTHY;
    }

    return new HealthStatusEntity(status, new Date(), {
      liveness: liveness.message,
      readiness: readiness.message,
      startup: startup.message,
    });
  }

  /**
   * Check all dependencies with timeout and circuit breaker
   */
  private async checkDependencies(): Promise<DependencyStatus[]> {
    const dependencies: DependencyStatus[] = [];

    // Check system resources (with circuit breaker)
    const systemResourcesCheck = await this.circuitBreaker.execute(
      'system-resources',
      async () => this.checkSystemResources(),
      async () => DependencyStatus.unhealthy('system-resources', 'Circuit breaker open', 0),
    );
    dependencies.push(systemResourcesCheck);

    // Check external services with circuit breaker (example)
    // const dbCheck = await this.circuitBreaker.execute(
    //   'database',
    //   async () => this.checkDatabase(),
    //   async () => DependencyStatus.unhealthy('database', 'Circuit breaker open', 0),
    // );
    // dependencies.push(dbCheck);

    return dependencies;
  }

  /**
   * Check system resources (memory, CPU)
   */
  private async checkSystemResources(): Promise<DependencyStatus> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
      const memoryLimitMB = parseInt(process.env.MEMORY_LIMIT_MB || '512', 10);

      if (memoryUsageMB > memoryLimitMB * 0.95) {
        return DependencyStatus.unhealthy(
          'system-resources',
          `Memory usage critical: ${memoryUsageMB.toFixed(2)}MB / ${memoryLimitMB}MB`,
          Date.now() - startTime,
        );
      }

      return DependencyStatus.healthy('system-resources', Date.now() - startTime);
    } catch (error) {
      return DependencyStatus.unhealthy(
        'system-resources',
        error.message,
        Date.now() - startTime,
      );
    }
  }
}

