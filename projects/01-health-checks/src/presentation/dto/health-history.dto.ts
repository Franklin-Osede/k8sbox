import { ApiProperty } from '@nestjs/swagger';

export class HealthHistoryItemDto {
  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  liveness: {
    status: string;
    message: string;
  };

  @ApiProperty()
  readiness: {
    status: string;
    message: string;
  };

  @ApiProperty()
  startup: {
    status: string;
    message: string;
  };

  @ApiProperty()
  overallStatus: string;
}

export class HealthHistoryResponseDto {
  @ApiProperty({ type: [HealthHistoryItemDto] })
  history: HealthHistoryItemDto[];

  @ApiProperty()
  stats: {
    totalChecks: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
    uptimePercentage: number;
  };
}

export class CircuitBreakerStateDto {
  @ApiProperty()
  circuitName: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  failureCount: number;

  @ApiProperty({ required: false })
  lastFailureTime?: string;

  @ApiProperty({ required: false })
  nextAttemptTime?: string;
}

