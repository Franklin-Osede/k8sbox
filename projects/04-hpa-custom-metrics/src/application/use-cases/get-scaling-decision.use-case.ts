import { Injectable } from '@nestjs/common';
import { ScalingDomainService } from '../../domain/domain-services/scaling.service';
import { ScalingDecisionVO } from '../../domain/value-objects/scaling-decision.vo';

/**
 * Use Case: GetScalingDecisionUseCase
 * Application layer use case for getting scaling decisions
 */
@Injectable()
export class GetScalingDecisionUseCase {
  constructor(
    private readonly scalingDomainService: ScalingDomainService,
  ) {}

  execute(currentReplicas: number, metricType: 'rps' | 'queue' | 'connections' = 'rps'): ScalingDecisionVO {
    switch (metricType) {
      case 'rps':
        return this.scalingDomainService.decideScalingByRPS(currentReplicas);
      case 'queue':
        return this.scalingDomainService.decideScalingByQueueDepth(currentReplicas);
      case 'connections':
        return this.scalingDomainService.decideScalingByConnections(currentReplicas);
      default:
        return this.scalingDomainService.decideScalingByRPS(currentReplicas);
    }
  }
}

