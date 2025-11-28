import { SecretKeyVO } from '../value-objects/secret-key.vo';
import { RotationStatusVO, RotationStatus } from '../value-objects/rotation-status.vo';

/**
 * Domain Entity: SecretRotation
 * Represents a secret rotation operation
 */
export class SecretRotationEntity {
  constructor(
    public readonly secretKey: SecretKeyVO,
    public readonly status: RotationStatusVO,
    public readonly rotationCount: number,
    public readonly lastRotationTime: Date | null,
    public readonly nextRotationTime: Date | null,
  ) {}

  static create(secretKey: SecretKeyVO, rotationIntervalHours: number = 24): SecretRotationEntity {
    const nextRotation = new Date();
    nextRotation.setHours(nextRotation.getHours() + rotationIntervalHours);

    return new SecretRotationEntity(
      secretKey,
      RotationStatusVO.pending(),
      0,
      null,
      nextRotation,
    );
  }

  markAsInProgress(): SecretRotationEntity {
    return new SecretRotationEntity(
      this.secretKey,
      RotationStatusVO.inProgress(),
      this.rotationCount,
      this.lastRotationTime,
      this.nextRotationTime,
    );
  }

  markAsSuccess(rotationIntervalHours: number = 24): SecretRotationEntity {
    const nextRotation = new Date();
    nextRotation.setHours(nextRotation.getHours() + rotationIntervalHours);

    return new SecretRotationEntity(
      this.secretKey,
      RotationStatusVO.success(),
      this.rotationCount + 1,
      new Date(),
      nextRotation,
    );
  }

  markAsFailed(errorMessage: string): SecretRotationEntity {
    return new SecretRotationEntity(
      this.secretKey,
      RotationStatusVO.failed(errorMessage),
      this.rotationCount,
      this.lastRotationTime,
      this.nextRotationTime,
    );
  }

  shouldRotate(): boolean {
    if (this.status.isInProgress()) {
      return false; // Already rotating
    }
    if (this.nextRotationTime === null) {
      return true; // No schedule, rotate now
    }
    return new Date() >= this.nextRotationTime;
  }

  isHealthy(): boolean {
    return this.status.isSuccess() || this.status.isPending();
  }
}

