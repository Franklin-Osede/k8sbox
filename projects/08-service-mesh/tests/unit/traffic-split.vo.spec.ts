import { TrafficSplitVO } from '../../src/domain/value-objects/traffic-split.vo';

describe('TrafficSplitVO', () => {
  describe('create', () => {
    it('should create a valid traffic split', () => {
      const split = TrafficSplitVO.create(80, 20);

      expect(split.v1Weight).toBe(80);
      expect(split.v2Weight).toBe(20);
      expect(split.isCanary()).toBe(true);
    });

    it('should throw error if weights do not sum to 100', () => {
      expect(() => {
        TrafficSplitVO.create(80, 10);
      }).toThrow('Traffic weights must sum to 100');
    });

    it('should throw error for invalid v1Weight', () => {
      expect(() => {
        TrafficSplitVO.create(-1, 100);
      }).toThrow('v1Weight must be between 0 and 100');

      expect(() => {
        TrafficSplitVO.create(101, 0);
      }).toThrow('v1Weight must be between 0 and 100');
    });
  });

  describe('canary', () => {
    it('should create canary split', () => {
      const split = TrafficSplitVO.canary(10);

      expect(split.v1Weight).toBe(90);
      expect(split.v2Weight).toBe(10);
      expect(split.isCanary()).toBe(true);
    });
  });

  describe('fullV1', () => {
    it('should create full v1 split', () => {
      const split = TrafficSplitVO.fullV1();

      expect(split.v1Weight).toBe(100);
      expect(split.v2Weight).toBe(0);
      expect(split.isFullV1()).toBe(true);
    });
  });

  describe('fullV2', () => {
    it('should create full v2 split', () => {
      const split = TrafficSplitVO.fullV2();

      expect(split.v1Weight).toBe(0);
      expect(split.v2Weight).toBe(100);
      expect(split.isFullV2()).toBe(true);
    });
  });
});

