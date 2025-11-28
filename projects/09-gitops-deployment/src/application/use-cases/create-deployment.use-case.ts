import { Injectable } from '@nestjs/common';
import { DeploymentEntity } from '../../domain/entities/deployment-entity';
import { GitOpsDomainService } from '../../domain/domain-services/gitops.service';

/**
 * Use Case: CreateDeploymentUseCase
 * Application layer use case for creating GitOps deployments
 */
@Injectable()
export class CreateDeploymentUseCase {
  constructor(private readonly gitOpsService: GitOpsDomainService) {}

  async execute(deployment: DeploymentEntity): Promise<void> {
    await this.gitOpsService.createDeployment(deployment);
  }
}

