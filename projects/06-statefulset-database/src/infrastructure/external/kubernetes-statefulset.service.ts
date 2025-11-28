import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: KubernetesStatefulSetService
 * Interacts with Kubernetes API for StatefulSets and PVCs
 */
@Injectable()
export class KubernetesStatefulSetService {
  private k8sAppsApi: k8s.AppsV1Api;
  private k8sCoreApi: k8s.CoreV1Api;

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

    this.logger.log('Kubernetes StatefulSet service initialized', 'KubernetesStatefulSetService');
  }

  /**
   * Get StatefulSet status
   */
  async getStatefulSetStatus(name: string, namespace: string): Promise<{
    readyReplicas: number;
    replicas: number;
    currentReplicas: number;
    updatedReplicas: number;
  } | null> {
    try {
      const response = await this.k8sAppsApi.readNamespacedStatefulSet(name, namespace);
      const status = response.body.status;

      return {
        readyReplicas: status?.readyReplicas || 0,
        replicas: status?.replicas || 0,
        currentReplicas: status?.currentReplicas || 0,
        updatedReplicas: status?.updatedReplicas || 0,
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get StatefulSet ${name}: ${error.message}`,
        error.stack,
        'KubernetesStatefulSetService',
      );
      throw error;
    }
  }

  /**
   * List PVCs for a StatefulSet
   */
  async listPVCs(statefulSetName: string, namespace: string): Promise<Array<{
    name: string;
    size: string;
    status: string;
    volumeName?: string;
  }>> {
    try {
      const response = await this.k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);
      const pvcs: Array<{ name: string; size: string; status: string; volumeName?: string }> = [];

      for (const pvc of response.body.items || []) {
        // Filter PVCs that belong to the StatefulSet
        if (pvc.metadata?.name?.startsWith(statefulSetName)) {
          const storage = pvc.spec?.resources?.requests?.storage;
          const size = storage ? (typeof storage === 'string' ? storage : String(storage)) : '0';
          const status = pvc.status?.phase || 'Unknown';
          const volumeName = pvc.spec?.volumeName;

          pvcs.push({
            name: pvc.metadata?.name || '',
            size,
            status,
            volumeName,
          });
        }
      }

      return pvcs;
    } catch (error) {
      this.logger.error(
        `Failed to list PVCs for StatefulSet ${statefulSetName}: ${error.message}`,
        error.stack,
        'KubernetesStatefulSetService',
      );
      throw error;
    }
  }

  /**
   * Get PVC details
   */
  async getPVC(name: string, namespace: string): Promise<{
    name: string;
    size: string;
    status: string;
    volumeName?: string;
    accessModes?: string[];
  } | null> {
    try {
      const response = await this.k8sCoreApi.readNamespacedPersistentVolumeClaim(name, namespace);
      const pvc = response.body;

      const storage = pvc.spec?.resources?.requests?.storage;
      const size = storage ? (typeof storage === 'string' ? storage : String(storage)) : '0';
      const status = pvc.status?.phase || 'Unknown';

      return {
        name: pvc.metadata?.name || name,
        size,
        status,
        volumeName: pvc.spec?.volumeName,
        accessModes: pvc.spec?.accessModes || [],
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      this.logger.error(
        `Failed to get PVC ${name}: ${error.message}`,
        error.stack,
        'KubernetesStatefulSetService',
      );
      throw error;
    }
  }
}

