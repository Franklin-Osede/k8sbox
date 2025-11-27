import { Injectable } from '@nestjs/common';
import { HealthCheckDomainService } from '../../domain/domain-services/health-check.service';
import { HealthCheckResult } from '../../domain/value-objects/health-check-result.vo';

/**
 * Use Case: CheckReadinessUseCase
 * Application layer use case for readiness checks
 */
@Injectable()
export class CheckReadinessUseCase {
  constructor(
    private readonly healthCheckDomainService: HealthCheckDomainService,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    return this.healthCheckDomainService.checkReadiness();
  }
}

