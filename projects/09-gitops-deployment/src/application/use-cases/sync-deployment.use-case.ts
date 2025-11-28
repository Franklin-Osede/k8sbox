import { Injectable } from '@nestjs/common';
import { GitOpsDomainService } from '../../domain/domain-services/gitops.service';

/**
 * Use Case: SyncDeploymentUseCase
 * Application layer use case for syncing GitOps deployments
 */
@Injectable()
export class SyncDeploymentUseCase {
  constructor(private readonly gitOpsService: GitOpsDomainService) {}

  async execute(name: string, namespace: string): Promise<void> {
    await this.gitOpsService.syncDeployment(name, namespace);
  }
}

