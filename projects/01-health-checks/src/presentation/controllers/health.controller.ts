import { Controller, Get, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckLivenessUseCase } from '../../application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../application/use-cases/check-readiness.use-case';
import { CheckStartupUseCase } from '../../application/use-cases/check-startup.use-case';
import { HealthResponseDto } from '../dto/health-response.dto';
import { MetricsService } from '../../infrastructure/external/metrics.service';

/**
 * Controller: HealthController
 * Presentation layer controller for health check endpoints
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly checkLivenessUseCase: CheckLivenessUseCase,
    private readonly checkReadinessUseCase: CheckReadinessUseCase,
    private readonly checkStartupUseCase: CheckStartupUseCase,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application is alive', type: HealthResponseDto })
  async liveness(): Promise<HealthResponseDto> {
    const startTime = Date.now();
    const result = await this.checkLivenessUseCase.execute();
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.recordHealthCheck('liveness', result.isHealthy ? 'healthy' : 'unhealthy', duration);

    return {
      status: result.isHealthy ? 'healthy' : 'unhealthy',
      message: result.message,
      timestamp: new Date().toISOString(),
      details: result.data,
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application is ready', type: HealthResponseDto })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async readiness(): Promise<HealthResponseDto> {
    const startTime = Date.now();
    const result = await this.checkReadinessUseCase.execute();
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.recordHealthCheck('readiness', result.isHealthy ? 'healthy' : 'unhealthy', duration);

    if (!result.isHealthy) {
      // Return 503 for unhealthy readiness
      throw new HttpException(
        {
          status: 'not-ready',
          message: result.message,
          timestamp: new Date().toISOString(),
          details: result.data,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: result.isHealthy ? 'ready' : 'not-ready',
      message: result.message,
      timestamp: new Date().toISOString(),
      details: result.data,
    };
  }

  @Get('startup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Startup probe endpoint' })
  @ApiResponse({ status: 200, description: 'Application has started', type: HealthResponseDto })
  @ApiResponse({ status: 503, description: 'Application is still starting' })
  async startup(): Promise<HealthResponseDto> {
    const startTime = Date.now();
    const result = await this.checkStartupUseCase.execute();
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.recordHealthCheck('startup', result.isHealthy ? 'healthy' : 'unhealthy', duration);

    return {
      status: result.isHealthy ? 'started' : 'starting',
      message: result.message,
      timestamp: new Date().toISOString(),
      details: result.data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete health check endpoint' })
  @ApiResponse({ status: 200, description: 'Complete health status', type: HealthResponseDto })
  async health(): Promise<HealthResponseDto> {
    const [liveness, readiness, startup] = await Promise.all([
      this.checkLivenessUseCase.execute(),
      this.checkReadinessUseCase.execute(),
      this.checkStartupUseCase.execute(),
    ]);

    const allHealthy = liveness.isHealthy && readiness.isHealthy && startup.isHealthy;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      message: allHealthy ? 'All checks passed' : 'Some checks failed',
      timestamp: new Date().toISOString(),
      details: {
        liveness: {
          status: liveness.isHealthy ? 'healthy' : 'unhealthy',
          message: liveness.message,
        },
        readiness: {
          status: readiness.isHealthy ? 'ready' : 'not-ready',
          message: readiness.message,
        },
        startup: {
          status: startup.isHealthy ? 'started' : 'starting',
          message: startup.message,
        },
      },
    };
  }
}

