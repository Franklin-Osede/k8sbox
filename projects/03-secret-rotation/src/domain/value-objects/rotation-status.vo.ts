/**
 * Value Object: RotationStatus
 * Represents the status of a secret rotation
 */
export enum RotationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export class RotationStatusVO {
  constructor(
    public readonly status: RotationStatus,
    public readonly message: string,
    public readonly timestamp: Date,
  ) {}

  static pending(): RotationStatusVO {
    return new RotationStatusVO(RotationStatus.PENDING, 'Rotation pending', new Date());
  }

  static inProgress(): RotationStatusVO {
    return new RotationStatusVO(RotationStatus.IN_PROGRESS, 'Rotation in progress', new Date());
  }

  static success(message: string = 'Rotation completed successfully'): RotationStatusVO {
    return new RotationStatusVO(RotationStatus.SUCCESS, message, new Date());
  }

  static failed(message: string): RotationStatusVO {
    return new RotationStatusVO(RotationStatus.FAILED, message, new Date());
  }

  isPending(): boolean {
    return this.status === RotationStatus.PENDING;
  }

  isInProgress(): boolean {
    return this.status === RotationStatus.IN_PROGRESS;
  }

  isSuccess(): boolean {
    return this.status === RotationStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === RotationStatus.FAILED;
  }
}

