import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateDeploymentUseCase } from '../../application/use-cases/create-deployment.use-case';
import { SyncDeploymentUseCase } from '../../application/use-cases/sync-deployment.use-case';
import { GetDeploymentStatusUseCase } from '../../application/use-cases/get-deployment-status.use-case';
import { ListDeploymentsUseCase } from '../../application/use-cases/list-deployments.use-case';
import { DeploymentEntity } from '../../domain/entities/deployment-entity';
import { DeploymentConfigVO, EnvironmentType } from '../../domain/value-objects/deployment-config.vo';
import { CreateDeploymentDto, DeploymentDto, EnvironmentTypeDto } from '../dto/deployment.dto';

/**
 * Controller: DeploymentController
 * Presentation layer controller for GitOps deployment endpoints
 */
@ApiTags('deployments')
@Controller('deployments')
export class DeploymentController {
  constructor(
    private readonly createDeploymentUseCase: CreateDeploymentUseCase,
    private readonly syncDeploymentUseCase: SyncDeploymentUseCase,
    private readonly getDeploymentStatusUseCase: GetDeploymentStatusUseCase,
    private readonly listDeploymentsUseCase: ListDeploymentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a GitOps deployment' })
  @ApiResponse({ status: 201, description: 'Deployment created successfully', type: DeploymentDto })
  async createDeployment(@Body() createDeploymentDto: CreateDeploymentDto): Promise<DeploymentDto> {
    const envMap: Record<EnvironmentTypeDto, EnvironmentType> = {
      [EnvironmentTypeDto.DEV]: EnvironmentType.DEV,
      [EnvironmentTypeDto.STAGING]: EnvironmentType.STAGING,
      [EnvironmentTypeDto.PROD]: EnvironmentType.PROD,
    };
    
    const config = DeploymentConfigVO.create(
      envMap[createDeploymentDto.environment],
      createDeploymentDto.gitRepo,
      createDeploymentDto.gitPath,
      createDeploymentDto.namespace,
      createDeploymentDto.targetRevision || 'HEAD',
      createDeploymentDto.syncPolicy,
    );

    const deployment = DeploymentEntity.create(createDeploymentDto.name, config);

    await this.createDeploymentUseCase.execute(deployment);

    // Get created deployment to return status
    const created = await this.getDeploymentStatusUseCase.execute(
      deployment.name,
      deployment.config.namespace,
    );

    return this.mapToDto(created || deployment);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all deployments' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace filter' })
  @ApiResponse({ status: 200, description: 'List of deployments', type: [DeploymentDto] })
  async listDeployments(@Query('namespace') namespace?: string): Promise<DeploymentDto[]> {
    const deployments = await this.listDeploymentsUseCase.execute(namespace);
    return deployments.map((d) => this.mapToDto(d));
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get deployment status' })
  @ApiParam({ name: 'name', description: 'Deployment name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: argocd)' })
  @ApiResponse({ status: 200, description: 'Deployment status', type: DeploymentDto })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  async getDeploymentStatus(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'argocd',
  ): Promise<DeploymentDto> {
    const deployment = await this.getDeploymentStatusUseCase.execute(name, namespace);
    if (!deployment) {
      throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
    }
    return this.mapToDto(deployment);
  }

  @Post(':name/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger deployment sync' })
  @ApiParam({ name: 'name', description: 'Deployment name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: argocd)' })
  @ApiResponse({ status: 200, description: 'Deployment synced', type: DeploymentDto })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  async syncDeployment(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'argocd',
  ): Promise<DeploymentDto> {
    await this.syncDeploymentUseCase.execute(name, namespace);

    const deployment = await this.getDeploymentStatusUseCase.execute(name, namespace);
    if (!deployment) {
      throw new NotFoundException(`Deployment ${name} not found in namespace ${namespace}`);
    }

    return this.mapToDto(deployment);
  }

  private mapToDto(deployment: DeploymentEntity): DeploymentDto {
    return {
      name: deployment.name,
      environment: deployment.config.environment,
      gitRepo: deployment.config.gitRepo,
      gitPath: deployment.config.gitPath,
      namespace: deployment.config.namespace,
      targetRevision: deployment.config.targetRevision,
      syncPolicy: deployment.config.syncPolicy,
      status: {
        status: deployment.status.status,
        message: deployment.status.message,
        syncedAt: deployment.status.syncedAt?.toISOString(),
        revision: deployment.status.revision,
      },
      health: deployment.health,
      isSynced: deployment.isSynced(),
      isHealthy: deployment.isHealthy() || false,
      needsSync: deployment.needsSync(),
    };
  }
}

