import { Injectable } from '@nestjs/common';
import { TrafficRoutingEntity } from '../entities/traffic-routing-entity';
import { TrafficSplitVO } from '../value-objects/traffic-split.vo';
import { IstioVirtualServiceService } from '../../infrastructure/external/istio-virtualservice.service';
import { IstioDestinationRuleService } from '../../infrastructure/external/istio-destinationrule.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: RoutingDomainService
 * Core business logic for traffic routing
 */
@Injectable()
export class RoutingDomainService {
  constructor(
    private readonly virtualServiceService: IstioVirtualServiceService,
    private readonly destinationRuleService: IstioDestinationRuleService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Apply traffic routing configuration
   */
  async applyRouting(routing: TrafficRoutingEntity): Promise<void> {
    try {
      this.logger.log(
        `Applying traffic routing for ${routing.serviceName} in namespace ${routing.namespace}`,
        'RoutingDomainService',
      );

      // Create/update VirtualService for traffic splitting
      await this.virtualServiceService.createOrUpdateVirtualService(routing);

      // Create/update DestinationRule for circuit breaker and mTLS
      await this.destinationRuleService.createOrUpdateDestinationRule(routing);

      this.logger.log(
        `Successfully applied traffic routing for ${routing.serviceName}`,
        'RoutingDomainService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to apply routing for ${routing.serviceName}: ${error.message}`,
        error.stack,
        'RoutingDomainService',
      );
      throw error;
    }
  }

  /**
   * Update traffic split (canary deployment)
   */
  async updateTrafficSplit(
    serviceName: string,
    namespace: string,
    trafficSplit: TrafficSplitVO,
  ): Promise<void> {
    try {
      // Get current VirtualService
      const virtualService = await this.virtualServiceService.getVirtualService(
        serviceName,
        namespace,
      );

      if (!virtualService) {
        throw new Error(`VirtualService ${serviceName} not found`);
      }

      // Build routing entity from existing VirtualService
      const routing = this.buildRoutingFromVirtualService(virtualService, namespace);
      const updatedRouting = routing.updateTrafficSplit(trafficSplit);

      // Apply updated routing
      await this.applyRouting(updatedRouting);
    } catch (error) {
      this.logger.error(
        `Failed to update traffic split for ${serviceName}: ${error.message}`,
        error.stack,
        'RoutingDomainService',
      );
      throw error;
    }
  }

  /**
   * Validate routing configuration
   */
  validateRouting(routing: TrafficRoutingEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!routing.serviceName || routing.serviceName.trim().length === 0) {
      errors.push('Service name is required');
    }

    if (!routing.namespace || routing.namespace.trim().length === 0) {
      errors.push('Namespace is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build routing entity from VirtualService (helper method)
   */
  private buildRoutingFromVirtualService(
    virtualService: any,
    namespace: string,
  ): TrafficRoutingEntity {
    const serviceName = virtualService.metadata.name;
    const httpRoutes = virtualService.spec?.http || [];
    let v1Weight = 0;
    let v2Weight = 0;

    if (httpRoutes.length > 0 && httpRoutes[0].route) {
      for (const route of httpRoutes[0].route) {
        if (route.destination?.subset === 'v1') {
          v1Weight = route.weight || 0;
        } else if (route.destination?.subset === 'v2') {
          v2Weight = route.weight || 0;
        }
      }
    }

    const trafficSplit = TrafficSplitVO.create(v1Weight, v2Weight);
    return TrafficRoutingEntity.create(serviceName, namespace, trafficSplit);
  }
}

