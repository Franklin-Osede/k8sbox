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
import { ReconcileResourceUseCase } from '../../application/use-cases/reconcile-resource.use-case';
import { ListResourcesUseCase } from '../../application/use-cases/list-resources.use-case';
import { GetResourceUseCase } from '../../application/use-cases/get-resource.use-case';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';
import { ResourceSpecVO } from '../../domain/value-objects/resource-spec.vo';
import { CreateResourceDto, ResourceDto } from '../dto/resource.dto';

/**
 * Controller: ResourceController
 * Presentation layer controller for custom resource endpoints
 */
@ApiTags('resources')
@Controller('resources')
export class ResourceController {
  constructor(
    private readonly reconcileResourceUseCase: ReconcileResourceUseCase,
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and reconcile a custom resource' })
  @ApiResponse({ status: 201, description: 'Resource created and reconciled', type: ResourceDto })
  async createResource(@Body() createResourceDto: CreateResourceDto): Promise<ResourceDto> {
    const spec = ResourceSpecVO.create(
      createResourceDto.spec.replicas,
      createResourceDto.spec.image,
      createResourceDto.spec.port,
      createResourceDto.spec.env,
    );

    const resource = CustomResourceEntity.create(
      createResourceDto.name,
      createResourceDto.namespace,
      spec,
    );

    const reconciled = await this.reconcileResourceUseCase.execute(resource);

    return this.mapToDto(reconciled);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all custom resources' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace filter' })
  @ApiResponse({ status: 200, description: 'List of resources', type: [ResourceDto] })
  async listResources(@Query('namespace') namespace?: string): Promise<ResourceDto[]> {
    const resources = await this.listResourcesUseCase.execute(namespace);
    return resources.map((r) => this.mapToDto(r));
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a custom resource' })
  @ApiParam({ name: 'name', description: 'Resource name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Resource details', type: ResourceDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getResource(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<ResourceDto> {
    const resource = await this.getResourceUseCase.execute(name, namespace);
    if (!resource) {
      throw new NotFoundException(`Resource ${name} not found in namespace ${namespace}`);
    }
    return this.mapToDto(resource);
  }

  @Post(':name/reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger reconciliation for a resource' })
  @ApiParam({ name: 'name', description: 'Resource name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Resource reconciled', type: ResourceDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async reconcileResource(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<ResourceDto> {
    const resource = await this.getResourceUseCase.execute(name, namespace);
    if (!resource) {
      throw new NotFoundException(`Resource ${name} not found in namespace ${namespace}`);
    }

    const reconciled = await this.reconcileResourceUseCase.execute(resource);
    return this.mapToDto(reconciled);
  }

  private mapToDto(resource: CustomResourceEntity): ResourceDto {
    return {
      name: resource.name,
      namespace: resource.namespace,
      spec: {
        replicas: resource.spec.replicas,
        image: resource.spec.image,
        port: resource.spec.port,
        env: resource.spec.env,
      },
      status: {
        status: resource.status.status,
        message: resource.status.message,
        lastReconciledAt: resource.status.lastReconciledAt?.toISOString(),
        observedGeneration: resource.status.observedGeneration,
      },
      generation: resource.generation,
      uid: resource.uid,
      isReady: resource.isReady(),
      isFailed: resource.isFailed(),
    };
  }
}

