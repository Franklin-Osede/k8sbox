import { Injectable } from '@nestjs/common';
import { HealthCheckDomainService } from '../../domain/domain-services/health-check.service';
import { HealthCheckResult } from '../../domain/value-objects/health-check-result.vo';

/**
 * Use Case: CheckStartupUseCase
 * Application layer use case for startup checks
 */
@Injectable()
export class CheckStartupUseCase {
  constructor(
    private readonly healthCheckDomainService: HealthCheckDomainService,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    return this.healthCheckDomainService.checkStartup();
  }
}

