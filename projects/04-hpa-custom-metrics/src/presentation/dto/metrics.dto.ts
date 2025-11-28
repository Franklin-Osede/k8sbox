import { ApiProperty } from '@nestjs/swagger';

export class MetricsSummaryDto {
  @ApiProperty()
  requestsPerSecond: number;

  @ApiProperty()
  queueDepth: number;

  @ApiProperty()
  activeConnections: number;
}

export class ScalingDecisionDto {
  @ApiProperty()
  action: string;

  @ApiProperty()
  currentReplicas: number;

  @ApiProperty()
  targetReplicas: number;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  metricValue: number;

  @ApiProperty()
  threshold: number;

  @ApiProperty()
  shouldScale: boolean;
}


