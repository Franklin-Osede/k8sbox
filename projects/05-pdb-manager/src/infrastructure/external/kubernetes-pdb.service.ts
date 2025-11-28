import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { PDBEntity } from '../../domain/entities/pdb-entity';
import { AvailabilityLevelVO, AvailabilityType } from '../../domain/value-objects/availability-level.vo';
import { PDBStatusVO, PDBStatusType } from '../../domain/value-objects/pdb-status.vo';

/**
 * Infrastructure Service: KubernetesPDBService
 * Interacts with Kubernetes API for Pod Disruption Budgets
 */
@Injectable()
export class KubernetesPDBService {
  private k8sApi: k8s.PolicyV1Api;
  private k8sAppsApi: k8s.AppsV1Api;
  private k8sCoreApi: k8s.CoreV1Api;

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sApi = kc.makeApiClient(k8s.PolicyV1Api);
    this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

    this.logger.log('Kubernetes PDB service initialized', 'KubernetesPDBService');
  }

  /**
   * Create or update Pod Disruption Budget
   */
  async createOrUpdatePDB(pdb: PDBEntity): Promise<void> {
    try {
      const pdbBody: k8s.V1PodDisruptionBudget = {
        apiVersion: 'policy/v1',
        kind: 'PodDisruptionBudget',
        metadata: {
          name: pdb.name,
          namespace: pdb.namespace,
          labels: {
            'app.kubernetes.io/name': pdb.name,
            'app.kubernetes.io/managed-by': 'pdb-manager',
          },
        },
        spec: {
          selector: {
            matchLabels: pdb.selector,
          },
        },
      };

      if (pdb.availabilityLevel.type === AvailabilityType.MIN_AVAILABLE) {
        pdbBody.spec.minAvailable = pdb.availabilityLevel.value;
      } else {
        pdbBody.spec.maxUnavailable = pdb.availabilityLevel.value;
      }

      // Try to get existing PDB
      try {
        await this.k8sApi.readNamespacedPodDisruptionBudget(pdb.name, pdb.namespace);
        // Update existing
        await this.k8sApi.replaceNamespacedPodDisruptionBudget(
          pdb.name,
          pdb.namespace,
          pdbBody,
        );
        this.logger.log(`Updated PDB ${pdb.name} in namespace ${pdb.namespace}`, 'KubernetesPDBService');
      } catch (error) {
        if (error.response?.statusCode === 404) {
          // Create new
          await this.k8sApi.createNamespacedPodDisruptionBudget(pdb.namespace, pdbBody);
          this.logger.log(`Created PDB ${pdb.name} in namespace ${pdb.namespace}`, 'KubernetesPDBService');
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to create/update PDB ${pdb.name}: ${error.message}`,
        error.stack,
        'KubernetesPDBService',
      );
      throw error;
    }
  }

  /**
   * Get Pod Disruption Budget status
   */
  async getPDBStatus(name: string, namespace: string): Promise<PDBEntity | null> {
    try {
      const response = await this.k8sApi.readNamespacedPodDisruptionBudget(name, namespace);
      const pdb = response.body;

      // Get selector
      const selector = pdb.spec?.selector?.matchLabels || {};

      // Determine availability level
      let availabilityLevel: AvailabilityLevelVO;
      if (pdb.spec?.minAvailable !== undefined) {
        availabilityLevel = AvailabilityLevelVO.minAvailable(
          typeof pdb.spec.minAvailable === 'string'
            ? parseInt(pdb.spec.minAvailable)
            : pdb.spec.minAvailable,
        );
      } else if (pdb.spec?.maxUnavailable !== undefined) {
        const value =
          typeof pdb.spec.maxUnavailable === 'string'
            ? parseInt(pdb.spec.maxUnavailable)
            : pdb.spec.maxUnavailable;
        availabilityLevel = AvailabilityLevelVO.maxUnavailable(value);
      } else {
        throw new Error('PDB must have either minAvailable or maxUnavailable');
      }

      const pdbEntity = PDBEntity.create(
        pdb.metadata?.name || name,
        pdb.metadata?.namespace || namespace,
        availabilityLevel,
        selector,
      );

      // Get status
      const status = pdb.status;
      if (status) {
        const currentHealthy = status.currentHealthy || 0;
        const desiredHealthy = status.desiredHealthy || 0;
        const disruptedPodsArray = status.disruptedPods;
        const disruptedPodsCount = Array.isArray(disruptedPodsArray) ? disruptedPodsArray.length : 0;
        const allowedDisruptions = status.disruptionsAllowed || 0;

        let pdbStatus: PDBStatusVO;
        if (status.conditions?.some((c) => c.type === 'DisruptionAllowed' && c.status === 'True')) {
          pdbStatus = PDBStatusVO.healthy(currentHealthy, desiredHealthy, allowedDisruptions);
        } else if (disruptedPodsCount > 0) {
          pdbStatus = PDBStatusVO.violated(
            currentHealthy,
            desiredHealthy,
            disruptedPodsCount,
            allowedDisruptions,
          );
        } else {
          pdbStatus = PDBStatusVO.pending(currentHealthy, desiredHealthy);
        }

        return pdbEntity.updateStatus(pdbStatus);
      }

      return pdbEntity;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get PDB ${name}: ${error.message}`,
        error.stack,
        'KubernetesPDBService',
      );
      throw error;
    }
  }

  /**
   * List all PDBs in namespace
   */
  async listPDBs(namespace: string): Promise<PDBEntity[]> {
    try {
      const response = await this.k8sApi.listNamespacedPodDisruptionBudget(namespace);
      const pdbs: PDBEntity[] = [];

      for (const pdb of response.body.items || []) {
        const status = await this.getPDBStatus(
          pdb.metadata?.name || '',
          pdb.metadata?.namespace || namespace,
        );
        if (status) {
          pdbs.push(status);
        }
      }

      return pdbs;
    } catch (error) {
      this.logger.error(
        `Failed to list PDBs in namespace ${namespace}: ${error.message}`,
        error.stack,
        'KubernetesPDBService',
      );
      throw error;
    }
  }

  /**
   * Delete Pod Disruption Budget
   */
  async deletePDB(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sApi.deleteNamespacedPodDisruptionBudget(name, namespace);
      this.logger.log(`Deleted PDB ${name} in namespace ${namespace}`, 'KubernetesPDBService');
    } catch (error) {
      if (error.response?.statusCode === 404) {
        this.logger.warn(`PDB ${name} not found, skipping deletion`, 'KubernetesPDBService');
        return;
      }
      this.logger.error(
        `Failed to delete PDB ${name}: ${error.message}`,
        error.stack,
        'KubernetesPDBService',
      );
      throw error;
    }
  }
}

