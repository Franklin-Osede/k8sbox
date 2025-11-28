/**
 * Value Object: SyncStatus
 * Represents ArgoCD application sync status
 */
export enum SyncStatusType {
  SYNCED = 'Synced',
  OUT_OF_SYNC = 'OutOfSync',
  SYNCING = 'Syncing',
  UNKNOWN = 'Unknown',
  ERROR = 'Error',
}

export class SyncStatusVO {
  constructor(
    public readonly status: SyncStatusType,
    public readonly message?: string,
    public readonly syncedAt?: Date,
    public readonly revision?: string,
  ) {}

  static synced(revision?: string, syncedAt?: Date): SyncStatusVO {
    return new SyncStatusVO(SyncStatusType.SYNCED, 'Application is synced', syncedAt, revision);
  }

  static outOfSync(message?: string): SyncStatusVO {
    return new SyncStatusVO(SyncStatusType.OUT_OF_SYNC, message || 'Application is out of sync');
  }

  static syncing(message?: string): SyncStatusVO {
    return new SyncStatusVO(SyncStatusType.SYNCING, message || 'Application is syncing');
  }

  static error(message: string): SyncStatusVO {
    return new SyncStatusVO(SyncStatusType.ERROR, message);
  }

  static unknown(): SyncStatusVO {
    return new SyncStatusVO(SyncStatusType.UNKNOWN, 'Status unknown');
  }

  isSynced(): boolean {
    return this.status === SyncStatusType.SYNCED;
  }

  isOutOfSync(): boolean {
    return this.status === SyncStatusType.OUT_OF_SYNC;
  }

  isSyncing(): boolean {
    return this.status === SyncStatusType.SYNCING;
  }

  hasError(): boolean {
    return this.status === SyncStatusType.ERROR;
  }
}

