import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';
import { ResourceSpecVO } from '../../domain/value-objects/resource-spec.vo';
import { ResourceStatusVO } from '../../domain/value-objects/resource-status.vo';

/**
 * Infrastructure Service: KubernetesCRDService
 * Interacts with Kubernetes API for Custom Resources
 */
@Injectable()
export class KubernetesCRDService {
  private k8sCustomApi: k8s.CustomObjectsApi;
  private k8sAppsApi: k8s.AppsV1Api;
  private k8sCoreApi: k8s.CoreV1Api;
  private readonly group = 'platform.k8sbox.io';
  private readonly version = 'v1';
  private readonly plural = 'applications';

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);
    this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

    this.logger.log('Kubernetes CRD service initialized', 'KubernetesCRDService');
  }

  /**
   * Get custom resource
   */
  async getCustomResource(name: string, namespace: string): Promise<CustomResourceEntity | null> {
    try {
      const response = await this.k8sCustomApi.getNamespacedCustomObject(
        this.group,
        this.version,
        namespace,
        this.plural,
        name,
      ) as any;

      return this.mapToEntity(response.body);
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get custom resource ${name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * List custom resources
   */
  async listCustomResources(namespace?: string): Promise<CustomResourceEntity[]> {
    try {
      const response = await this.k8sCustomApi.listNamespacedCustomObject(
        this.group,
        this.version,
        namespace || 'default',
        this.plural,
      ) as any;

      const resources: CustomResourceEntity[] = [];
      for (const item of response.body.items || []) {
        resources.push(this.mapToEntity(item));
      }
      return resources;
    } catch (error) {
      this.logger.error(
        `Failed to list custom resources: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Update custom resource status
   */
  async updateStatus(
    name: string,
    namespace: string,
    status: ResourceStatusVO,
    observedGeneration?: number,
  ): Promise<void> {
    try {
      const resource = await this.k8sCustomApi.getNamespacedCustomObject(
        this.group,
        this.version,
        namespace,
        this.plural,
        name,
      ) as any;

      const body = resource.body;
      body.status = {
        status: status.status,
        message: status.message,
        lastReconciledAt: status.lastReconciledAt?.toISOString(),
        observedGeneration: observedGeneration || body.metadata.generation,
      };

      await this.k8sCustomApi.replaceNamespacedCustomObjectStatus(
        this.group,
        this.version,
        namespace,
        this.plural,
        name,
        body,
      );

      this.logger.log(`Updated status for ${name}`, 'KubernetesCRDService');
    } catch (error) {
      this.logger.error(
        `Failed to update status for ${name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Create Deployment from custom resource
   */
  async createDeployment(resource: CustomResourceEntity): Promise<void> {
    try {
      const deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: resource.name,
          namespace: resource.namespace,
          labels: {
            'app.kubernetes.io/name': resource.name,
            'app.kubernetes.io/managed-by': 'custom-operator',
          },
          ownerReferences: resource.uid
            ? [
                {
                  apiVersion: `${this.group}/${this.version}`,
                  kind: 'Application',
                  name: resource.name,
                  uid: resource.uid,
                  controller: true,
                },
              ]
            : [],
        },
        spec: {
          replicas: resource.spec.replicas,
          selector: {
            matchLabels: {
              'app.kubernetes.io/name': resource.name,
            },
          },
          template: {
            metadata: {
              labels: {
                'app.kubernetes.io/name': resource.name,
              },
            },
            spec: {
              containers: [
                {
                  name: resource.name,
                  image: resource.spec.image,
                  ports: [
                    {
                      containerPort: resource.spec.port,
                    },
                  ],
                  env: resource.spec.env
                    ? Object.entries(resource.spec.env).map(([key, value]) => ({
                        name: key,
                        value: String(value),
                      }))
                    : [],
                },
              ],
            },
          },
        },
      };

      await this.k8sAppsApi.createNamespacedDeployment(resource.namespace, deployment);
      this.logger.log(`Created deployment for ${resource.name}`, 'KubernetesCRDService');
    } catch (error) {
      if (error.response?.statusCode === 409) {
        // Deployment already exists, update it
        await this.updateDeployment(resource);
        return;
      }
      this.logger.error(
        `Failed to create deployment for ${resource.name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Update Deployment
   */
  async updateDeployment(resource: CustomResourceEntity): Promise<void> {
    try {
      const existing = await this.k8sAppsApi.readNamespacedDeployment(
        resource.name,
        resource.namespace,
      );

      existing.body.spec.replicas = resource.spec.replicas;
      existing.body.spec.template.spec.containers[0].image = resource.spec.image;
      existing.body.spec.template.spec.containers[0].ports[0].containerPort = resource.spec.port;

      if (resource.spec.env) {
        existing.body.spec.template.spec.containers[0].env = Object.entries(resource.spec.env).map(
          ([key, value]) => ({
            name: key,
            value: String(value),
          }),
        );
      }

      await this.k8sAppsApi.replaceNamespacedDeployment(
        resource.name,
        resource.namespace,
        existing.body,
      );

      this.logger.log(`Updated deployment for ${resource.name}`, 'KubernetesCRDService');
    } catch (error) {
      this.logger.error(
        `Failed to update deployment for ${resource.name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Check if Deployment exists
   */
  async deploymentExists(name: string, namespace: string): Promise<boolean> {
    try {
      await this.k8sAppsApi.readNamespacedDeployment(name, namespace);
      return true;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete Deployment
   */
  async deleteDeployment(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sAppsApi.deleteNamespacedDeployment(name, namespace);
      this.logger.log(`Deleted deployment ${name}`, 'KubernetesCRDService');
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return;
      }
      this.logger.error(
        `Failed to delete deployment ${name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Create Service from custom resource
   */
  async createService(resource: CustomResourceEntity): Promise<void> {
    try {
      const service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: resource.name,
          namespace: resource.namespace,
          labels: {
            'app.kubernetes.io/name': resource.name,
            'app.kubernetes.io/managed-by': 'custom-operator',
          },
          ownerReferences: resource.uid
            ? [
                {
                  apiVersion: `${this.group}/${this.version}`,
                  kind: 'Application',
                  name: resource.name,
                  uid: resource.uid,
                  controller: true,
                },
              ]
            : [],
        },
        spec: {
          selector: {
            'app.kubernetes.io/name': resource.name,
          },
          ports: [
            {
              port: resource.spec.port,
              targetPort: resource.spec.port,
            },
          ],
        },
      };

      await this.k8sCoreApi.createNamespacedService(resource.namespace, service);
      this.logger.log(`Created service for ${resource.name}`, 'KubernetesCRDService');
    } catch (error) {
      if (error.response?.statusCode === 409) {
        // Service already exists
        return;
      }
      this.logger.error(
        `Failed to create service for ${resource.name}: ${error.message}`,
        error.stack,
        'KubernetesCRDService',
      );
      throw error;
    }
  }

  /**
   * Map Kubernetes resource to domain entity
   */
  private mapToEntity(item: any): CustomResourceEntity {
    const spec = item.spec || {};
    const status = item.status || {};

    const resourceSpec = ResourceSpecVO.create(
      spec.replicas || 1,
      spec.image || '',
      spec.port || 80,
      spec.env,
    );

    let resourceStatus: ResourceStatusVO;
    if (status.status) {
      switch (status.status) {
        case 'Ready':
          resourceStatus = ResourceStatusVO.ready(
            status.message,
            status.observedGeneration,
          );
          break;
        case 'Failed':
          resourceStatus = ResourceStatusVO.failed(status.message || 'Unknown error');
          break;
        case 'Reconciling':
          resourceStatus = ResourceStatusVO.reconciling(status.message);
          break;
        case 'Deleting':
          resourceStatus = ResourceStatusVO.deleting(status.message);
          break;
        default:
          resourceStatus = ResourceStatusVO.pending(status.message);
      }
    } else {
      resourceStatus = ResourceStatusVO.pending();
    }

    return new CustomResourceEntity(
      item.metadata.name,
      item.metadata.namespace,
      resourceSpec,
      resourceStatus,
      item.metadata.generation || 1,
      item.metadata.uid,
    );
  }
}

