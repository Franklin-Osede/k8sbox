import { Injectable } from '@nestjs/common';
import { BackupEntity } from '../../domain/entities/backup-entity';
import { BackupDomainService } from '../../domain/domain-services/backup.service';

/**
 * Use Case: CreateBackupUseCase
 * Application layer use case for creating backups
 */
@Injectable()
export class CreateBackupUseCase {
  constructor(private readonly backupDomainService: BackupDomainService) {}

  async execute(backup: BackupEntity): Promise<BackupEntity> {
    // Validate backup
    const validation = this.backupDomainService.validateBackup(backup);
    if (!validation.valid) {
      throw new Error(`Invalid backup configuration: ${validation.errors.join(', ')}`);
    }

    // Create backup
    return this.backupDomainService.createBackup(backup);
  }
}

