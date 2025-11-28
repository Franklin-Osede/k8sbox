import { Injectable } from '@nestjs/common';
import { ScalingDecisionVO, ScalingAction } from '../value-objects/scaling-decision.vo';
import { PrometheusMetricsService } from '../../infrastructure/external/prometheus-metrics.service';
import { AppLoggerService } from '../../infrastructure/external/logger.service';

/**
 * Domain Service: ScalingDomainService
 * Core business logic for scaling decisions
 */
@Injectable()
export class ScalingDomainService {
  private readonly scaleUpThreshold: number;
  private readonly scaleDownThreshold: number;
  private readonly minReplicas: number;
  private readonly maxReplicas: number;
  private readonly targetMetricValue: number;

  constructor(
    private readonly metricsService: PrometheusMetricsService,
    private readonly logger: AppLoggerService,
  ) {
    this.scaleUpThreshold = parseFloat(process.env.SCALE_UP_THRESHOLD || '100');
    this.scaleDownThreshold = parseFloat(process.env.SCALE_DOWN_THRESHOLD || '50');
    this.minReplicas = parseInt(process.env.MIN_REPLICAS || '2', 10);
    this.maxReplicas = parseInt(process.env.MAX_REPLICAS || '10', 10);
    this.targetMetricValue = parseFloat(process.env.TARGET_METRIC_VALUE || '80');
  }

  /**
   * Make scaling decision based on requests per second
   */
  decideScalingByRPS(currentReplicas: number): ScalingDecisionVO {
    const rps = this.metricsService.getRequestsPerSecond();
    return this.decideScaling(currentReplicas, rps, 'requests_per_second');
  }

  /**
   * Make scaling decision based on queue depth
   */
  decideScalingByQueueDepth(currentReplicas: number): ScalingDecisionVO {
    const queueDepth = this.metricsService.getQueueDepth();
    return this.decideScaling(currentReplicas, queueDepth, 'queue_depth');
  }

  /**
   * Make scaling decision based on active connections
   */
  decideScalingByConnections(currentReplicas: number): ScalingDecisionVO {
    const connections = this.metricsService.getActiveConnections();
    return this.decideScaling(currentReplicas, connections, 'active_connections');
  }

  /**
   * Core scaling decision logic
   */
  private decideScaling(
    currentReplicas: number,
    metricValue: number,
    metricName: string,
  ): ScalingDecisionVO {
    const targetValue = this.targetMetricValue;
    const ratio = metricValue / targetValue;

    // Calculate target replicas based on ratio
    let targetReplicas = Math.ceil(currentReplicas * ratio);

    // Enforce min/max bounds
    targetReplicas = Math.max(this.minReplicas, Math.min(this.maxReplicas, targetReplicas));

    if (metricValue > this.scaleUpThreshold && targetReplicas > currentReplicas) {
      this.logger.log(
        `Scale UP: ${metricName}=${metricValue}, replicas: ${currentReplicas} -> ${targetReplicas}`,
        'ScalingDomainService',
      );
      return ScalingDecisionVO.scaleUp(currentReplicas, targetReplicas, metricValue, this.scaleUpThreshold);
    }

    if (metricValue < this.scaleDownThreshold && targetReplicas < currentReplicas) {
      this.logger.log(
        `Scale DOWN: ${metricName}=${metricValue}, replicas: ${currentReplicas} -> ${targetReplicas}`,
        'ScalingDomainService',
      );
      return ScalingDecisionVO.scaleDown(currentReplicas, targetReplicas, metricValue, this.scaleDownThreshold);
    }

    return ScalingDecisionVO.noAction(currentReplicas, metricValue, targetValue);
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary(): {
    requestsPerSecond: number;
    queueDepth: number;
    activeConnections: number;
  } {
    return {
      requestsPerSecond: this.metricsService.getRequestsPerSecond(),
      queueDepth: this.metricsService.getQueueDepth(),
      activeConnections: this.metricsService.getActiveConnections(),
    };
  }
}


