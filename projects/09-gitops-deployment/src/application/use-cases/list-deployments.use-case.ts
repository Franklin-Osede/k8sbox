import { Injectable } from '@nestjs/common';
import { DeploymentEntity } from '../../domain/entities/deployment-entity';
import { GitOpsDomainService } from '../../domain/domain-services/gitops.service';

/**
 * Use Case: ListDeploymentsUseCase
 * Application layer use case for listing deployments
 */
@Injectable()
export class ListDeploymentsUseCase {
  constructor(private readonly gitOpsService: GitOpsDomainService) {}

  async execute(namespace?: string): Promise<DeploymentEntity[]> {
    return this.gitOpsService.listDeployments(namespace);
  }
}

