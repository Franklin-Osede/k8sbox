import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrometheusMetricsService } from '../../infrastructure/external/prometheus-metrics.service';

/**
 * Controller: HealthController
 * Presentation layer controller for health check endpoints
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prometheusMetricsService: PrometheusMetricsService,
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
  async readiness(): Promise<{ status: string; timestamp: string; metrics: boolean }> {
    // Check if Prometheus metrics service is initialized
    const metricsReady = this.prometheusMetricsService !== null;

    if (!metricsReady) {
      throw new Error('Metrics service not ready');
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      metrics: metricsReady,
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

