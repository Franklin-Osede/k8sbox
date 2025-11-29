import { CircuitBreakerConfigVO } from '../../src/domain/value-objects/circuit-breaker-config.vo';

describe('CircuitBreakerConfigVO', () => {
  describe('create', () => {
    it('should create a valid circuit breaker config', () => {
      const config = CircuitBreakerConfigVO.create(5, 30, 30, 50, 50);

      expect(config.consecutiveErrors).toBe(5);
      expect(config.intervalSeconds).toBe(30);
      expect(config.maxEjectionPercent).toBe(50);
    });

    it('should throw error for invalid consecutiveErrors', () => {
      expect(() => {
        CircuitBreakerConfigVO.create(0, 30, 30, 50, 50);
      }).toThrow('Consecutive errors must be at least 1');
    });

    it('should throw error for invalid maxEjectionPercent', () => {
      expect(() => {
        CircuitBreakerConfigVO.create(5, 30, 30, 101, 50);
      }).toThrow('Max ejection percent must be between 0 and 100');
    });
  });

  describe('default', () => {
    it('should create default config', () => {
      const config = CircuitBreakerConfigVO.default();

      expect(config.consecutiveErrors).toBe(5);
      expect(config.intervalSeconds).toBe(30);
    });
  });

  describe('strict', () => {
    it('should create strict config', () => {
      const config = CircuitBreakerConfigVO.strict();

      expect(config.consecutiveErrors).toBe(3);
      expect(config.maxEjectionPercent).toBe(75);
    });
  });
});

