import { Injectable } from '@nestjs/common';
import { BackupEntity } from '../../domain/entities/backup-entity';
import { BackupDomainService } from '../../domain/domain-services/backup.service';

/**
 * Use Case: GetBackupStatusUseCase
 * Application layer use case for getting backup status
 */
@Injectable()
export class GetBackupStatusUseCase {
  constructor(private readonly backupDomainService: BackupDomainService) {}

  async execute(backup: BackupEntity): Promise<BackupEntity> {
    return this.backupDomainService.getBackupStatus(backup);
  }
}

