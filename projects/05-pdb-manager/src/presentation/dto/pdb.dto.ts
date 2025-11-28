import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum AvailabilityTypeDto {
  MIN_AVAILABLE = 'minAvailable',
  MAX_UNAVAILABLE = 'maxUnavailable',
}

export class CreatePDBDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({ enum: AvailabilityTypeDto })
  @IsEnum(AvailabilityTypeDto)
  availabilityType: AvailabilityTypeDto;

  @ApiProperty()
  @IsNumber()
  availabilityValue: number;

  @ApiProperty({ type: Object })
  @IsObject()
  @IsNotEmpty()
  selector: Record<string, string>;
}

export class PDBStatusDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  currentHealthy: number;

  @ApiProperty()
  desiredHealthy: number;

  @ApiProperty()
  disruptedPods: number;

  @ApiProperty()
  allowedDisruptions: number;

  @ApiProperty()
  availabilityPercentage: number;

  @ApiProperty()
  isHealthy: boolean;

  @ApiProperty()
  isViolated: boolean;
}

export class AvailabilitySummaryDto {
  @ApiProperty()
  totalPDBs: number;

  @ApiProperty()
  healthyPDBs: number;

  @ApiProperty()
  violatedPDBs: number;

  @ApiProperty()
  averageAvailability: number;
}

