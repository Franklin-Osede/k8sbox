import { Injectable } from '@nestjs/common';
import { KubernetesStatefulSetService } from '../../infrastructure/external/kubernetes-statefulset.service';

/**
 * Use Case: GetStatefulSetStatusUseCase
 * Application layer use case for getting StatefulSet status
 */
@Injectable()
export class GetStatefulSetStatusUseCase {
  constructor(private readonly statefulSetService: KubernetesStatefulSetService) {}

  async execute(name: string, namespace: string): Promise<{
    readyReplicas: number;
    replicas: number;
    currentReplicas: number;
    updatedReplicas: number;
  } | null> {
    return this.statefulSetService.getStatefulSetStatus(name, namespace);
  }
}

