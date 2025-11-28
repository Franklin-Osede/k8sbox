import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';

/**
 * Controller: HealthController
 * Presentation layer controller for health check endpoints
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly kubernetesPDBService: KubernetesPDBService,
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
    // Check if Kubernetes client is initialized
    const kubernetesReady = this.kubernetesPDBService !== null;

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

