import { Injectable } from '@nestjs/common';
import { SecretKeyVO } from '../../domain/value-objects/secret-key.vo';
import { SecretRotationDomainService } from '../../domain/domain-services/secret-rotation.service';
import { SecretRotationEntity } from '../../domain/entities/secret-rotation.entity';

/**
 * Use Case: RotateSecretUseCase
 * Application layer use case for rotating a secret
 */
@Injectable()
export class RotateSecretUseCase {
  constructor(
    private readonly rotationDomainService: SecretRotationDomainService,
  ) {}

  async execute(secretName: string, namespace: string): Promise<SecretRotationEntity> {
    const secretKey = SecretKeyVO.create(secretName, namespace);
    return this.rotationDomainService.rotateSecret(secretKey);
  }
}

