import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckDomainService } from '../../src/domain/domain-services/health-check.service';
import { HealthCheckResult } from '../../src/domain/value-objects/health-check-result.vo';
import { HealthStatus } from '../../src/domain/entities/health-status.entity';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';
import { CircuitBreakerService } from '../../src/infrastructure/external/circuit-breaker.service';
import { DependencyStatus } from '../../src/domain/value-objects/dependency-status.vo';

describe('HealthCheckDomainService', () => {
  let service: HealthCheckDomainService;
  let logger: AppLoggerService;
  let circuitBreaker: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckDomainService,
        AppLoggerService,
        CircuitBreakerService,
      ],
    }).compile();

    service = module.get<HealthCheckDomainService>(HealthCheckDomainService);
    logger = module.get<AppLoggerService>(AppLoggerService);
    circuitBreaker = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  describe('checkLiveness', () => {
    it('should return healthy result', () => {
      const result = service.checkLiveness();
      
      expect(result.isHealthy).toBe(true);
      expect(result.message).toBe('Application is alive');
    });
  });

  describe('checkReadiness', () => {
    it('should return healthy when dependencies are ready', async () => {
      // Mock circuit breaker to return healthy dependency
      jest.spyOn(circuitBreaker, 'execute').mockResolvedValue(
        DependencyStatus.healthy('system-resources', 0),
      );

      const result = await service.checkReadiness();
      
      expect(result.isHealthy).toBe(true);
      expect(result.message).toBe('Application is ready');
    });
  });

  describe('checkStartup', () => {
    it('should return unhealthy when initialization is not complete', async () => {
      // Test immediately after service creation (before timeout)
      const result = await service.checkStartup();
      
      // Should be unhealthy initially (before initialization completes)
      expect(result.isHealthy).toBe(false);
      expect(result.message).toBe('Application is still initializing');
      expect(result.data).toBeDefined();
      expect(result.data?.elapsed).toBeDefined();
    });

    it('should return healthy after initialization timeout', async () => {
      // Wait for initialization timeout (default 5000ms)
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const result = await service.checkStartup();
      
      expect(result.isHealthy).toBe(true);
      expect(result.message).toBe('Application has started');
    }, 10000); // Increase timeout for this test
  });

  describe('createHealthStatus', () => {
    it('should create UNHEALTHY status when liveness fails', () => {
      const liveness = HealthCheckResult.unhealthy('Dead');
      const readiness = HealthCheckResult.healthy('Ready');
      const startup = HealthCheckResult.healthy('Started');
      
      const status = service.createHealthStatus(liveness, readiness, startup);
      
      expect(status.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('should create DEGRADED status when readiness or startup fails', () => {
      const liveness = HealthCheckResult.healthy('Alive');
      const readiness = HealthCheckResult.unhealthy('Not ready');
      const startup = HealthCheckResult.healthy('Started');
      
      const status = service.createHealthStatus(liveness, readiness, startup);
      
      expect(status.status).toBe(HealthStatus.DEGRADED);
    });

    it('should create HEALTHY status when all checks pass', () => {
      const liveness = HealthCheckResult.healthy('Alive');
      const readiness = HealthCheckResult.healthy('Ready');
      const startup = HealthCheckResult.healthy('Started');
      
      const status = service.createHealthStatus(liveness, readiness, startup);
      
      expect(status.status).toBe(HealthStatus.HEALTHY);
    });
  });
});

