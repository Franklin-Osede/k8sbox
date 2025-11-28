import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KubernetesStatefulSetService } from '../../infrastructure/external/kubernetes-statefulset.service';

/**
 * Controller: HealthController
 * Presentation layer controller for health check endpoints
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly statefulSetService: KubernetesStatefulSetService,
  ) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async liveness(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  async readiness(): Promise<{ status: string; timestamp: string; kubernetes: boolean }> {
    const kubernetesReady = this.statefulSetService !== null;

    if (!kubernetesReady) {
      throw new Error('Kubernetes service not ready');
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      kubernetes: kubernetesReady,
    };
  }

  @Get('startup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Startup probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application has started' })
  async startup(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'started',
      timestamp: new Date().toISOString(),
    };
  }
}

