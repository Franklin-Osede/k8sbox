import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class TrafficSplitDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  v1Weight: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  v2Weight: number;
}

export class CircuitBreakerConfigDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  consecutiveErrors?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  intervalSeconds?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  baseEjectionTimeSeconds?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxEjectionPercent?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minHealthPercent?: number;
}

export class CreateRoutingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty()
  trafficSplit: TrafficSplitDto;

  @ApiProperty({ required: false })
  @IsOptional()
  circuitBreaker?: CircuitBreakerConfigDto;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  mTLSEnabled?: boolean;
}

export class UpdateTrafficSplitDto {
  @ApiProperty()
  trafficSplit: TrafficSplitDto;
}

export class RoutingDto {
  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  trafficSplit: TrafficSplitDto;

  @ApiProperty()
  circuitBreaker?: CircuitBreakerConfigDto;

  @ApiProperty()
  mTLSEnabled: boolean;

  @ApiProperty()
  isCanaryDeployment: boolean;
}

