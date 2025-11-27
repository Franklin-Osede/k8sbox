import { HealthCheckResult } from '../../src/domain/value-objects/health-check-result.vo';

describe('HealthCheckResult Value Object', () => {
  describe('healthy', () => {
    it('should create a healthy result', () => {
      const result = HealthCheckResult.healthy('OK');
      
      expect(result.isHealthy).toBe(true);
      expect(result.message).toBe('OK');
    });

    it('should create a healthy result with data', () => {
      const data = { version: '1.0.0' };
      const result = HealthCheckResult.healthy('OK', data);
      
      expect(result.isHealthy).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('unhealthy', () => {
    it('should create an unhealthy result', () => {
      const result = HealthCheckResult.unhealthy('Database connection failed');
      
      expect(result.isHealthy).toBe(false);
      expect(result.message).toBe('Database connection failed');
    });
  });

  describe('validation', () => {
    it('should throw error if message is empty', () => {
      expect(() => {
        new HealthCheckResult(true, '');
      }).toThrow('Health check message cannot be empty');
    });

    it('should throw error if message is whitespace only', () => {
      expect(() => {
        new HealthCheckResult(true, '   ');
      }).toThrow('Health check message cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for equal results', () => {
      const result1 = HealthCheckResult.healthy('OK');
      const result2 = HealthCheckResult.healthy('OK');
      
      expect(result1.equals(result2)).toBe(true);
    });

    it('should return false for different results', () => {
      const result1 = HealthCheckResult.healthy('OK');
      const result2 = HealthCheckResult.unhealthy('Failed');
      
      expect(result1.equals(result2)).toBe(false);
    });
  });
});

