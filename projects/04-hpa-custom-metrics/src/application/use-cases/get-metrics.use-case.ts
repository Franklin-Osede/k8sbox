import { Injectable } from '@nestjs/common';
import { ScalingDomainService } from '../../domain/domain-services/scaling.service';

/**
 * Use Case: GetMetricsUseCase
 * Application layer use case for getting metrics
 */
@Injectable()
export class GetMetricsUseCase {
  constructor(
    private readonly scalingDomainService: ScalingDomainService,
  ) {}

  execute(): {
    requestsPerSecond: number;
    queueDepth: number;
    activeConnections: number;
  } {
    return this.scalingDomainService.getMetricsSummary();
  }
}

