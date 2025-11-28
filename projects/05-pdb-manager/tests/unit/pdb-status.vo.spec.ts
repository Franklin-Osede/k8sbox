import { PDBStatusVO, PDBStatusType } from '../../src/domain/value-objects/pdb-status.vo';

describe('PDBStatusVO', () => {
  describe('healthy', () => {
    it('should create healthy status', () => {
      const status = PDBStatusVO.healthy(5, 5, 2);

      expect(status.status).toBe(PDBStatusType.HEALTHY);
      expect(status.currentHealthy).toBe(5);
      expect(status.desiredHealthy).toBe(5);
      expect(status.isHealthy()).toBe(true);
      expect(status.isViolated()).toBe(false);
    });
  });

  describe('violated', () => {
    it('should create violated status', () => {
      const status = PDBStatusVO.violated(3, 5, 2, 1);

      expect(status.status).toBe(PDBStatusType.VIOLATED);
      expect(status.currentHealthy).toBe(3);
      expect(status.disruptedPods).toBe(2);
      expect(status.isHealthy()).toBe(false);
      expect(status.isViolated()).toBe(true);
    });
  });

  describe('pending', () => {
    it('should create pending status', () => {
      const status = PDBStatusVO.pending(0, 5);

      expect(status.status).toBe(PDBStatusType.PENDING);
      expect(status.currentHealthy).toBe(0);
      expect(status.isHealthy()).toBe(false);
      expect(status.isViolated()).toBe(false);
    });
  });

  describe('getAvailabilityPercentage', () => {
    it('should calculate availability percentage correctly', () => {
      const status = PDBStatusVO.healthy(4, 5, 1);

      expect(status.getAvailabilityPercentage()).toBe(80);
    });

    it('should return 0 when desiredHealthy is 0', () => {
      const status = PDBStatusVO.pending(0, 0);

      expect(status.getAvailabilityPercentage()).toBe(0);
    });
  });
});

