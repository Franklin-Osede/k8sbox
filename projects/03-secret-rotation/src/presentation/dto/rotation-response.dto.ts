import { ApiProperty } from '@nestjs/swagger';

export class RotationStatusDto {
  @ApiProperty()
  secretName: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  rotationCount: number;

  @ApiProperty({ required: false })
  lastRotationTime?: string;

  @ApiProperty({ required: false })
  nextRotationTime?: string;

  @ApiProperty()
  isHealthy: boolean;
}

export class RotationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: RotationStatusDto })
  rotation?: RotationStatusDto;
}

export class RotateAllResponseDto {
  @ApiProperty()
  totalDue: number;

  @ApiProperty()
  successful: number;

  @ApiProperty()
  failed: number;

  @ApiProperty({ type: [RotationStatusDto] })
  results: RotationStatusDto[];
}

