import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GetMetricsUseCase } from '../../application/use-cases/get-metrics.use-case';
import { GetScalingDecisionUseCase } from '../../application/use-cases/get-scaling-decision.use-case';
import { PrometheusMetricsService } from '../../infrastructure/external/prometheus-metrics.service';
import { MetricsSummaryDto, ScalingDecisionDto } from '../dto/metrics.dto';

/**
 * Controller: MetricsController
 * Presentation layer controller for metrics endpoints
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly getMetricsUseCase: GetMetricsUseCase,
    private readonly getScalingDecisionUseCase: GetScalingDecisionUseCase,
    private readonly prometheusMetricsService: PrometheusMetricsService,
  ) {}

  @Get('prometheus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in text format' })
  async getPrometheusMetrics(): Promise<string> {
    return this.prometheusMetricsService.getMetrics();
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metrics summary' })
  @ApiResponse({ status: 200, description: 'Metrics summary', type: MetricsSummaryDto })
  async getSummary(): Promise<MetricsSummaryDto> {
    return this.getMetricsUseCase.execute();
  }

  @Get('scaling-decision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get scaling decision based on metrics' })
  @ApiQuery({ name: 'currentReplicas', type: Number, required: false, description: 'Current number of replicas' })
  @ApiQuery({ name: 'metricType', enum: ['rps', 'queue', 'connections'], required: false, description: 'Metric type to use' })
  @ApiResponse({ status: 200, description: 'Scaling decision', type: ScalingDecisionDto })
  async getScalingDecision(
    @Query('currentReplicas') currentReplicas?: number,
    @Query('metricType') metricType?: 'rps' | 'queue' | 'connections',
  ): Promise<ScalingDecisionDto> {
    const replicas = currentReplicas || 2;
    const decision = this.getScalingDecisionUseCase.execute(replicas, metricType || 'rps');

    return {
      action: decision.action,
      currentReplicas: decision.currentReplicas,
      targetReplicas: decision.targetReplicas,
      reason: decision.reason,
      metricValue: decision.metricValue,
      threshold: decision.threshold,
      shouldScale: decision.shouldScale(),
    };
  }

  @Post('simulate-load')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate load to trigger scaling' })
  @ApiResponse({ status: 200, description: 'Load simulated' })
  async simulateLoad(@Body() body: { rps?: number; queueDepth?: number; connections?: number }): Promise<{ message: string }> {
    if (body.rps !== undefined) {
      this.prometheusMetricsService.setRequestsPerSecond(body.rps);
    }
    if (body.queueDepth !== undefined) {
      this.prometheusMetricsService.setQueueDepth(body.queueDepth);
    }
    if (body.connections !== undefined) {
      this.prometheusMetricsService.setActiveConnections(body.connections);
    }

    return { message: 'Load simulated successfully' };
  }
}

