import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { TrafficRoutingEntity } from '../../domain/entities/traffic-routing-entity';
import { TrafficSplitVO } from '../../domain/value-objects/traffic-split.vo';

/**
 * Infrastructure Service: IstioVirtualServiceService
 * Interacts with Kubernetes API for Istio VirtualService resources
 */
@Injectable()
export class IstioVirtualServiceService {
  private k8sCustomApi: k8s.CustomObjectsApi;
  private readonly group = 'networking.istio.io';
  private readonly version = 'v1beta1';
  private readonly plural = 'virtualservices';

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

    this.logger.log('Istio VirtualService service initialized', 'IstioVirtualServiceService');
  }

  /**
   * Create or update VirtualService for traffic routing
   */
  async createOrUpdateVirtualService(routing: TrafficRoutingEntity): Promise<void> {
    try {
      const virtualService = this.buildVirtualService(routing);

      try {
        // Try to get existing VirtualService
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
          virtualService,
        );
        this.logger.log(
          `Updated VirtualService ${routing.serviceName}`,
          'IstioVirtualServiceService',
        );
      } catch (error) {
        if (error.response?.statusCode === 404) {
          // Create new
          await this.k8sCustomApi.createNamespacedCustomObject(
            this.group,
            this.version,
            routing.namespace,
            this.plural,
            virtualService,
          );
          this.logger.log(
            `Created VirtualService ${routing.serviceName}`,
            'IstioVirtualServiceService',
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to create/update VirtualService ${routing.serviceName}: ${error.message}`,
        error.stack,
        'IstioVirtualServiceService',
      );
      throw error;
    }
  }

  /**
   * Get VirtualService
   */
  async getVirtualService(name: string, namespace: string): Promise<any> {
    try {
      const response = await this.k8sCustomApi.getNamespacedCustomObject(
        this.group,
        this.version,
        namespace,
        this.plural,
        name,
      ) as any;
      return response.body;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get VirtualService ${name}: ${error.message}`,
        error.stack,
        'IstioVirtualServiceService',
      );
      throw error;
    }
  }

  /**
   * Delete VirtualService
   */
  async deleteVirtualService(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sCustomApi.deleteNamespacedCustomObject(
        this.group,
        this.version,
        namespace,
        this.plural,
        name,
      );
      this.logger.log(`Deleted VirtualService ${name}`, 'IstioVirtualServiceService');
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return;
      }
      this.logger.error(
        `Failed to delete VirtualService ${name}: ${error.message}`,
        error.stack,
        'IstioVirtualServiceService',
      );
      throw error;
    }
  }

  /**
   * Build VirtualService manifest from routing entity
   */
  private buildVirtualService(routing: TrafficRoutingEntity): any {
    const httpRoutes: any[] = [];

    if (routing.trafficSplit.isCanary()) {
      // Canary deployment with traffic splitting
      httpRoutes.push({
        match: [{ uri: { prefix: '/' } }],
        route: [
          {
            destination: {
              host: `${routing.serviceName}`,
              subset: 'v1',
            },
            weight: routing.trafficSplit.v1Weight,
          },
          {
            destination: {
              host: `${routing.serviceName}`,
              subset: 'v2',
            },
            weight: routing.trafficSplit.v2Weight,
          },
        ],
      });
    } else if (routing.trafficSplit.isFullV1()) {
      // Full v1 deployment
      httpRoutes.push({
        match: [{ uri: { prefix: '/' } }],
        route: [
          {
            destination: {
              host: `${routing.serviceName}`,
              subset: 'v1',
            },
            weight: 100,
          },
        ],
      });
    } else if (routing.trafficSplit.isFullV2()) {
      // Full v2 deployment
      httpRoutes.push({
        match: [{ uri: { prefix: '/' } }],
        route: [
          {
            destination: {
              host: `${routing.serviceName}`,
              subset: 'v2',
            },
            weight: 100,
          },
        ],
      });
    }

    return {
      apiVersion: `${this.group}/${this.version}`,
      kind: 'VirtualService',
      metadata: {
        name: routing.serviceName,
        namespace: routing.namespace,
        labels: {
          'app.kubernetes.io/managed-by': 'service-mesh-traffic',
        },
      },
      spec: {
        hosts: [routing.serviceName],
        http: httpRoutes,
      },
    };
  }
}

