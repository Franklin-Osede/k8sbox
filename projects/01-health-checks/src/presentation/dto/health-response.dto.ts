import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: HealthResponseDto
 * Response DTO for health check endpoints
 */
export class HealthResponseDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: 'Application is healthy' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ required: false })
  details?: Record<string, any>;
}

