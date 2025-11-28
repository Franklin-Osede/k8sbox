import { BackupStatusVO } from '../value-objects/backup-status.vo';
import { SnapshotInfoVO } from '../value-objects/snapshot-info.vo';

/**
 * Domain Entity: BackupEntity
 * Represents a database backup operation
 */
export class BackupEntity {
  constructor(
    public readonly id: string,
    public readonly databaseName: string,
    public readonly namespace: string,
    public readonly status: BackupStatusVO,
    public readonly snapshotInfo?: SnapshotInfoVO,
    public readonly backupType: 'manual' | 'scheduled' = 'manual',
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('Backup ID cannot be empty');
    }
    if (!databaseName || databaseName.trim().length === 0) {
      throw new Error('Database name cannot be empty');
    }
    if (!namespace || namespace.trim().length === 0) {
      throw new Error('Namespace cannot be empty');
    }
  }

  static create(
    id: string,
    databaseName: string,
    namespace: string,
    backupType: 'manual' | 'scheduled' = 'manual',
  ): BackupEntity {
    return new BackupEntity(id, databaseName, namespace, BackupStatusVO.pending(), undefined, backupType);
  }

  updateStatus(status: BackupStatusVO): BackupEntity {
    return new BackupEntity(
      this.id,
      this.databaseName,
      this.namespace,
      status,
      this.snapshotInfo,
      this.backupType,
    );
  }

  setSnapshot(snapshotInfo: SnapshotInfoVO): BackupEntity {
    return new BackupEntity(
      this.id,
      this.databaseName,
      this.namespace,
      this.status,
      snapshotInfo,
      this.backupType,
    );
  }

  isCompleted(): boolean {
    return this.status.isCompleted();
  }

  isFailed(): boolean {
    return this.status.isFailed();
  }

  isInProgress(): boolean {
    return this.status.isInProgress();
  }
}

