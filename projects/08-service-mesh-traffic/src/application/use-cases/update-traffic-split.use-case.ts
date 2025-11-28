import { Injectable } from '@nestjs/common';
import { TrafficSplitVO } from '../../domain/value-objects/traffic-split.vo';
import { RoutingDomainService } from '../../domain/domain-services/routing.service';

/**
 * Use Case: UpdateTrafficSplitUseCase
 * Application layer use case for updating traffic split
 */
@Injectable()
export class UpdateTrafficSplitUseCase {
  constructor(private readonly routingService: RoutingDomainService) {}

  async execute(
    serviceName: string,
    namespace: string,
    trafficSplit: TrafficSplitVO,
  ): Promise<void> {
    await this.routingService.updateTrafficSplit(serviceName, namespace, trafficSplit);
  }
}

