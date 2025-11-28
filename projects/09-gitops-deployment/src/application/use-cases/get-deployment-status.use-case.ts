import { Injectable } from '@nestjs/common';
import { DeploymentEntity } from '../../domain/entities/deployment-entity';
import { GitOpsDomainService } from '../../domain/domain-services/gitops.service';

/**
 * Use Case: GetDeploymentStatusUseCase
 * Application layer use case for getting deployment status
 */
@Injectable()
export class GetDeploymentStatusUseCase {
  constructor(private readonly gitOpsService: GitOpsDomainService) {}

  async execute(name: string, namespace: string): Promise<DeploymentEntity | null> {
    return this.gitOpsService.getDeploymentStatus(name, namespace);
  }
}

