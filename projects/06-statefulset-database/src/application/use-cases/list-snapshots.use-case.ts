import { Injectable } from '@nestjs/common';
import { SnapshotInfoVO } from '../../domain/value-objects/snapshot-info.vo';
import { KubernetesSnapshotService } from '../../infrastructure/external/kubernetes-snapshot.service';

/**
 * Use Case: ListSnapshotsUseCase
 * Application layer use case for listing snapshots
 */
@Injectable()
export class ListSnapshotsUseCase {
  constructor(private readonly snapshotService: KubernetesSnapshotService) {}

  async execute(pvcName: string, namespace: string): Promise<SnapshotInfoVO[]> {
    return this.snapshotService.listSnapshots(pvcName, namespace);
  }
}

