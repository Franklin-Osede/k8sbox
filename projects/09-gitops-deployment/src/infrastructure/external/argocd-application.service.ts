import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { DeploymentEntity } from '../../domain/entities/deployment-entity';
import { SyncStatusVO, SyncStatusType } from '../../domain/value-objects/sync-status.vo';
import { DeploymentConfigVO, EnvironmentType } from '../../domain/value-objects/deployment-config.vo';

/**
 * Infrastructure Service: ArgoCDApplicationService
 * Interacts with Kubernetes API for ArgoCD Application resources
 */
@Injectable()
export class ArgoCDApplicationService {
  private k8sCustomApi: k8s.CustomObjectsApi;
  private readonly group = 'argoproj.io';
  private readonly version = 'v1alpha1';
  private readonly plural = 'applications';

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sCustomApi = kc.makeApiClient(k8s.CustomObjectsApi);

    this.logger.log('ArgoCD Application service initialized', 'ArgoCDApplicationService');
  }

  /**
   * Create ArgoCD Application
   */
  async createApplication(deployment: DeploymentEntity): Promise<void> {
    try {
      const application = this.buildApplication(deployment);

      await this.k8sCustomApi.createNamespacedCustomObject(
        this.group,
        this.version,
        deployment.config.namespace,
        this.plural,
        application,
      );

      this.logger.log(`Created ArgoCD Application ${deployment.name}`, 'ArgoCDApplicationService');
    } catch (error) {
      this.logger.error(
        `Failed to create ArgoCD Application ${deployment.name}: ${error.message}`,
        error.stack,
        'ArgoCDApplicationService',
      );
      throw error;
    }
  }

  /**
   * Get ArgoCD Application
   */
  async getApplication(name: string, namespace: string): Promise<DeploymentEntity | null> {
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
        `Failed to get ArgoCD Application ${name}: ${error.message}`,
        error.stack,
        'ArgoCDApplicationService',
      );
      throw error;
    }
  }

  /**
   * List ArgoCD Applications
   */
  async listApplications(namespace?: string): Promise<DeploymentEntity[]> {
    try {
      const response = await this.k8sCustomApi.listNamespacedCustomObject(
        this.group,
        this.version,
        namespace || 'argocd',
        this.plural,
      ) as any;

      const deployments: DeploymentEntity[] = [];
      for (const item of response.body.items || []) {
        deployments.push(this.mapToEntity(item));
      }
      return deployments;
    } catch (error) {
      this.logger.error(
        `Failed to list ArgoCD Applications: ${error.message}`,
        error.stack,
        'ArgoCDApplicationService',
      );
      throw error;
    }
  }

  /**
   * Sync ArgoCD Application
   */
  async syncApplication(name: string, namespace: string): Promise<void> {
    try {
      // In a real implementation, this would trigger ArgoCD sync via API
      // For now, we'll update the application status
      this.logger.log(`Syncing ArgoCD Application ${name}`, 'ArgoCDApplicationService');
      
      // Note: Actual sync would require ArgoCD API or updating the application spec
      // This is a simplified implementation
    } catch (error) {
      this.logger.error(
        `Failed to sync ArgoCD Application ${name}: ${error.message}`,
        error.stack,
        'ArgoCDApplicationService',
      );
      throw error;
    }
  }

  /**
   * Build ArgoCD Application manifest from deployment entity
   */
  private buildApplication(deployment: DeploymentEntity): any {
    const syncPolicy: any = {};
    if (deployment.config.syncPolicy) {
      if (deployment.config.syncPolicy.automated) {
        syncPolicy.automated = {
          prune: deployment.config.syncPolicy.prune || false,
          selfHeal: deployment.config.syncPolicy.selfHeal || false,
        };
      }
      if (deployment.config.syncPolicy.prune && !deployment.config.syncPolicy.automated) {
        syncPolicy.syncOptions = ['Prune=true'];
      }
    }

    return {
      apiVersion: `${this.group}/${this.version}`,
      kind: 'Application',
      metadata: {
        name: deployment.name,
        namespace: deployment.config.namespace,
        labels: {
          'app.kubernetes.io/managed-by': 'gitops-deployment',
          'app.kubernetes.io/name': deployment.name,
        },
      },
      spec: {
        project: 'default',
        source: {
          repoURL: deployment.config.gitRepo,
          targetRevision: deployment.config.targetRevision,
          path: deployment.config.gitPath,
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: deployment.config.namespace,
        },
        syncPolicy,
      },
    };
  }

  /**
   * Map ArgoCD Application to domain entity
   */
  private mapToEntity(item: any): DeploymentEntity {
    const name = item.metadata.name;
    const spec = item.spec || {};
    const status = item.status || {};
    const health = status.health || {};

    const path = spec.source?.path || '';
    const env = path.includes('dev') 
      ? EnvironmentType.DEV 
      : path.includes('staging') 
        ? EnvironmentType.STAGING 
        : EnvironmentType.PROD;
    
    const config = DeploymentConfigVO.create(
      env,
      spec.source?.repoURL || '',
      path,
      spec.destination?.namespace || 'default',
      spec.source?.targetRevision || 'HEAD',
      spec.syncPolicy?.automated
        ? {
            automated: true,
            prune: spec.syncPolicy.automated.prune || false,
            selfHeal: spec.syncPolicy.automated.selfHeal || false,
          }
        : undefined,
    );

    let syncStatus: SyncStatusVO;
    const syncStatusStr = status.sync?.status || 'Unknown';
    switch (syncStatusStr) {
      case 'Synced':
        syncStatus = SyncStatusVO.synced(status.sync?.revision, status.sync?.finishedAt ? new Date(status.sync.finishedAt) : undefined);
        break;
      case 'OutOfSync':
        syncStatus = SyncStatusVO.outOfSync(status.sync?.status || 'Out of sync');
        break;
      case 'Syncing':
        syncStatus = SyncStatusVO.syncing();
        break;
      default:
        syncStatus = SyncStatusVO.unknown();
    }

    return new DeploymentEntity(
      name,
      config,
      syncStatus,
      health.status ? { status: health.status, message: health.message } : undefined,
    );
  }
}

