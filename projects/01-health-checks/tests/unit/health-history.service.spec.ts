import { Test, TestingModule } from '@nestjs/testing';
import { HealthHistoryService } from '../../src/infrastructure/external/health-history.service';
import { AppLoggerService } from '../../src/infrastructure/external/logger.service';
import { HealthCheckResult } from '../../src/domain/value-objects/health-check-result.vo';

describe('HealthHistoryService', () => {
  let service: HealthHistoryService;
  let logger: AppLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthHistoryService,
        AppLoggerService,
      ],
    }).compile();

    service = module.get<HealthHistoryService>(HealthHistoryService);
    logger = module.get<AppLoggerService>(AppLoggerService);
  });

  describe('record', () => {
    it('should record health check in history', () => {
      const liveness = HealthCheckResult.healthy('Alive');
      const readiness = HealthCheckResult.healthy('Ready');
      const startup = HealthCheckResult.healthy('Started');

      service.record(liveness, readiness, startup);

      const history = service.getHistory(1);
      expect(history.length).toBe(1);
      expect(history[0].overallStatus).toBe('healthy');
    });

    it('should limit history size', () => {
      // Record more than max size
      for (let i = 0; i < 150; i++) {
        service.record(
          HealthCheckResult.healthy('Alive'),
          HealthCheckResult.healthy('Ready'),
          HealthCheckResult.healthy('Started'),
        );
      }

      const history = service.getAllHistory();
      expect(history.length).toBeLessThanOrEqual(100); // Default max size
    });
  });

  describe('getHistory', () => {
    it('should return limited history', () => {
      // Record multiple checks
      for (let i = 0; i < 5; i++) {
        service.record(
          HealthCheckResult.healthy('Alive'),
          HealthCheckResult.healthy('Ready'),
          HealthCheckResult.healthy('Started'),
        );
      }

      const history = service.getHistory(3);
      expect(history.length).toBe(3);
    });
  });

  describe('getUptimeStats', () => {
    it('should calculate uptime statistics', () => {
      // Record mix of healthy and unhealthy
      service.record(
        HealthCheckResult.healthy('Alive'),
        HealthCheckResult.healthy('Ready'),
        HealthCheckResult.healthy('Started'),
      );
      service.record(
        HealthCheckResult.healthy('Alive'),
        HealthCheckResult.unhealthy('Not ready'),
        HealthCheckResult.healthy('Started'),
      );

      const stats = service.getUptimeStats();

      expect(stats.totalChecks).toBe(2);
      expect(stats.healthyCount).toBe(1);
      expect(stats.degradedCount).toBe(1);
      expect(stats.uptimePercentage).toBe(50);
    });

    it('should return 100% uptime for empty history', () => {
      const stats = service.getUptimeStats();

      expect(stats.totalChecks).toBe(0);
      expect(stats.uptimePercentage).toBe(100);
    });
  });

  describe('clear', () => {
    it('should clear history', () => {
      service.record(
        HealthCheckResult.healthy('Alive'),
        HealthCheckResult.healthy('Ready'),
        HealthCheckResult.healthy('Started'),
      );

      service.clear();

      const history = service.getAllHistory();
      expect(history.length).toBe(0);
    });
  });
});

