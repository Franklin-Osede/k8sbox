import { Injectable } from '@nestjs/common';
import { SecretRotationEntity } from '../entities/secret-rotation.entity';
import { SecretKeyVO } from '../value-objects/secret-key.vo';
import { KubernetesSecretService } from '../../infrastructure/external/kubernetes-secret.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: SecretRotationDomainService
 * Core business logic for secret rotation
 */
@Injectable()
export class SecretRotationDomainService {
  private rotations: Map<string, SecretRotationEntity> = new Map();
  private readonly rotationIntervalHours: number;

  constructor(
    private readonly k8sSecretService: KubernetesSecretService,
    private readonly logger: AppLoggerService,
  ) {
    this.rotationIntervalHours = parseInt(
      process.env.ROTATION_INTERVAL_HOURS || '24',
      10,
    );
  }

  /**
   * Register a secret for rotation
   */
  registerSecret(secretKey: SecretKeyVO): SecretRotationEntity {
    const key = secretKey.toString();
    if (!this.rotations.has(key)) {
      const rotation = SecretRotationEntity.create(secretKey, this.rotationIntervalHours);
      this.rotations.set(key, rotation);
      this.logger.log(`Secret ${key} registered for rotation`, 'SecretRotationDomainService');
    }
    return this.rotations.get(key)!;
  }

  /**
   * Rotate a secret
   */
  async rotateSecret(secretKey: SecretKeyVO): Promise<SecretRotationEntity> {
    const key = secretKey.toString();
    let rotation = this.rotations.get(key);

    if (!rotation) {
      rotation = this.registerSecret(secretKey);
    }

    if (!rotation.shouldRotate()) {
      this.logger.debug(`Secret ${key} does not need rotation yet`, 'SecretRotationDomainService');
      return rotation;
    }

    // Mark as in progress
    rotation = rotation.markAsInProgress();
    this.rotations.set(key, rotation);

    try {
      // Perform rotation
      await this.k8sSecretService.rotateSecret(secretKey);

      // Mark as success
      rotation = rotation.markAsSuccess(this.rotationIntervalHours);
      this.rotations.set(key, rotation);

      this.logger.log(`Secret ${key} rotated successfully`, 'SecretRotationDomainService');
      return rotation;
    } catch (error) {
      // Mark as failed
      rotation = rotation.markAsFailed(error.message);
      this.rotations.set(key, rotation);

      this.logger.error(`Failed to rotate secret ${key}: ${error.message}`, error.stack, 'SecretRotationDomainService');
      throw error;
    }
  }

  /**
   * Get rotation status for a secret
   */
  getRotationStatus(secretKey: SecretKeyVO): SecretRotationEntity | null {
    return this.rotations.get(secretKey.toString()) || null;
  }

  /**
   * Get all registered rotations
   */
  getAllRotations(): SecretRotationEntity[] {
    return Array.from(this.rotations.values());
  }

  /**
   * Get rotations that need rotation
   */
  getRotationsDue(): SecretRotationEntity[] {
    return this.getAllRotations().filter((r) => r.shouldRotate());
  }
}

