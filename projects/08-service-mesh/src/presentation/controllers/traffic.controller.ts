import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApplyRoutingUseCase } from '../../application/use-cases/apply-routing.use-case';
import { UpdateTrafficSplitUseCase } from '../../application/use-cases/update-traffic-split.use-case';
import { TrafficRoutingEntity } from '../../domain/entities/traffic-routing-entity';
import { TrafficSplitVO } from '../../domain/value-objects/traffic-split.vo';
import { CircuitBreakerConfigVO } from '../../domain/value-objects/circuit-breaker-config.vo';
import {
  CreateRoutingDto,
  UpdateTrafficSplitDto,
  RoutingDto,
} from '../dto/traffic.dto';
import { IstioVirtualServiceService } from '../../infrastructure/external/istio-virtualservice.service';

/**
 * Controller: TrafficController
 * Presentation layer controller for traffic routing endpoints
 */
@ApiTags('traffic')
@Controller('traffic')
export class TrafficController {
  constructor(
    private readonly applyRoutingUseCase: ApplyRoutingUseCase,
    private readonly updateTrafficSplitUseCase: UpdateTrafficSplitUseCase,
    private readonly virtualServiceService: IstioVirtualServiceService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create traffic routing configuration' })
  @ApiResponse({ status: 201, description: 'Routing created successfully', type: RoutingDto })
  async createRouting(@Body() createRoutingDto: CreateRoutingDto): Promise<RoutingDto> {
    const trafficSplit = TrafficSplitVO.create(
      createRoutingDto.trafficSplit.v1Weight,
      createRoutingDto.trafficSplit.v2Weight,
    );

    const circuitBreaker = createRoutingDto.circuitBreaker
      ? CircuitBreakerConfigVO.create(
          createRoutingDto.circuitBreaker.consecutiveErrors,
          createRoutingDto.circuitBreaker.intervalSeconds,
          createRoutingDto.circuitBreaker.baseEjectionTimeSeconds,
          createRoutingDto.circuitBreaker.maxEjectionPercent,
          createRoutingDto.circuitBreaker.minHealthPercent,
        )
      : undefined;

    const routing = TrafficRoutingEntity.create(
      createRoutingDto.serviceName,
      createRoutingDto.namespace,
      trafficSplit,
      circuitBreaker,
      createRoutingDto.mTLSEnabled !== false,
    );

    await this.applyRoutingUseCase.execute(routing);

    return this.mapToDto(routing);
  }

  @Put(':serviceName/traffic-split')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update traffic split for a service' })
  @ApiParam({ name: 'serviceName', description: 'Service name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Traffic split updated', type: RoutingDto })
  async updateTrafficSplit(
    @Param('serviceName') serviceName: string,
    @Query('namespace') namespace: string = 'default',
    @Body() updateTrafficSplitDto: UpdateTrafficSplitDto,
  ): Promise<RoutingDto> {
    const trafficSplit = TrafficSplitVO.create(
      updateTrafficSplitDto.trafficSplit.v1Weight,
      updateTrafficSplitDto.trafficSplit.v2Weight,
    );

    await this.updateTrafficSplitUseCase.execute(serviceName, namespace, trafficSplit);

    // Get updated VirtualService to return current state
    const virtualService = await this.virtualServiceService.getVirtualService(
      serviceName,
      namespace,
    );
    if (!virtualService) {
      throw new NotFoundException(`VirtualService ${serviceName} not found`);
    }

    // Build routing from VirtualService (simplified)
    const routing = TrafficRoutingEntity.create(serviceName, namespace, trafficSplit);
    return this.mapToDto(routing);
  }

  @Get(':serviceName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get traffic routing configuration' })
  @ApiParam({ name: 'serviceName', description: 'Service name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Routing configuration', type: RoutingDto })
  @ApiResponse({ status: 404, description: 'Routing not found' })
  async getRouting(
    @Param('serviceName') serviceName: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<RoutingDto> {
    const virtualService = await this.virtualServiceService.getVirtualService(
      serviceName,
      namespace,
    );
    if (!virtualService) {
      throw new NotFoundException(`VirtualService ${serviceName} not found`);
    }

    // Extract traffic split from VirtualService
    const httpRoutes = virtualService.spec?.http || [];
    let v1Weight = 0;
    let v2Weight = 0;

    if (httpRoutes.length > 0 && httpRoutes[0].route) {
      for (const route of httpRoutes[0].route) {
        if (route.destination?.subset === 'v1') {
          v1Weight = route.weight || 0;
        } else if (route.destination?.subset === 'v2') {
          v2Weight = route.weight || 0;
        }
      }
    }

    const trafficSplit = TrafficSplitVO.create(v1Weight, v2Weight);
    const routing = TrafficRoutingEntity.create(serviceName, namespace, trafficSplit);

    return this.mapToDto(routing);
  }

  private mapToDto(routing: TrafficRoutingEntity): RoutingDto {
    return {
      serviceName: routing.serviceName,
      namespace: routing.namespace,
      trafficSplit: {
        v1Weight: routing.trafficSplit.v1Weight,
        v2Weight: routing.trafficSplit.v2Weight,
      },
      circuitBreaker: routing.circuitBreaker
        ? {
            consecutiveErrors: routing.circuitBreaker.consecutiveErrors,
            intervalSeconds: routing.circuitBreaker.intervalSeconds,
            baseEjectionTimeSeconds: routing.circuitBreaker.baseEjectionTimeSeconds,
            maxEjectionPercent: routing.circuitBreaker.maxEjectionPercent,
            minHealthPercent: routing.circuitBreaker.minHealthPercent,
          }
        : undefined,
      mTLSEnabled: routing.mTLSEnabled,
      isCanaryDeployment: routing.isCanaryDeployment(),
    };
  }
}

