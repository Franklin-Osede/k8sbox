import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { TrafficRoutingEntity } from '../../domain/entities/traffic-routing-entity';

/**
 * Infrastructure Service: IstioDestinationRuleService
 * Interacts with Kubernetes API for Istio DestinationRule resources
 */
@Injectable()
export class IstioDestinationRuleService {
  private k8sCustomApi: k8s.CustomObjectsApi;
  private readonly group = 'networking.istio.io';
  private readonly version = 'v1beta1';
  private readonly plural = 'destinationrules';

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

    this.logger.log('Istio DestinationRule service initialized', 'IstioDestinationRuleService');
  }

  /**
   * Create or update DestinationRule with circuit breaker and mTLS
   */
  async createOrUpdateDestinationRule(routing: TrafficRoutingEntity): Promise<void> {
    try {
      const destinationRule = this.buildDestinationRule(routing);

      try {
        // Try to get existing DestinationRule
        await this.k8sCustomApi.getNamespacedCustomObject(
          this.group,
          this.version,
          routing.namespace,
          this.plural,
          routing.serviceName,
        ) as any;

        // Update existing
        await this.k8sCustomApi.replaceNamespacedCustomObject(
          this.group,
          this.version,
          routing.namespace,
          this.plural,
          routing.serviceName,
          destinationRule,
        );
        this.logger.log(
          `Updated DestinationRule ${routing.serviceName}`,
          'IstioDestinationRuleService',
        );
      } catch (error) {
        if (error.response?.statusCode === 404) {
          // Create new
          await this.k8sCustomApi.createNamespacedCustomObject(
            this.group,
            this.version,
            routing.namespace,
            this.plural,
            destinationRule,
          );
          this.logger.log(
            `Created DestinationRule ${routing.serviceName}`,
            'IstioDestinationRuleService',
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to create/update DestinationRule ${routing.serviceName}: ${error.message}`,
        error.stack,
        'IstioDestinationRuleService',
      );
      throw error;
    }
  }

  /**
   * Build DestinationRule manifest from routing entity
   */
  private buildDestinationRule(routing: TrafficRoutingEntity): any {
    const subsets = [
      {
        name: 'v1',
        labels: {
          version: 'v1',
        },
      },
      {
        name: 'v2',
        labels: {
          version: 'v2',
        },
      },
    ];

    const trafficPolicy: any = {};

    // Add mTLS configuration
    if (routing.mTLSEnabled) {
      trafficPolicy.tls = {
        mode: 'ISTIO_MUTUAL',
      };
    }

    // Add circuit breaker configuration
    if (routing.circuitBreaker) {
      trafficPolicy.outlierDetection = {
        consecutiveErrors: routing.circuitBreaker.consecutiveErrors,
        interval: `${routing.circuitBreaker.intervalSeconds}s`,
        baseEjectionTime: `${routing.circuitBreaker.baseEjectionTimeSeconds}s`,
        maxEjectionPercent: routing.circuitBreaker.maxEjectionPercent,
        minHealthPercent: routing.circuitBreaker.minHealthPercent,
      };
    }

    return {
      apiVersion: `${this.group}/${this.version}`,
      kind: 'DestinationRule',
      metadata: {
        name: routing.serviceName,
        namespace: routing.namespace,
        labels: {
          'app.kubernetes.io/managed-by': 'service-mesh-traffic',
        },
      },
      spec: {
        host: routing.serviceName,
        trafficPolicy,
        subsets,
      },
    };
  }
}

