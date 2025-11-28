import { AvailabilityLevelVO, AvailabilityType } from '../../src/domain/value-objects/availability-level.vo';

describe('AvailabilityLevelVO', () => {
  describe('minAvailable', () => {
    it('should create minAvailable with valid value', () => {
      const level = AvailabilityLevelVO.minAvailable(3);

      expect(level.type).toBe(AvailabilityType.MIN_AVAILABLE);
      expect(level.value).toBe(3);
    });

    it('should throw error for minAvailable less than 1', () => {
      expect(() => {
        AvailabilityLevelVO.minAvailable(0);
      }).toThrow('minAvailable must be at least 1');
    });

    it('should throw error for negative value', () => {
      expect(() => {
        AvailabilityLevelVO.minAvailable(-1);
      }).toThrow('Availability value cannot be negative');
    });
  });

  describe('maxUnavailable', () => {
    it('should create maxUnavailable with valid value', () => {
      const level = AvailabilityLevelVO.maxUnavailable(2);

      expect(level.type).toBe(AvailabilityType.MAX_UNAVAILABLE);
      expect(level.value).toBe(2);
    });

    it('should allow zero for maxUnavailable', () => {
      const level = AvailabilityLevelVO.maxUnavailable(0);
      expect(level.value).toBe(0);
    });
  });

  describe('percentage', () => {
    it('should create percentage with valid value', () => {
      const level = AvailabilityLevelVO.percentage(25);

      expect(level.type).toBe(AvailabilityType.MAX_UNAVAILABLE);
      expect(level.value).toBe(25);
    });

    it('should throw error for percentage less than 0', () => {
      expect(() => {
        AvailabilityLevelVO.percentage(-1);
      }).toThrow('Percentage must be between 0 and 100');
    });

    it('should throw error for percentage greater than 100', () => {
      expect(() => {
        AvailabilityLevelVO.percentage(101);
      }).toThrow('Percentage must be between 0 and 100');
    });
  });

  describe('equals', () => {
    it('should return true for equal values', () => {
      const level1 = AvailabilityLevelVO.minAvailable(3);
      const level2 = AvailabilityLevelVO.minAvailable(3);

      expect(level1.equals(level2)).toBe(true);
    });

    it('should return false for different values', () => {
      const level1 = AvailabilityLevelVO.minAvailable(3);
      const level2 = AvailabilityLevelVO.minAvailable(2);

      expect(level1.equals(level2)).toBe(false);
    });
  });
});

