import { Injectable } from '@nestjs/common';
import { CustomResourceEntity } from '../entities/custom-resource-entity';
import { ResourceStatusVO } from '../value-objects/resource-status.vo';
import { KubernetesCRDService } from '../../infrastructure/external/kubernetes-crd.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: ReconciliationDomainService
 * Core business logic for resource reconciliation
 */
@Injectable()
export class ReconciliationDomainService {
  constructor(
    private readonly crdService: KubernetesCRDService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Reconcile a custom resource
   */
  async reconcile(resource: CustomResourceEntity): Promise<CustomResourceEntity> {
    try {
      this.logger.log(
        `Reconciling resource ${resource.name} in namespace ${resource.namespace}`,
        'ReconciliationDomainService',
      );

      // Update status to reconciling
      let updatedResource = resource.updateStatus(
        ResourceStatusVO.reconciling('Reconciling resource'),
      );
      await this.crdService.updateStatus(
        updatedResource.name,
        updatedResource.namespace,
        updatedResource.status,
        updatedResource.generation,
      );

      // Check if deployment exists
      const deploymentExists = await this.crdService.deploymentExists(
        resource.name,
        resource.namespace,
      );

      if (!deploymentExists) {
        // Create deployment and service
        await this.crdService.createDeployment(resource);
        await this.crdService.createService(resource);
      } else {
        // Update deployment if spec changed
        await this.crdService.updateDeployment(resource);
        await this.crdService.createService(resource); // Ensure service exists
      }

      // Mark as ready
      const readyStatus = ResourceStatusVO.ready(
        'Resource reconciled successfully',
        resource.generation,
      );
      updatedResource = updatedResource.updateStatus(readyStatus);
      await this.crdService.updateStatus(
        updatedResource.name,
        updatedResource.namespace,
        updatedResource.status,
        updatedResource.generation,
      );

      this.logger.log(
        `Successfully reconciled resource ${resource.name}`,
        'ReconciliationDomainService',
      );

      return updatedResource;
    } catch (error) {
      this.logger.error(
        `Failed to reconcile resource ${resource.name}: ${error.message}`,
        error.stack,
        'ReconciliationDomainService',
      );

      // Update status to failed
      const failedStatus = ResourceStatusVO.failed(`Reconciliation failed: ${error.message}`);
      const failedResource = resource.updateStatus(failedStatus);
      await this.crdService.updateStatus(
        failedResource.name,
        failedResource.namespace,
        failedResource.status,
        failedResource.generation,
      );

      return failedResource;
    }
  }

  /**
   * Delete resources associated with custom resource
   */
  async delete(resource: CustomResourceEntity): Promise<void> {
    try {
      this.logger.log(
        `Deleting resources for ${resource.name} in namespace ${resource.namespace}`,
        'ReconciliationDomainService',
      );

      // Update status to deleting
      const deletingStatus = ResourceStatusVO.deleting('Deleting resources');
      await this.crdService.updateStatus(
        resource.name,
        resource.namespace,
        deletingStatus,
        resource.generation,
      );

      // Delete deployment and service
      await this.crdService.deleteDeployment(resource.name, resource.namespace);

      this.logger.log(
        `Successfully deleted resources for ${resource.name}`,
        'ReconciliationDomainService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete resources for ${resource.name}: ${error.message}`,
        error.stack,
        'ReconciliationDomainService',
      );
      throw error;
    }
  }

  /**
   * Validate resource for reconciliation
   */
  validateForReconciliation(resource: CustomResourceEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resource.name || resource.name.trim().length === 0) {
      errors.push('Resource name is required');
    }

    if (!resource.namespace || resource.namespace.trim().length === 0) {
      errors.push('Namespace is required');
    }

    if (!resource.spec.image || resource.spec.image.trim().length === 0) {
      errors.push('Image is required');
    }

    if (resource.spec.replicas < 0) {
      errors.push('Replicas cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

