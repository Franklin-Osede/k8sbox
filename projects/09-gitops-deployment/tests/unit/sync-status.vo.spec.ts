import { SyncStatusVO, SyncStatusType } from '../../src/domain/value-objects/sync-status.vo';

describe('SyncStatusVO', () => {
  describe('synced', () => {
    it('should create synced status', () => {
      const status = SyncStatusVO.synced('abc123');

      expect(status.status).toBe(SyncStatusType.SYNCED);
      expect(status.isSynced()).toBe(true);
      expect(status.revision).toBe('abc123');
    });
  });

  describe('outOfSync', () => {
    it('should create out of sync status', () => {
      const status = SyncStatusVO.outOfSync('Application is out of sync');

      expect(status.status).toBe(SyncStatusType.OUT_OF_SYNC);
      expect(status.isOutOfSync()).toBe(true);
    });
  });

  describe('syncing', () => {
    it('should create syncing status', () => {
      const status = SyncStatusVO.syncing();

      expect(status.status).toBe(SyncStatusType.SYNCING);
      expect(status.isSyncing()).toBe(true);
    });
  });

  describe('error', () => {
    it('should create error status', () => {
      const status = SyncStatusVO.error('Sync failed');

      expect(status.status).toBe(SyncStatusType.ERROR);
      expect(status.hasError()).toBe(true);
    });
  });
});

