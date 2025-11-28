import { Injectable } from '@nestjs/common';
import { DeploymentEntity } from '../entities/deployment-entity';
import { DeploymentConfigVO } from '../value-objects/deployment-config.vo';
import { SyncStatusVO } from '../value-objects/sync-status.vo';
import { ArgoCDApplicationService } from '../../infrastructure/external/argocd-application.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: GitOpsDomainService
 * Core business logic for GitOps deployments
 */
@Injectable()
export class GitOpsDomainService {
  constructor(
    private readonly argocdService: ArgoCDApplicationService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Create GitOps deployment
   */
  async createDeployment(deployment: DeploymentEntity): Promise<void> {
    try {
      this.logger.log(
        `Creating GitOps deployment ${deployment.name} in namespace ${deployment.config.namespace}`,
        'GitOpsDomainService',
      );

      // Validate deployment
      const validation = this.validateDeployment(deployment);
      if (!validation.valid) {
        throw new Error(`Invalid deployment: ${validation.errors.join(', ')}`);
      }

      // Create ArgoCD Application
      await this.argocdService.createApplication(deployment);

      this.logger.log(
        `Successfully created GitOps deployment ${deployment.name}`,
        'GitOpsDomainService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to create deployment ${deployment.name}: ${error.message}`,
        error.stack,
        'GitOpsDomainService',
      );
      throw error;
    }
  }

  /**
   * Sync deployment
   */
  async syncDeployment(name: string, namespace: string): Promise<void> {
    try {
      this.logger.log(`Syncing deployment ${name}`, 'GitOpsDomainService');

      await this.argocdService.syncApplication(name, namespace);

      this.logger.log(`Successfully synced deployment ${name}`, 'GitOpsDomainService');
    } catch (error) {
      this.logger.error(
        `Failed to sync deployment ${name}: ${error.message}`,
        error.stack,
        'GitOpsDomainService',
      );
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(name: string, namespace: string): Promise<DeploymentEntity | null> {
    return this.argocdService.getApplication(name, namespace);
  }

  /**
   * List deployments
   */
  async listDeployments(namespace?: string): Promise<DeploymentEntity[]> {
    return this.argocdService.listApplications(namespace);
  }

  /**
   * Validate deployment configuration
   */
  validateDeployment(deployment: DeploymentEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!deployment.name || deployment.name.trim().length === 0) {
      errors.push('Deployment name is required');
    }

    if (!deployment.config.gitRepo || deployment.config.gitRepo.trim().length === 0) {
      errors.push('Git repository URL is required');
    }

    if (!deployment.config.gitPath || deployment.config.gitPath.trim().length === 0) {
      errors.push('Git path is required');
    }

    if (!deployment.config.namespace || deployment.config.namespace.trim().length === 0) {
      errors.push('Namespace is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

