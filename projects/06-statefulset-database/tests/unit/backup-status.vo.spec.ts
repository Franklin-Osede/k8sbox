import { BackupStatusVO, BackupStatusType } from '../../src/domain/value-objects/backup-status.vo';

describe('BackupStatusVO', () => {
  describe('pending', () => {
    it('should create pending status', () => {
      const status = BackupStatusVO.pending();

      expect(status.status).toBe(BackupStatusType.PENDING);
      expect(status.isInProgress()).toBe(false);
      expect(status.isCompleted()).toBe(false);
      expect(status.isFailed()).toBe(false);
    });
  });

  describe('inProgress', () => {
    it('should create in progress status', () => {
      const status = BackupStatusVO.inProgress();

      expect(status.status).toBe(BackupStatusType.IN_PROGRESS);
      expect(status.isInProgress()).toBe(true);
      expect(status.startedAt).toBeInstanceOf(Date);
    });
  });

  describe('completed', () => {
    it('should create completed status', () => {
      const status = BackupStatusVO.completed(new Date(), 1024);

      expect(status.status).toBe(BackupStatusType.COMPLETED);
      expect(status.isCompleted()).toBe(true);
      expect(status.size).toBe(1024);
    });
  });

  describe('failed', () => {
    it('should create failed status', () => {
      const status = BackupStatusVO.failed('Backup failed');

      expect(status.status).toBe(BackupStatusType.FAILED);
      expect(status.isFailed()).toBe(true);
      expect(status.error).toBe('Backup failed');
    });
  });
});

