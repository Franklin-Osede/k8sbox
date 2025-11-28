import { Injectable } from '@nestjs/common';
import { SecretKeyVO } from '../../domain/value-objects/secret-key.vo';
import { SecretRotationDomainService } from '../../domain/domain-services/secret-rotation.service';
import { SecretRotationEntity } from '../../domain/entities/secret-rotation.entity';

/**
 * Use Case: GetRotationStatusUseCase
 * Application layer use case for getting rotation status
 */
@Injectable()
export class GetRotationStatusUseCase {
  constructor(
    private readonly rotationDomainService: SecretRotationDomainService,
  ) {}

  execute(secretName: string, namespace: string): SecretRotationEntity | null {
    const secretKey = SecretKeyVO.create(secretName, namespace);
    return this.rotationDomainService.getRotationStatus(secretKey);
  }
}

