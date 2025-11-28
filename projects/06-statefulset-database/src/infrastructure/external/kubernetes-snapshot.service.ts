import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';
import { SnapshotInfoVO } from '../../domain/value-objects/snapshot-info.vo';

/**
 * Infrastructure Service: KubernetesSnapshotService
 * Interacts with Kubernetes API for Volume Snapshots
 */
@Injectable()
export class KubernetesSnapshotService {
  private k8sSnapshotApi: any; // VolumeSnapshot API (CRD)
  private k8sCoreApi: k8s.CoreV1Api;

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    // Note: VolumeSnapshot is a CRD, so we use the custom objects API
    this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
    this.k8sSnapshotApi = kc.makeApiClient(k8s.CustomObjectsApi);

    this.logger.log('Kubernetes Snapshot service initialized', 'KubernetesSnapshotService');
  }

  /**
   * Create volume snapshot
   */
  async createSnapshot(
    name: string,
    pvcName: string,
    namespace: string,
  ): Promise<SnapshotInfoVO> {
    try {
      const snapshotBody = {
        apiVersion: 'snapshot.storage.k8s.io/v1',
        kind: 'VolumeSnapshot',
        metadata: {
          name,
          namespace,
          labels: {
            'app.kubernetes.io/managed-by': 'statefulset-database',
          },
        },
        spec: {
          source: {
            persistentVolumeClaimName: pvcName,
          },
        },
      };

      await this.k8sSnapshotApi.createNamespacedCustomObject(
        'snapshot.storage.k8s.io',
        'v1',
        namespace,
        'volumesnapshots',
        snapshotBody,
      );

      this.logger.log(`Created snapshot ${name} for PVC ${pvcName}`, 'KubernetesSnapshotService');

      return SnapshotInfoVO.create(name, name, pvcName, 0, false);
    } catch (error) {
      this.logger.error(
        `Failed to create snapshot ${name}: ${error.message}`,
        error.stack,
        'KubernetesSnapshotService',
      );
      throw error;
    }
  }

  /**
   * Get snapshot status
   */
  async getSnapshotStatus(name: string, namespace: string): Promise<SnapshotInfoVO | null> {
    try {
      const response: any = await this.k8sSnapshotApi.getNamespacedCustomObject(
        'snapshot.storage.k8s.io',
        'v1',
        namespace,
        'volumesnapshots',
        name,
      );

      const snapshot = response.body;
      const status = snapshot.status;
      const readyToUse = status?.readyToUse || false;
      const size = status?.restoreSize ? parseInt(status.restoreSize) : 0;

      const snapshotInfo = SnapshotInfoVO.create(
        name,
        name,
        snapshot.spec?.source?.persistentVolumeClaimName || '',
        size,
        readyToUse,
      );

      return readyToUse ? snapshotInfo.markAsReady() : snapshotInfo;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get snapshot ${name}: ${error.message}`,
        error.stack,
        'KubernetesSnapshotService',
      );
      throw error;
    }
  }

  /**
   * List snapshots for a PVC
   */
  async listSnapshots(pvcName: string, namespace: string): Promise<SnapshotInfoVO[]> {
    try {
      const response = await this.k8sSnapshotApi.listNamespacedCustomObject(
        'snapshot.storage.k8s.io',
        'v1',
        namespace,
        'volumesnapshots',
      ) as any;

      const snapshots: SnapshotInfoVO[] = [];

      for (const snapshot of response.body.items || []) {
        if (snapshot.spec?.source?.persistentVolumeClaimName === pvcName) {
          const name = snapshot.metadata?.name || '';
          const status = snapshot.status;
          const readyToUse = status?.readyToUse || false;
          const size = status?.restoreSize ? parseInt(status.restoreSize) : 0;

          const snapshotInfo = SnapshotInfoVO.create(name, name, pvcName, size, readyToUse);
          snapshots.push(readyToUse ? snapshotInfo.markAsReady() : snapshotInfo);
        }
      }

      return snapshots;
    } catch (error) {
      this.logger.error(
        `Failed to list snapshots for PVC ${pvcName}: ${error.message}`,
        error.stack,
        'KubernetesSnapshotService',
      );
      throw error;
    }
  }

  /**
   * Delete snapshot
   */
  async deleteSnapshot(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sSnapshotApi.deleteNamespacedCustomObject(
        'snapshot.storage.k8s.io',
        'v1',
        namespace,
        'volumesnapshots',
        name,
      );

      this.logger.log(`Deleted snapshot ${name}`, 'KubernetesSnapshotService');
    } catch (error) {
      if (error.response?.statusCode === 404) {
        this.logger.warn(`Snapshot ${name} not found, skipping deletion`, 'KubernetesSnapshotService');
        return;
      }
      this.logger.error(
        `Failed to delete snapshot ${name}: ${error.message}`,
        error.stack,
        'KubernetesSnapshotService',
      );
      throw error;
    }
  }
}

