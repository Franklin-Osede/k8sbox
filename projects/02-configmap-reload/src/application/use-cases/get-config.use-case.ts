import { Injectable } from '@nestjs/common';
import { ConfigReloadDomainService } from '../../domain/domain-services/config-reload.service';
import { ConfigStateEntity } from '../../domain/entities/config-state.entity';

/**
 * Use Case: GetConfigUseCase
 * Application layer use case for getting configuration
 */
@Injectable()
export class GetConfigUseCase {
  constructor(
    private readonly configReloadDomainService: ConfigReloadDomainService,
  ) {}

  execute(): ConfigStateEntity {
    return this.configReloadDomainService.getConfigState();
  }
}

