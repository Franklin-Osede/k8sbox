import { Injectable } from '@nestjs/common';
import { SecretRotationDomainService } from '../../domain/domain-services/secret-rotation.service';
import { SecretRotationEntity } from '../../domain/entities/secret-rotation.entity';

/**
 * Use Case: RotateAllDueUseCase
 * Application layer use case for rotating all secrets that are due
 */
@Injectable()
export class RotateAllDueUseCase {
  constructor(
    private readonly rotationDomainService: SecretRotationDomainService,
  ) {}

  async execute(): Promise<Array<{ secret: SecretRotationEntity; success: boolean; error?: string }>> {
    const dueRotations = this.rotationDomainService.getRotationsDue();
    const results: Array<{ secret: SecretRotationEntity; success: boolean; error?: string }> = [];

    for (const rotation of dueRotations) {
      try {
        const rotated = await this.rotationDomainService.rotateSecret(rotation.secretKey);
        results.push({ secret: rotated, success: true });
      } catch (error) {
        results.push({
          secret: rotation,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

