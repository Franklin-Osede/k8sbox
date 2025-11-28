import { ResourceStatusVO, ResourceStatusType } from '../../src/domain/value-objects/resource-status.vo';

describe('ResourceStatusVO', () => {
  describe('pending', () => {
    it('should create pending status', () => {
      const status = ResourceStatusVO.pending();

      expect(status.status).toBe(ResourceStatusType.PENDING);
      expect(status.isPending()).toBe(true);
      expect(status.isReady()).toBe(false);
      expect(status.isFailed()).toBe(false);
    });
  });

  describe('reconciling', () => {
    it('should create reconciling status', () => {
      const status = ResourceStatusVO.reconciling('Reconciling resource');

      expect(status.status).toBe(ResourceStatusType.RECONCILING);
      expect(status.isReconciling()).toBe(true);
      expect(status.message).toBe('Reconciling resource');
    });
  });

  describe('ready', () => {
    it('should create ready status', () => {
      const status = ResourceStatusVO.ready('Resource is ready', 1);

      expect(status.status).toBe(ResourceStatusType.READY);
      expect(status.isReady()).toBe(true);
      expect(status.observedGeneration).toBe(1);
    });
  });

  describe('failed', () => {
    it('should create failed status', () => {
      const status = ResourceStatusVO.failed('Reconciliation failed');

      expect(status.status).toBe(ResourceStatusType.FAILED);
      expect(status.isFailed()).toBe(true);
      expect(status.message).toBe('Reconciliation failed');
    });
  });

  describe('deleting', () => {
    it('should create deleting status', () => {
      const status = ResourceStatusVO.deleting();

      expect(status.status).toBe(ResourceStatusType.DELETING);
    });
  });
});

