import { Injectable } from '@nestjs/common';
import { ConfigReloadDomainService } from '../../domain/domain-services/config-reload.service';
import { ConfigStateEntity } from '../../domain/entities/config-state.entity';

/**
 * Use Case: ReloadConfigUseCase
 * Application layer use case for reloading configuration
 */
@Injectable()
export class ReloadConfigUseCase {
  constructor(
    private readonly configReloadDomainService: ConfigReloadDomainService,
  ) {}

  async execute(): Promise<ConfigStateEntity> {
    return this.configReloadDomainService.reloadConfig();
  }
}

