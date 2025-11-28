import { Injectable } from '@nestjs/common';
import { ConfigVersioningService } from '../../infrastructure/external/config-versioning.service';
import { ConfigVersionEntity } from '../../domain/entities/config-version.entity';

/**
 * Use Case: GetConfigHistoryUseCase
 * Application layer use case for getting configuration history
 */
@Injectable()
export class GetConfigHistoryUseCase {
  constructor(
    private readonly versioningService: ConfigVersioningService,
  ) {}

  execute(limit?: number): ConfigVersionEntity[] {
    return this.versioningService.getHistory(limit);
  }
}

