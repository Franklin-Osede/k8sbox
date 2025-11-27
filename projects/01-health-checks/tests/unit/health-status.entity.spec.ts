import { HealthStatusEntity, HealthStatus } from '../../src/domain/entities/health-status.entity';

describe('HealthStatusEntity', () => {
  describe('isHealthy', () => {
    it('should return true when status is HEALTHY', () => {
      const entity = new HealthStatusEntity(HealthStatus.HEALTHY, new Date());
      
      expect(entity.isHealthy()).toBe(true);
    });

    it('should return false when status is not HEALTHY', () => {
      const entity = new HealthStatusEntity(HealthStatus.UNHEALTHY, new Date());
      
      expect(entity.isHealthy()).toBe(false);
    });
  });

  describe('isUnhealthy', () => {
    it('should return true when status is UNHEALTHY', () => {
      const entity = new HealthStatusEntity(HealthStatus.UNHEALTHY, new Date());
      
      expect(entity.isUnhealthy()).toBe(true);
    });

    it('should return false when status is not UNHEALTHY', () => {
      const entity = new HealthStatusEntity(HealthStatus.HEALTHY, new Date());
      
      expect(entity.isUnhealthy()).toBe(false);
    });
  });

  describe('isDegraded', () => {
    it('should return true when status is DEGRADED', () => {
      const entity = new HealthStatusEntity(HealthStatus.DEGRADED, new Date());
      
      expect(entity.isDegraded()).toBe(true);
    });

    it('should return false when status is not DEGRADED', () => {
      const entity = new HealthStatusEntity(HealthStatus.HEALTHY, new Date());
      
      expect(entity.isDegraded()).toBe(false);
    });
  });

  describe('details', () => {
    it('should store optional details', () => {
      const details = { database: 'connected', cache: 'disconnected' };
      const entity = new HealthStatusEntity(HealthStatus.DEGRADED, new Date(), details);
      
      expect(entity.details).toEqual(details);
    });
  });
});

