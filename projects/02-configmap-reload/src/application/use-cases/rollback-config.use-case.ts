import { Injectable } from '@nestjs/common';
import { ConfigVersioningService } from '../../infrastructure/external/config-versioning.service';
import { ConfigReloadDomainService } from '../../domain/domain-services/config-reload.service';
import { ConfigVersionEntity } from '../../domain/entities/config-version.entity';

/**
 * Use Case: RollbackConfigUseCase
 * Application layer use case for rolling back configuration
 */
@Injectable()
export class RollbackConfigUseCase {
  constructor(
    private readonly versioningService: ConfigVersioningService,
    private readonly configReloadDomainService: ConfigReloadDomainService,
  ) {}

  async execute(version: number): Promise<ConfigVersionEntity | null> {
    const rollbackVersion = this.versioningService.rollbackToVersion(version);
    
    if (rollbackVersion) {
      // Update current config state with rolled back config
      this.configReloadDomainService.getConfigState().update(rollbackVersion.config);
    }

    return rollbackVersion;
  }
}

