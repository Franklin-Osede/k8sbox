import { Controller, Get, HttpCode, HttpStatus, HttpException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CheckLivenessUseCase } from '../../application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../application/use-cases/check-readiness.use-case';
import { CheckStartupUseCase } from '../../application/use-cases/check-startup.use-case';
import { HealthResponseDto } from '../dto/health-response.dto';
import { MetricsService } from '../../infrastructure/external/metrics.service';
import { HealthHistoryService } from '../../infrastructure/external/health-history.service';
import { CircuitBreakerService } from '../../infrastructure/external/circuit-breaker.service';
import { HealthHistoryResponseDto, CircuitBreakerStateDto } from '../dto/health-history.dto';

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
    private readonly healthHistoryService: HealthHistoryService,
    private readonly circuitBreakerService: CircuitBreakerService,
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

    // Record in history
    this.healthHistoryService.record(liveness, readiness, startup);

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

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get health check history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiResponse({ status: 200, description: 'Health check history', type: HealthHistoryResponseDto })
  async getHistory(@Query('limit') limit?: number): Promise<HealthHistoryResponseDto> {
    const historyLimit = limit ? parseInt(limit.toString(), 10) : 10;
    const history = this.healthHistoryService.getHistory(historyLimit);
    const stats = this.healthHistoryService.getUptimeStats();

    return {
      history: history.map((h) => ({
        timestamp: h.timestamp.toISOString(),
        liveness: {
          status: h.liveness.isHealthy ? 'healthy' : 'unhealthy',
          message: h.liveness.message,
        },
        readiness: {
          status: h.readiness.isHealthy ? 'ready' : 'not-ready',
          message: h.readiness.message,
        },
        startup: {
          status: h.startup.isHealthy ? 'started' : 'starting',
          message: h.startup.message,
        },
        overallStatus: h.overallStatus,
      })),
      stats,
    };
  }

  @Get('circuits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get circuit breaker states' })
  @ApiResponse({ status: 200, description: 'Circuit breaker states' })
  async getCircuitBreakers(): Promise<{ circuits: CircuitBreakerStateDto[] }> {
    const states = this.circuitBreakerService.getAllCircuitStates();
    const circuits: CircuitBreakerStateDto[] = Object.entries(states).map(([name, state]) => ({
      circuitName: name,
      state: state.state,
      failureCount: state.failureCount,
      lastFailureTime: state.lastFailureTime?.toISOString(),
      nextAttemptTime: state.nextAttemptTime?.toISOString(),
    }));

    return { circuits };
  }
}

