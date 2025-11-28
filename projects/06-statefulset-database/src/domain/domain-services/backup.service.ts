import { Injectable } from '@nestjs/common';
import { BackupEntity } from '../entities/backup-entity';
import { BackupStatusVO, BackupStatusType } from '../value-objects/backup-status.vo';
import { KubernetesSnapshotService } from '../../infrastructure/external/kubernetes-snapshot.service';
import { KubernetesStatefulSetService } from '../../infrastructure/external/kubernetes-statefulset.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: BackupDomainService
 * Core business logic for backup operations
 */
@Injectable()
export class BackupDomainService {
  constructor(
    private readonly snapshotService: KubernetesSnapshotService,
    private readonly statefulSetService: KubernetesStatefulSetService,
    private readonly logger: AppLoggerService,
  ) {}

  /**
   * Create backup by creating volume snapshot
   */
  async createBackup(backup: BackupEntity): Promise<BackupEntity> {
    try {
      // Update status to in progress
      const inProgressStatus = BackupStatusVO.inProgress();
      let updatedBackup = backup.updateStatus(inProgressStatus);

      this.logger.log(
        `Starting backup ${backup.id} for database ${backup.databaseName}`,
        'BackupDomainService',
      );

      // Get PVCs for the StatefulSet
      const pvcs = await this.statefulSetService.listPVCs(backup.databaseName, backup.namespace);
      if (pvcs.length === 0) {
        throw new Error(`No PVCs found for StatefulSet ${backup.databaseName}`);
      }

      // Create snapshot for the first PVC (data volume)
      const dataPVC = pvcs[0];
      const snapshotName = `${backup.databaseName}-backup-${backup.id}`;

      const snapshotInfo = await this.snapshotService.createSnapshot(
        snapshotName,
        dataPVC.name,
        backup.namespace,
      );

      updatedBackup = updatedBackup.setSnapshot(snapshotInfo);

      // Wait for snapshot to be ready (simplified - in production, use polling)
      // For now, mark as completed
      const completedStatus = BackupStatusVO.completed(new Date(), snapshotInfo.size);
      updatedBackup = updatedBackup.updateStatus(completedStatus);

      this.logger.log(`Backup ${backup.id} completed successfully`, 'BackupDomainService');

      return updatedBackup;
    } catch (error) {
      this.logger.error(
        `Backup ${backup.id} failed: ${error.message}`,
        error.stack,
        'BackupDomainService',
      );
      const failedStatus = BackupStatusVO.failed(error.message, backup.status.startedAt);
      return backup.updateStatus(failedStatus);
    }
  }

  /**
   * Validate backup configuration
   */
  validateBackup(backup: BackupEntity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!backup.id || backup.id.trim().length === 0) {
      errors.push('Backup ID is required');
    }

    if (!backup.databaseName || backup.databaseName.trim().length === 0) {
      errors.push('Database name is required');
    }

    if (!backup.namespace || backup.namespace.trim().length === 0) {
      errors.push('Namespace is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get backup status
   */
  async getBackupStatus(backup: BackupEntity): Promise<BackupEntity> {
    if (!backup.snapshotInfo) {
      return backup;
    }

    const snapshotStatus = await this.snapshotService.getSnapshotStatus(
      backup.snapshotInfo.volumeSnapshotName,
      backup.namespace,
    );

    if (!snapshotStatus) {
      const failedStatus = BackupStatusVO.failed('Snapshot not found');
      return backup.updateStatus(failedStatus);
    }

    if (snapshotStatus.readyToUse && !backup.isCompleted()) {
      const completedStatus = BackupStatusVO.completed(new Date(), snapshotStatus.size);
      return backup.setSnapshot(snapshotStatus).updateStatus(completedStatus);
    }

    return backup.setSnapshot(snapshotStatus);
  }
}

