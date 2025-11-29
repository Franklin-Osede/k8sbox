import { TrafficRoutingEntity } from '../../src/domain/entities/traffic-routing-entity';
import { TrafficSplitVO } from '../../src/domain/value-objects/traffic-split.vo';
import { CircuitBreakerConfigVO } from '../../src/domain/value-objects/circuit-breaker-config.vo';

describe('TrafficRoutingEntity', () => {
  describe('create', () => {
    it('should create a valid traffic routing entity', () => {
      const split = TrafficSplitVO.create(80, 20);
      const routing = TrafficRoutingEntity.create('my-service', 'default', split);

      expect(routing.serviceName).toBe('my-service');
      expect(routing.namespace).toBe('default');
      expect(routing.trafficSplit).toBe(split);
      expect(routing.mTLSEnabled).toBe(true);
    });

    it('should throw error for empty service name', () => {
      const split = TrafficSplitVO.create(100, 0);
      expect(() => {
        TrafficRoutingEntity.create('', 'default', split);
      }).toThrow('Service name cannot be empty');
    });

    it('should throw error for empty namespace', () => {
      const split = TrafficSplitVO.create(100, 0);
      expect(() => {
        TrafficRoutingEntity.create('my-service', '', split);
      }).toThrow('Namespace cannot be empty');
    });
  });

  describe('updateTrafficSplit', () => {
    it('should update traffic split', () => {
      const split1 = TrafficSplitVO.create(100, 0);
      const routing = TrafficRoutingEntity.create('my-service', 'default', split1);
      const split2 = TrafficSplitVO.create(90, 10);
      const updated = routing.updateTrafficSplit(split2);

      expect(updated.trafficSplit).toBe(split2);
      expect(updated.isCanaryDeployment()).toBe(true);
    });
  });

  describe('updateCircuitBreaker', () => {
    it('should update circuit breaker config', () => {
      const split = TrafficSplitVO.create(100, 0);
      const routing = TrafficRoutingEntity.create('my-service', 'default', split);
      const circuitBreaker = CircuitBreakerConfigVO.strict();
      const updated = routing.updateCircuitBreaker(circuitBreaker);

      expect(updated.circuitBreaker).toBe(circuitBreaker);
    });
  });

  describe('toggleMTLS', () => {
    it('should toggle mTLS', () => {
      const split = TrafficSplitVO.create(100, 0);
      const routing = TrafficRoutingEntity.create('my-service', 'default', split);
      const updated = routing.toggleMTLS();

      expect(updated.mTLSEnabled).toBe(false);
    });
  });

  describe('isCanaryDeployment', () => {
    it('should return true for canary deployment', () => {
      const split = TrafficSplitVO.canary(10);
      const routing = TrafficRoutingEntity.create('my-service', 'default', split);

      expect(routing.isCanaryDeployment()).toBe(true);
    });

    it('should return false for full v1 deployment', () => {
      const split = TrafficSplitVO.fullV1();
      const routing = TrafficRoutingEntity.create('my-service', 'default', split);

      expect(routing.isCanaryDeployment()).toBe(false);
    });
  });
});

