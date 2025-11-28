import { Injectable } from '@nestjs/common';
import { TrafficRoutingEntity } from '../../domain/entities/traffic-routing-entity';
import { RoutingDomainService } from '../../domain/domain-services/routing.service';

/**
 * Use Case: ApplyRoutingUseCase
 * Application layer use case for applying traffic routing
 */
@Injectable()
export class ApplyRoutingUseCase {
  constructor(private readonly routingService: RoutingDomainService) {}

  async execute(routing: TrafficRoutingEntity): Promise<void> {
    // Validate routing
    const validation = this.routingService.validateRouting(routing);
    if (!validation.valid) {
      throw new Error(`Invalid routing configuration: ${validation.errors.join(', ')}`);
    }

    // Apply routing
    await this.routingService.applyRouting(routing);
  }
}

