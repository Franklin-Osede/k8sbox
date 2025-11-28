import { RotationStatusVO, RotationStatus } from '../../src/domain/value-objects/rotation-status.vo';

describe('RotationStatusVO', () => {
  describe('pending', () => {
    it('should create pending status', () => {
      const status = RotationStatusVO.pending();

      expect(status.status).toBe(RotationStatus.PENDING);
      expect(status.isPending()).toBe(true);
    });
  });

  describe('inProgress', () => {
    it('should create in-progress status', () => {
      const status = RotationStatusVO.inProgress();

      expect(status.status).toBe(RotationStatus.IN_PROGRESS);
      expect(status.isInProgress()).toBe(true);
    });
  });

  describe('success', () => {
    it('should create success status', () => {
      const status = RotationStatusVO.success();

      expect(status.status).toBe(RotationStatus.SUCCESS);
      expect(status.isSuccess()).toBe(true);
    });

    it('should create success status with custom message', () => {
      const status = RotationStatusVO.success('Custom success message');

      expect(status.message).toBe('Custom success message');
    });
  });

  describe('failed', () => {
    it('should create failed status', () => {
      const status = RotationStatusVO.failed('Error message');

      expect(status.status).toBe(RotationStatus.FAILED);
      expect(status.isFailed()).toBe(true);
      expect(status.message).toBe('Error message');
    });
  });
});

