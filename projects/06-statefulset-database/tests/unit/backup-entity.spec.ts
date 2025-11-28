import { BackupEntity } from '../../src/domain/entities/backup-entity';
import { BackupStatusVO } from '../../src/domain/value-objects/backup-status.vo';
import { SnapshotInfoVO } from '../../src/domain/value-objects/snapshot-info.vo';

describe('BackupEntity', () => {
  describe('create', () => {
    it('should create a valid backup entity', () => {
      const backup = BackupEntity.create('backup-1', 'postgres', 'default');

      expect(backup.id).toBe('backup-1');
      expect(backup.databaseName).toBe('postgres');
      expect(backup.namespace).toBe('default');
      expect(backup.status.status).toBe('pending');
      expect(backup.backupType).toBe('manual');
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        BackupEntity.create('', 'postgres', 'default');
      }).toThrow('Backup ID cannot be empty');
    });

    it('should throw error for empty database name', () => {
      expect(() => {
        BackupEntity.create('backup-1', '', 'default');
      }).toThrow('Database name cannot be empty');
    });

    it('should throw error for empty namespace', () => {
      expect(() => {
        BackupEntity.create('backup-1', 'postgres', '');
      }).toThrow('Namespace cannot be empty');
    });
  });

  describe('updateStatus', () => {
    it('should update backup status', () => {
      const backup = BackupEntity.create('backup-1', 'postgres', 'default');
      const newStatus = BackupStatusVO.inProgress();
      const updated = backup.updateStatus(newStatus);

      expect(updated.status).toBe(newStatus);
      expect(updated.isInProgress()).toBe(true);
    });
  });

  describe('setSnapshot', () => {
    it('should set snapshot info', () => {
      const backup = BackupEntity.create('backup-1', 'postgres', 'default');
      const snapshot = SnapshotInfoVO.create('snapshot-1', 'vs-1', 'pvc-1', 1024);
      const updated = backup.setSnapshot(snapshot);

      expect(updated.snapshotInfo).toBe(snapshot);
    });
  });

  describe('isCompleted', () => {
    it('should return true when status is completed', () => {
      const backup = BackupEntity.create('backup-1', 'postgres', 'default');
      const completedStatus = BackupStatusVO.completed();
      const updated = backup.updateStatus(completedStatus);

      expect(updated.isCompleted()).toBe(true);
    });
  });
});

