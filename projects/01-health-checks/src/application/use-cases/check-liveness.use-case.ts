import { Injectable } from '@nestjs/common';
import { HealthCheckDomainService } from '../../domain/domain-services/health-check.service';
import { HealthCheckResult } from '../../domain/value-objects/health-check-result.vo';

/**
 * Use Case: CheckLivenessUseCase
 * Application layer use case for liveness checks
 */
@Injectable()
export class CheckLivenessUseCase {
  constructor(
    private readonly healthCheckDomainService: HealthCheckDomainService,
  ) {}

  execute(): HealthCheckResult {
    return this.healthCheckDomainService.checkLiveness();
  }
}

