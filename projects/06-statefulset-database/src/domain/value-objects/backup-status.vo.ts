/**
 * Value Object: BackupStatus
 * Represents backup operation status
 */
export enum BackupStatusType {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class BackupStatusVO {
  constructor(
    public readonly status: BackupStatusType,
    public readonly startedAt?: Date,
    public readonly completedAt?: Date,
    public readonly error?: string,
    public readonly size?: number,
  ) {}

  static pending(): BackupStatusVO {
    return new BackupStatusVO(BackupStatusType.PENDING);
  }

  static inProgress(startedAt: Date = new Date()): BackupStatusVO {
    return new BackupStatusVO(BackupStatusType.IN_PROGRESS, startedAt);
  }

  static completed(completedAt: Date = new Date(), size?: number): BackupStatusVO {
    return new BackupStatusVO(BackupStatusType.COMPLETED, undefined, completedAt, undefined, size);
  }

  static failed(error: string, startedAt?: Date): BackupStatusVO {
    return new BackupStatusVO(BackupStatusType.FAILED, startedAt, undefined, error);
  }

  isCompleted(): boolean {
    return this.status === BackupStatusType.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === BackupStatusType.FAILED;
  }

  isInProgress(): boolean {
    return this.status === BackupStatusType.IN_PROGRESS;
  }
}

